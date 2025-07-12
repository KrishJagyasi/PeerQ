import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [showChatList, setShowChatList] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping chat load');
        return;
      }

      const response = await axios.get('/api/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to use the chatbot');
        return;
      }

      const response = await axios.post('/api/chat', 
        { title: 'New Chat' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentChatId(response.data._id);
      setMessages([]);
      setShowChatList(false);
      loadChats();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const loadChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentChatId(chatId);
      setMessages(response.data.messages || []);
      setShowChatList(false);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      loadChats();
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const userMsgObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsgObj]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to use the chatbot');
        return;
      }

      // Create new chat if none exists
      if (!currentChatId) {
        const chatResponse = await axios.post('/api/chat', 
          { title: 'New Chat' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentChatId(chatResponse.data._id);
      }

      // Send message to backend
      const response = await axios.post(`/api/chat/${currentChatId}/messages`, 
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI response to messages
      const aiMsgObj = {
        role: 'assistant',
        content: response.data.aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsgObj]);

      // Update chat title if it's the first message
      if (response.data.chat.title !== 'New Chat') {
        loadChats();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Add error message
      const errorMsgObj = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsgObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };



  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-8 -translate-y-1/2 z-[9999] w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group border-4 border-white dark:border-gray-800"
        title="Chat with AI Assistant"
        style={{
          boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        {isOpen ? (
          <X size={32} className="transition-transform duration-300 drop-shadow-md" />
        ) : (
          <MessageCircle size={32} className="transition-transform duration-300 drop-shadow-md" />
        )}
        
        {/* AI Badge */}
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 animate-bounce">
          <span className="text-xs font-bold text-white drop-shadow-sm">AI</span>
        </div>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-blue-300 rounded-full animate-pulse opacity-10"></div>
          </>
        )}
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 opacity-75 blur-xl scale-75 group-hover:scale-90 transition-transform duration-300"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed top-1/2 right-32 -translate-y-1/2 z-[9998] w-[420px] h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 transform scale-100 backdrop-blur-sm"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-t-3xl backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700">
                <Bot size={24} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">AI Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Powered by Gemini ✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChatList(!showChatList)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Chat History"
              >
                {showChatList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat History Panel */}
          {showChatList && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat History</h4>
                  <button
                    onClick={createNewChat}
                    className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded transition-colors"
                    title="New Chat"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {chats.map((chat) => (
                    <div key={chat._id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <button
                        onClick={() => loadChat(chat._id)}
                        className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 truncate"
                      >
                        {chat.title}
                      </button>
                      <button
                        onClick={() => deleteChat(chat._id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors"
                        title="Delete Chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {chats.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                      No previous chats
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to AI Assistant
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    I'm here to help you with questions about the forum, coding, and more!
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      💡 Try asking about:
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>• "What are the recent questions?"</p>
                      <p>• "How do I ask a question?"</p>
                      <p>• "Show me recent answers"</p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              code: ({ children }) => (
                                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto">
                                  {children}
                                </pre>
                              ),
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
                                  {children}
                                </blockquote>
                              )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        <div className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          {!isMinimized && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                    rows="1"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105"
                  title="Send Message"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot; 