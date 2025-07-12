const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions with pagination and filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', tag, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filtering
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { voteCount: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation avatar')
      .populate('acceptedAnswer')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + questions.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single question with answers
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar')
      .populate('acceptedAnswer')
      .populate({
        path: 'votes.upvotes votes.downvotes',
        select: 'username'
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    // Get answers
    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'username reputation avatar')
      .populate({
        path: 'votes.upvotes votes.downvotes',
        select: 'username'
      })
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 });

    res.json({ question, answers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new question
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const question = new Question({
      title,
      description,
      tags: tags || [],
      author: req.user._id
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar');

    res.status(201).json({
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update question
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    question.title = title || question.title;
    question.description = description || question.description;
    question.tags = tags || question.tags;

    await question.save();

    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: req.params.id });

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const upvotes = question.votes.upvotes;
    const downvotes = question.votes.downvotes;

    if (voteType === 'upvote') {
      if (upvotes.includes(userId)) {
        // Remove upvote
        question.votes.upvotes = upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add upvote and remove downvote if exists
        if (!upvotes.includes(userId)) {
          question.votes.upvotes.push(userId);
        }
        question.votes.downvotes = downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (voteType === 'downvote') {
      if (downvotes.includes(userId)) {
        // Remove downvote
        question.votes.downvotes = downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add downvote and remove upvote if exists
        if (!downvotes.includes(userId)) {
          question.votes.downvotes.push(userId);
        }
        question.votes.upvotes = upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await question.save();

    res.json({
      message: 'Vote updated successfully',
      voteCount: question.voteCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 