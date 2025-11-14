require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:');
    console.error(err.message);
    process.exit(1);
  });
