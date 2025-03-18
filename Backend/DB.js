const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://devenzivanovic:MyBoy2002@cluster0.ecxmiby.mongodb.net/Leap?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

