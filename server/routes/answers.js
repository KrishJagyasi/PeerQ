const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', auth, async (req, res) => {
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

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: question.author,
        sender: req.user._id,
        type: 'answer',
        question: questionId,
        answer: answer._id,
        content: `${req.user.username} answered your question "${question.title}"`
      });
      await notification.save();

      // Send real-time notification
      const io = req.app.get('io');
      io.to(question.author.toString()).emit('notification', {
        type: 'answer',
        message: `${req.user.username} answered your question`,
        questionId,
        answerId: answer._id
      });
    }

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    res.status(201).json({
      message: 'Answer posted successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update answer
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If this was the accepted answer, unaccept it
    if (answer.isAccepted) {
      const question = await Question.findById(answer.question);
      if (question) {
        question.isAnswered = false;
        question.acceptedAnswer = null;
        await question.save();
      }
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept answer
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

    // Only question author can accept answers
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unaccept previously accepted answer if exists
    if (question.acceptedAnswer && question.acceptedAnswer.toString() !== answer._id.toString()) {
      const previousAnswer = await Answer.findById(question.acceptedAnswer);
      if (previousAnswer) {
        previousAnswer.isAccepted = false;
        await previousAnswer.save();
      }
    }

    // Accept this answer
    answer.isAccepted = true;
    question.isAnswered = true;
    question.acceptedAnswer = answer._id;

    await answer.save();
    await question.save();

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: 'accept',
        question: question._id,
        answer: answer._id,
        content: `${req.user.username} accepted your answer to "${question.title}"`
      });
      await notification.save();

      // Send real-time notification
      const io = req.app.get('io');
      io.to(answer.author.toString()).emit('notification', {
        type: 'accept',
        message: `${req.user.username} accepted your answer`,
        questionId: question._id,
        answerId: answer._id
      });
    }

    res.json({
      message: 'Answer accepted successfully',
      answer: await Answer.findById(answer._id).populate('author', 'username reputation avatar')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 