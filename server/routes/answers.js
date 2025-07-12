const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { auth, userAuth, guestAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get answers for a question (Guest: View only)
router.get('/', guestAuth, async (req, res) => {
  try {
    const { questionId, author } = req.query;
    let query = {};

    if (questionId) {
      query.question = questionId;
    }

    if (author) {
      query.author = author;
    }

    const answers = await Answer.find(query)
      .populate('author', 'username reputation avatar')
      .populate({
        path: 'votes.upvotes votes.downvotes',
        select: 'username'
      })
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 });

    res.json({ answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new answer (User: Post permission required)
router.post('/', requirePermission('post'), async (req, res) => {
  try {
    const { content, questionId } = req.body;

    if (!content || !questionId) {
      return res.status(400).json({ message: 'Content and questionId are required' });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id
    });

    await answer.save();

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: question.author,        // Target user
        createdBy: req.user._id,       // Who created the notification
        type: 'answer',                // Notification type
        question: questionId,          // Related question
        title: 'New Answer',           // Required title
        message: `${req.user.username} answered your question "${question.title}"`  // Required message
      });
      await notification.save();

      // Send real-time notification
      const io = req.app.get('io');
      io.to(question.author.toString()).emit('notification', {
        message: `${req.user.username} answered your question`
      });
    }

    res.status(201).json({
      message: 'Answer created successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update answer (Admin: Moderate permission or owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.content = content;
    await answer.save();

    const updatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    res.json({
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete answer (Admin: Moderate permission or owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on answer (User: Vote permission required)
router.post('/:id/vote', requirePermission('vote'), async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const upvotes = answer.votes.upvotes;
    const downvotes = answer.votes.downvotes;

    if (voteType === 'upvote') {
      if (upvotes.includes(userId)) {
        // Remove upvote
        answer.votes.upvotes = upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add upvote and remove downvote if exists
        if (!upvotes.includes(userId)) {
          answer.votes.upvotes.push(userId);
        }
        answer.votes.downvotes = downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (voteType === 'downvote') {
      if (downvotes.includes(userId)) {
        // Remove downvote
        answer.votes.downvotes = downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add downvote and remove upvote if exists
        if (!downvotes.includes(userId)) {
          answer.votes.downvotes.push(userId);
        }
        answer.votes.upvotes = upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await answer.save();

    res.json({
      message: 'Vote updated successfully',
      voteCount: answer.voteCount
    });
  } catch (error) {
    console.error('Error voting on answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept answer (Admin: Moderate permission or question owner)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is admin or question owner
    if (req.user.role !== 'admin' && question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author or admin can accept answers' });
    }

    // Unaccept previously accepted answer
    await Answer.updateMany(
      { question: answer.question, isAccepted: true },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update question
    question.isAnswered = true;
    question.acceptedAnswer = answer._id;
    await question.save();

    // Create notification for answer author
    const notification = new Notification({
      userId: answer.author,
      createdBy: req.user._id,
      type: 'accept',
      question: answer.question,
      title: 'Answer Accepted',
      message: `${req.user.username} accepted your answer`
    });
    await notification.save();

    // Send real-time notification
    const io = req.app.get('io');
    io.to(answer.author.toString()).emit('notification', {
      message: `${req.user.username} accepted your answer`
    });

    res.json({
      message: 'Answer accepted successfully',
      answer
    });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 