const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const geminiService = require('../services/geminiService');

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt messages');
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Get a specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      userId: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

// Create a new chat
router.post('/', auth, async (req, res) => {
  try {
    const { title = 'New Chat' } = req.body;
    
    const chat = new Chat({
      userId: req.user.id,
      title
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
});

// Send a message to the chatbot
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Find the chat
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      userId: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Add user message to chat
    chat.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });
    
    // Get forum context for better responses
    const forumContext = await getForumContext(message);
    
    // Generate AI response
    const conversationHistory = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const aiResponse = await geminiService.generateResponse(
      message.trim(),
      conversationHistory,
      forumContext
    );
    
    // Validate the response
    const validation = await geminiService.validateResponse(
      aiResponse.content,
      message.trim()
    );
    
    if (!validation.isValid) {
      console.warn('Response validation failed:', validation.reason);
    }
    
    // Add AI response to chat
    chat.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: aiResponse.timestamp
    });
    
    // Update chat title if it's the first message
    if (chat.messages.length === 2) {
      const titleResponse = await geminiService.generateResponse(
        `Generate a short title (max 50 characters) for this conversation: "${message.trim()}"`,
        [],
        null
      );
      
      if (titleResponse.success && titleResponse.content.length <= 50) {
        chat.title = titleResponse.content.replace(/[""]/g, '').trim();
      }
    }
    
    await chat.save();
    
    res.json({
      message: 'Message sent successfully',
      chat: chat,
      aiResponse: aiResponse.content,
      validation: validation
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Delete a chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ 
      _id: req.params.chatId, 
      userId: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

// Helper function to get forum context
async function getForumContext(userMessage) {
  try {
    const lowerMessage = userMessage.toLowerCase();
    let context = '';
    
    // Check if user is asking about questions
    if (lowerMessage.includes('question') || lowerMessage.includes('ask') || lowerMessage.includes('post')) {
      const recentQuestions = await Question.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'username');
      
      if (recentQuestions.length > 0) {
        context += 'Recent Questions:\n';
        recentQuestions.forEach(q => {
          context += `- ${q.title} (by ${q.author.username})\n`;
        });
        context += '\n';
      }
    }
    
    // Check if user is asking about answers
    if (lowerMessage.includes('answer') || lowerMessage.includes('reply') || lowerMessage.includes('response')) {
      const recentAnswers = await Answer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'username')
        .populate('question', 'title');
      
      if (recentAnswers.length > 0) {
        context += 'Recent Answers:\n';
        recentAnswers.forEach(a => {
          context += `- Answer to "${a.question.title}" (by ${a.author.username})\n`;
        });
        context += '\n';
      }
    }
    
    // Check if user is asking about users
    if (lowerMessage.includes('user') || lowerMessage.includes('member') || lowerMessage.includes('profile')) {
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username role');
      
      if (recentUsers.length > 0) {
        context += 'Recent Users:\n';
        recentUsers.forEach(u => {
          context += `- ${u.username} (${u.role})\n`;
        });
        context += '\n';
      }
    }
    
    return context;
  } catch (error) {
    console.error('Error getting forum context:', error);
    return '';
  }
}

module.exports = router; 