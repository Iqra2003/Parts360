// db.js
// Simple MongoDB connection template

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spare-parts';

exports.connect = async () => {
    try {
        // Uncomment to connect to real MongoDB
        // await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        // console.log('MongoDB Connected');
        console.log('Mock Database Active (In-Memory)');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
};
