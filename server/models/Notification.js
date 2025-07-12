const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Target user (null for broadcast notifications)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for broadcast notifications
  },
  // Admin who created the notification
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Notification type
  type: {
    type: String,
    enum: ['info', 'discount', 'other', 'answer', 'comment', 'mention', 'vote', 'accept'],
    required: true
  },
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // Optional discount code for promotional notifications
  discountCode: {
    type: String,
    trim: true,
    maxlength: 50
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  // Legacy fields for backward compatibility
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

// Virtual for backward compatibility
notificationSchema.virtual('recipient').get(function() {
  return this.userId;
});

notificationSchema.virtual('sender').get(function() {
  return this.createdBy;
});

notificationSchema.virtual('content').get(function() {
  return `${this.title}: ${this.message}`;
});

module.exports = mongoose.model('Notification', notificationSchema); 