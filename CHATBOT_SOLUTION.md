# 🤖 PeerQ Chatbot Implementation Guide

## Overview

The PeerQ chatbot is a fully functional AI assistant integrated into the forum platform. It features a floating chat button that opens a modern chat interface powered by Google's Gemini AI.

## ✨ Features

- **Floating Chat Button**: Always visible, positioned in the bottom-right corner
- **Modern UI**: Beautiful gradient design with smooth animations
- **Chat History**: Save and manage multiple conversations
- **Real-time AI Responses**: Powered by Google Gemini AI
- **Markdown Support**: Rich text formatting in responses
- **Dark Mode Support**: Seamless theme integration
- **Mobile Responsive**: Works perfectly on all devices
- **Authentication Required**: Secure user-based chat sessions

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Run the setup script
setup-chatbot.bat

# Or manually create .env file in server directory
cp env.example server/.env
```

### 2. Configure Environment Variables

Edit `server/.env` and add:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/peerq

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

**Get your Gemini API key from:** https://makersuite.google.com/app/apikey

### 3. Start the Application

```bash
# Terminal 1: Start server
cd server
npm start

# Terminal 2: Start client
cd client
npm start
```

### 4. Access the Chatbot

1. Open http://localhost:3000
2. Register or login to your account
3. Look for the floating blue chat button (bottom-right corner)
4. Click to open the chatbot interface
5. Start chatting with the AI assistant!

## 🧪 Testing

Run the automated test suite:

```bash
node test-chatbot.js
```

This will test:
- Authentication
- Chat creation
- Message sending
- AI responses
- Chat history

## 🏗️ Architecture

### Frontend Components

- **Chatbot.js**: Main chatbot component with floating button and chat window
- **App.js**: Integrates chatbot into the main application
- **App.css**: Custom styling for chatbot animations and responsive design

### Backend Services

- **chat.js**: REST API routes for chat management
- **geminiService.js**: AI integration with Google Gemini
- **Chat.js**: MongoDB model for chat data persistence

### Key Features

#### Floating Button
```jsx
<button
  onClick={() => setIsOpen(!isOpen)}
  className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
>
  {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
    <span className="text-xs font-bold text-white">AI</span>
  </div>
</button>
```

#### Chat Window
```jsx
{isOpen && (
  <div className="fixed bottom-24 right-6 z-[9998] w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
    {/* Chat interface */}
  </div>
)}
```

## 🔧 API Endpoints

### Authentication Required
All chat endpoints require a valid JWT token in the Authorization header.

```javascript
headers: { Authorization: `Bearer ${token}` }
```

### Available Endpoints

- `GET /api/chat` - Get user's chat history
- `POST /api/chat` - Create new chat
- `GET /api/chat/:chatId` - Get specific chat with messages
- `POST /api/chat/:chatId/messages` - Send message to AI
- `DELETE /api/chat/:chatId` - Delete chat

### Example Usage

```javascript
// Create new chat
const chat = await axios.post('/api/chat', { title: 'New Chat' }, {
  headers: { Authorization: `Bearer ${token}` }
});

// Send message
const response = await axios.post(`/api/chat/${chatId}/messages`, {
  message: 'Hello, how can you help me?'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

console.log(response.data.aiResponse);
```

## 🎨 Customization

### Styling

The chatbot uses Tailwind CSS classes and custom CSS animations. Key styling features:

- **Gradient backgrounds**: Modern blue gradients
- **Smooth animations**: 300ms transitions
- **Hover effects**: Scale and shadow changes
- **Dark mode support**: Automatic theme switching
- **Responsive design**: Mobile-optimized

### Colors and Themes

```css
/* Light mode */
--color-primary: #3b82f6;
--color-primary-hover: #2563eb;

/* Dark mode */
--color-primary: #60a5fa;
--color-primary-hover: #3b82f6;
```

### Animations

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.4; }
}

.chatbot-button:hover {
  transform: scale(1.1);
  box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.6);
}
```

## 🔒 Security Features

- **Authentication Required**: All chat operations require login
- **User Isolation**: Users can only access their own chats
- **Input Validation**: Message content is validated
- **Rate Limiting**: Built-in protection against spam
- **Safe AI Responses**: Content filtering and validation

## 📱 Mobile Support

The chatbot is fully responsive:

```css
@media (max-width: 640px) {
  .chatbot-window {
    width: calc(100vw - 3rem);
    right: 1.5rem;
    left: 1.5rem;
  }
  
  .chatbot-button {
    width: 3.5rem;
    height: 3.5rem;
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Chatbot not showing**
   - Check if user is logged in
   - Verify server is running on port 5000
   - Check browser console for errors

2. **AI not responding**
   - Verify GEMINI_API_KEY is set correctly
   - Check server logs for API errors
   - Ensure internet connection

3. **Messages not saving**
   - Check MongoDB connection
   - Verify JWT token is valid
   - Check server logs for database errors

### Debug Commands

```bash
# Test API endpoints
node test-chatbot.js

# Check server logs
cd server && npm start

# Check client logs
cd client && npm start
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-production-gemini-key
CLIENT_URL=https://your-domain.com
```

### Build Commands

```bash
# Build client
cd client && npm run build

# Start production server
cd server && npm start
```

## 📈 Performance

- **Lazy Loading**: Chat history loads on demand
- **Message Pagination**: Efficient memory usage
- **Optimized Queries**: Indexed database operations
- **Caching**: Response caching for common queries

## 🔮 Future Enhancements

- [ ] Voice input/output
- [ ] File upload support
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Custom AI models
- [ ] Real-time collaboration

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Run the test suite: `node test-chatbot.js`
3. Check server and client logs
4. Verify environment variables

---

**Happy Chatting! 🤖✨** 