const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('📦 Database:', conn.connection.name);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Create initial admin user
    await createInitialAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

const createInitialAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const admin = await User.create({
        username: process.env.ADMIN_USERNAME || 'Manikandan',
        email: process.env.ADMIN_EMAIL || 'admin@silambam.com',
        password: process.env.ADMIN_PASSWORD || '7871096601',
        role: 'admin',
      });
      console.log('✅ Initial admin user created:', admin.username);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

module.exports = connectDB;
