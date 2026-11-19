const mongoose = require('mongoose');

const connectDB = async () => {
  try {
   const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_db';
console.log('Connecting to MongoDB...');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(` Error connecting to MongoDB (${err.message}).`);
    console.error(`👉 Tip: Ensure MongoDB server is running on port 27017 or check MONGO_URI in .env`);
    // Allow retrying or throw
    throw err;
  }
};

module.exports = connectDB;
