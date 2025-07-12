const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peerq', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@peerq.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin',
      reputation: 1000
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('Username: admin');
    console.log('Email: admin@peerq.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
};

setupAdmin(); 