const axios = require('axios');

async function testChatbot() {
  try {
    console.log('Testing chatbot backend...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test chat endpoint (should return 401 without auth)
    console.log('\n2. Testing chat endpoint without auth...');
    try {
      await axios.get('http://localhost:5000/api/chat');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Chat endpoint properly protected (401 as expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    console.log('\n✅ Chatbot backend is running properly!');
    console.log('\nTo test the full functionality:');
    console.log('1. Make sure you have a .env file with GEMINI_API_KEY');
    console.log('2. Start the server: npm run server');
    console.log('3. Start the client: cd client && npm start');
    console.log('4. Log in to the application');
    console.log('5. Click the chatbot button on the right side');
    
  } catch (error) {
    console.error('❌ Error testing chatbot:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm run server');
    }
  }
}

testChatbot(); 