const axios = require('axios');

// Test script to create sample notifications
const BASE_URL = 'http://localhost:5000';

// Sample admin credentials (you'll need to create an admin user first)
const ADMIN_CREDENTIALS = {
  email: 'admin@peerq.com',
  password: 'admin123'
};

// Sample notifications to create
const sampleNotifications = [
  {
    title: 'Welcome to PeerQ!',
    message: 'Thank you for joining our community. Start asking questions and helping others!',
    type: 'info',
    userId: null // Broadcast to all users
  },
  {
    title: 'Special Discount Available',
    message: 'Get 20% off on premium features this week only!',
    type: 'discount',
    discountCode: 'WELCOME20',
    userId: null // Broadcast to all users
  },
  {
    title: 'New Feature: Rich Text Editor',
    message: 'You can now use rich text formatting in your questions and answers.',
    type: 'info',
    userId: null // Broadcast to all users
  },
  {
    title: 'Your question was answered',
    message: 'Someone has provided an answer to your question about React hooks.',
    type: 'answer',
    userId: null // This would normally target a specific user
  },
  {
    title: 'Someone mentioned you',
    message: 'User @john_doe mentioned you in a comment.',
    type: 'mention',
    userId: null // This would normally target a specific user
  }
];

async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    return response.data.token;
  } catch (error) {
    console.error('Failed to login as admin:', error.response?.data || error.message);
    throw error;
  }
}

async function createNotification(token, notification) {
  try {
    const response = await axios.post(`${BASE_URL}/api/notifications`, notification, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Created notification:', response.data.title);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create notification:', error.response?.data || error.message);
    throw error;
  }
}

async function testNotifications() {
  try {
    console.log('🔐 Logging in as admin...');
    const token = await loginAsAdmin();
    console.log('✅ Login successful');

    console.log('\n📝 Creating sample notifications...');
    
    for (const notification of sampleNotifications) {
      await createNotification(token, notification);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ All sample notifications created successfully!');
    console.log('\n📋 You can now test the notification system:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Start the client: cd client && npm start');
    console.log('3. Login as admin and visit /admin to manage notifications');
    console.log('4. Login as a regular user to see notifications in the navbar');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testNotifications(); 