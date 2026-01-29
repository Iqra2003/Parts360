const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: String,
    category: String,
    stock: Number,
    description: String,
    image: String, // Base64 or URL (Primary/Thumbnail)
    images: [String], // Array of Base64 or IDs
    embedding: [Number], // Primary embedding
    embeddings: [[Number]], // Array of embeddings for each image in 'images'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Part', PartSchema);
