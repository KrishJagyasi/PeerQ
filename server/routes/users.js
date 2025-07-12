const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Get user's questions
router.get('/questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ message: 'Failed to fetch user questions' });
  }
});

// Get user's answers
router.get('/answers', auth, async (req, res) => {
  try {
    const answers = await Answer.find({ author: req.user.id })
      .populate('author', 'username avatar')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ answers });
  } catch (error) {
    console.error('Error fetching user answers:', error);
    res.status(500).json({ message: 'Failed to fetch user answers' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio !== undefined ? bio : user.bio;
    user.avatar = avatar || user.avatar;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

module.exports = router; 