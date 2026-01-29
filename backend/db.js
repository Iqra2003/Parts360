// db.js
// Simple MongoDB connection template

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spare-parts';

exports.connect = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected to', MONGO_URI);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        console.log('Falling back to in-memory mode not implemented: Please ensure MongoDB is running.');
    }
};
