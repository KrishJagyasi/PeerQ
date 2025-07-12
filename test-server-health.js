const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function checkServerHealth() {
  console.log('🏥 Checking server health...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test if server is responsive
    console.log('\n2. Testing server responsiveness...');
    const startTime = Date.now();
    await axios.get(`${BASE_URL}/api/health`);
    const responseTime = Date.now() - startTime;
    console.log(`✅ Server response time: ${responseTime}ms`);
    
    // Test CORS
    console.log('\n3. Testing CORS configuration...');
    try {
      await axios.get(`${BASE_URL}/api/health`, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      console.log('✅ CORS is properly configured');
    } catch (error) {
      console.log('⚠️ CORS might have issues:', error.message);
    }
    
    console.log('\n🎉 Server is healthy and ready!');
    return true;
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running on http://localhost:5000');
      console.log('\nTo start the server:');
      console.log('cd server && npm start');
    } else if (error.response) {
      console.error('❌ Server responded with error:', error.response.status, error.response.statusText);
    } else {
      console.error('❌ Server health check failed:', error.message);
    }
    return false;
  }
}

// Run health check if this file is executed directly
if (require.main === module) {
  checkServerHealth().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkServerHealth }; 