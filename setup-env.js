const fs = require('fs');
const path = require('path');

console.log('🔧 PeerQ Environment Setup');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/stackit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration (for React app)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit the .env file with your actual values');
console.log('2. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('3. Set up your MongoDB database');
console.log('4. Generate a secure JWT secret');
console.log('\n💡 For Gemini API:');
console.log('   - Visit https://makersuite.google.com/app/apikey');
console.log('   - Create a new API key');
console.log('   - Replace "your-gemini-api-key-here" in .env');
console.log('\n🚀 The chatbot will work with fallback responses even without the API key!'); 