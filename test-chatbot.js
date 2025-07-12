const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Test token storage
let authToken = null;

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAuth = async () => {
  console.log('🔐 Testing authentication...');
  
  try {
    // Register test user
    const registerResponse = await makeAuthRequest('POST', '/api/auth/register', TEST_USER);
    console.log('✅ Registration successful:', registerResponse.message);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding with login...');
    } else {
      throw error;
    }
  }
  
  // Login
  const loginResponse = await makeAuthRequest('POST', '/api/auth/login', TEST_USER);
  authToken = loginResponse.token;
  console.log('✅ Login successful');
};

const testChatCreation = async () => {
  console.log('\n💬 Testing chat creation...');
  
  const chatResponse = await makeAuthRequest('POST', '/api/chat', { title: 'Test Chat' });
  console.log('✅ Chat created:', chatResponse._id);
  return chatResponse._id;
};

const testMessageSending = async (chatId) => {
  console.log('\n📝 Testing message sending...');
  
  const messageResponse = await makeAuthRequest('POST', `/api/chat/${chatId}/messages`, {
    message: 'Hello, this is a test message!'
  });
  
  console.log('✅ Message sent successfully');
  console.log('🤖 AI Response:', messageResponse.aiResponse.substring(0, 100) + '...');
  return messageResponse;
};

const testChatRetrieval = async (chatId) => {
  console.log('\n📋 Testing chat retrieval...');
  
  const chatResponse = await makeAuthRequest('GET', `/api/chat/${chatId}`);
  console.log('✅ Chat retrieved successfully');
  console.log(`📊 Messages count: ${chatResponse.messages.length}`);
  return chatResponse;
};

const testChatList = async () => {
  console.log('\n📚 Testing chat list...');
  
  const chatsResponse = await makeAuthRequest('GET', '/api/chat');
  console.log('✅ Chat list retrieved successfully');
  console.log(`📊 Total chats: ${chatsResponse.length}`);
  return chatsResponse;
};

const testHealthCheck = async () => {
  console.log('\n🏥 Testing health check...');
  
  try {
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting chatbot API tests...\n');
  
  try {
    await testHealthCheck();
    await testAuth();
    const chatId = await testChatCreation();
    await testMessageSending(chatId);
    await testChatRetrieval(chatId);
    await testChatList();
    
    console.log('\n🎉 All tests passed! The chatbot API is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testAuth,
  testChatCreation,
  testMessageSending,
  testChatRetrieval,
  testChatList,
  testHealthCheck,
  runTests
}; 