// db.js
// Simple MongoDB connection template

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spare-parts';

exports.connect = async () => {
    try {
        if (MONGO_URI && MONGO_URI !== 'mongodb://localhost:27017/spare-parts') {
            await mongoose.connect(MONGO_URI);
            console.log('MongoDB Connected');
        } else {
            console.log('No MONGO_URI provided. Mock Database Active (In-Memory)');
        }
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
};
