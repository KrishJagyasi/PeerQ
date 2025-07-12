const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth, userAuth, adminAuth, guestAuth, adminOrOwner, requirePermission } = require('../middleware/auth');

// Get all questions with pagination and search (Guest: View only)
router.get('/', guestAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';
    const tag = req.query.tag || '';

    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { voteCount: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    
    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('author', 'username avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      questions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get popular tags (Guest: View only)
router.get('/tags/popular', guestAuth, async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ message: 'Failed to fetch popular tags' });
  }
});

// Search tags (Guest: View only)
router.get('/tags/search', guestAuth, async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.json({ tags: [] });
    }

    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $regex: query, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const tagNames = tags.map(tag => tag._id);
    res.json({ tags: tagNames });
  } catch (error) {
    console.error('Error searching tags:', error);
    res.status(500).json({ message: 'Failed to search tags' });
  }
});

// Get single question (Guest: View only)
router.get('/:id', guestAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar')
      .lean();

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Create question (User: Post permission required)
router.post('/', requirePermission('post'), async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const question = new Question({
      title,
      description,
      tags: tags || [],
      author: req.user.id
    });

    await question.save();
    await question.populate('author', 'username avatar');

    res.status(201).json({ question });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
});

// Vote on question (User: Vote permission required)
router.post('/:id/vote', requirePermission('vote'), async (req, res) => {
  try {
    const { voteType } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Initialize votes if not exists
    if (!question.votes) {
      question.votes = { upvotes: [], downvotes: [] };
    }

    const userId = req.user.id;
    const upvotes = question.votes.upvotes || [];
    const downvotes = question.votes.downvotes || [];

    if (voteType === 'upvote') {
      // Remove from downvotes if exists
      const downvoteIndex = downvotes.indexOf(userId);
      if (downvoteIndex > -1) {
        downvotes.splice(downvoteIndex, 1);
      }

      // Toggle upvote
      const upvoteIndex = upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        upvotes.splice(upvoteIndex, 1);
      } else {
        upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      // Remove from upvotes if exists
      const upvoteIndex = upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        upvotes.splice(upvoteIndex, 1);
      }

      // Toggle downvote
      const downvoteIndex = downvotes.indexOf(userId);
      if (downvoteIndex > -1) {
        downvotes.splice(downvoteIndex, 1);
      } else {
        downvotes.push(userId);
      }
    }

    question.votes = { upvotes, downvotes };
    question.voteCount = upvotes.length - downvotes.length;
    await question.save();

    res.json({ voteCount: question.voteCount });
  } catch (error) {
    console.error('Error voting on question:', error);
    res.status(500).json({ message: 'Failed to vote on question' });
  }
});

// Update question (Admin: Moderate permission or owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, tags } = req.body;
    question.title = title || question.title;
    question.description = description || question.description;
    question.tags = tags || question.tags;

    await question.save();
    await question.populate('author', 'username avatar');

    res.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
});

// Delete question (Admin: Moderate permission or owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await question.remove();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

// Admin routes for question management (Admin: Moderate permission required)
router.get('/admin/all', requirePermission('moderate'), async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Comprehensive search endpoint (Guest: View only)
router.get('/search/comprehensive', guestAuth, async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (query.length < 2) {
      return res.json({ 
        questions: [], 
        answers: [], 
        recommendations: [],
        totalResults: 0 
      });
    }

    // Search in questions
    const questionQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    // Search in answers
    const answerQuery = {
      content: { $regex: query, $options: 'i' }
    };

    // Execute searches in parallel
    const [questions, answers] = await Promise.all([
      Question.find(questionQuery)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Answer.find(answerQuery)
        .populate('author', 'username avatar')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    // Generate recommendations based on search query
    const recommendations = await generateSearchRecommendations(query);

    // Calculate total results
    const totalResults = questions.length + answers.length;

    res.json({
      questions,
      answers,
      recommendations,
      totalResults,
      query
    });
  } catch (error) {
    console.error('Error in comprehensive search:', error);
    res.status(500).json({ message: 'Failed to perform search' });
  }
});

// Generate search recommendations
async function generateSearchRecommendations(query) {
  try {
    // Get popular tags that match the query
    const matchingTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $regex: query, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent questions with similar tags
    const recentQuestions = await Question.find({
      tags: { $in: matchingTags.map(tag => tag._id) }
    })
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    // Get trending questions (most viewed in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingQuestions = await Question.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('author', 'username avatar')
    .sort({ views: -1 })
    .limit(3)
    .lean();

    return {
      matchingTags: matchingTags.map(tag => ({ name: tag._id, count: tag.count })),
      recentQuestions,
      trendingQuestions
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      matchingTags: [],
      recentQuestions: [],
      trendingQuestions: []
    };
  }
}

module.exports = router; 