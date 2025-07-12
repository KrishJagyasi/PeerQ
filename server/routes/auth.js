const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Register as guest (no email/password required)
router.post('/register/guest', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create guest user
    const user = new User({
      username,
      email: `guest_${Date.now()}@peerq.com`, // Temporary email for guest
      password: 'guest_password_' + Math.random().toString(36).substr(2, 9), // Temporary password
      role: 'guest'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Longer expiration for guest users
    );

    res.status(201).json({
      message: 'Guest account created successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register as regular user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validate role
    const validRoles = ['user', 'guest'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be "user" or "guest"' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        reputation: req.user.reputation,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upgrade guest to regular user
router.post('/upgrade-guest', auth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.user.role !== 'guest') {
      return res.status(400).json({ message: 'Only guest users can upgrade their account' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update user with email and password
    req.user.email = email;
    req.user.password = password;
    req.user.role = 'user';
    await req.user.save();

    // Generate new token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Account upgraded successfully',
      token,
      user: {
        id: req.user._id,
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        reputation: req.user.reputation,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes for user management
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 