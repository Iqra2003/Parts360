const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: String,
    category: String,
    stock: Number,
    description: String,
    image: String, // Base64 or URL
    embedding: [Number],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Part', PartSchema);
