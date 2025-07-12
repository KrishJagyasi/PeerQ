const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/notifications - Create notification (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { userId, title, message, discountCode, type } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ 
        message: 'Title, message, and type are required' 
      });
    }

    // Validate notification type
    const validTypes = ['info', 'discount', 'other', 'answer', 'comment', 'mention', 'vote', 'accept'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid notification type' 
      });
    }

    // If userId is provided, verify user exists
    if (userId) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }
    }

    // Create notification
    const notification = new Notification({
      userId: userId || null, // null for broadcast notifications
      createdBy: req.user._id,
      title,
      message,
      discountCode,
      type
    });

    await notification.save();

    // Populate createdBy field for response
    await notification.populate('createdBy', 'username avatar');

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/notifications - Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    // Build query: user's personal notifications + broadcast notifications
    const query = {
      $or: [
        { userId: req.user._id },
        { userId: null } // Broadcast notifications
      ]
    };

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('createdBy', 'username avatar')
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + notifications.length < total,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user can access this notification
    const canAccess = !notification.userId || 
                     notification.userId.toString() === req.user._id.toString() ||
                     notification.userId === null; // Broadcast notifications

    if (!canAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PATCH /api/notifications/:id/unread - Mark as unread (Admin only)
router.patch('/:id/unread', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = false;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark as unread error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// DELETE /api/notifications/:id - Delete notification (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/notifications/users/all - Get all users (Admin only)
router.get('/users/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/notifications/admin/all - Get all notifications (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, userId, isRead } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('createdBy', 'username avatar')
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + notifications.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PATCH /api/notifications/:id - Update notification (Admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { title, message, discountCode, type } = req.body;

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update fields
    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (discountCode !== undefined) notification.discountCode = discountCode;
    if (type !== undefined) {
      const validTypes = ['info', 'discount', 'other', 'answer', 'comment', 'mention', 'vote', 'accept'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid notification type' });
      }
      notification.type = type;
    }

    await notification.save();
    await notification.populate('createdBy', 'username avatar');
    await notification.populate('userId', 'username avatar');

    res.json(notification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Legacy endpoints for backward compatibility
// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const query = {
      $or: [
        { userId: req.user._id },
        { userId: null }
      ],
      isRead: false
    };

    const count = await Notification.countDocuments(query);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const query = {
      $or: [
        { userId: req.user._id },
        { userId: null }
      ],
      isRead: false
    };

    await Notification.updateMany(query, { isRead: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router; 