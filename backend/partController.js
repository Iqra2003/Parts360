const mongoose = require('mongoose');
const embeddingService = require('./embeddingService');
const Part = require('./models/Part');

// Initial categories
let categoriesMemory = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body'];

// IN-MEMORY STORAGE FALLBACK
// Used when MongoDB is not connected
let MEMORY_PARTS = [];

// Helper to check DB status
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Calculate Cosine Similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - Similarity score (-1 to 1)
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

exports.addPart = async (req, res) => {
    try {
        const { name, number, category, stock, description, images } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        // 1. Generate Embeddings for ALL images
        const embeddingPromises = images.map(img => embeddingService.generateImageEmbedding(img));
        const embeddings = await Promise.all(embeddingPromises);

        // 2. Save
        const partData = {
            id: Date.now().toString(),
            name,
            number,
            category,
            stock: parseInt(stock),
            description,
            image: images[0],      // Primary image
            images: images,        // All images
            embedding: embeddings[0], // Primary embedding
            embeddings: embeddings,   // All embeddings
            createdAt: new Date()
        };

        if (isDbConnected()) {
            const newPart = new Part(partData);
            await newPart.save();
        } else {
            console.warn('MongoDB not connected. Saving part to In-Memory storage.');
            MEMORY_PARTS.push(partData);
        }

        // 3. Update Categories
        if (!categoriesMemory.includes(category)) {
            categoriesMemory.push(category);
        }

        res.status(201).json({ message: 'Part added successfully', partId: partData.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add part' });
    }
};

exports.matchPart = async (req, res) => {
    try {
        const { image } = req.body;

        // 1. Generate Embedding for Query Image
        const queryEmbedding = await embeddingService.generateImageEmbedding(image);

        // 2. Fetch all parts
        let allParts;
        if (isDbConnected()) {
            allParts = await Part.find({});
        } else {
            allParts = MEMORY_PARTS;
        }

        // 3. Calculate Similarity
        const matches = allParts.map(part => {
            let maxScore = -1;
            const p = isDbConnected() ? part.toObject() : part;

            // Check if we have the new 'embeddings' array
            // Handle both Mongoose Doc and Plain Object
            const partEmbeddings = p.embeddings || (p.embedding ? [p.embedding] : []);

            if (partEmbeddings && partEmbeddings.length > 0) {
                // Find the best match among all images for this part
                for (const storedEmbedding of partEmbeddings) {
                    const score = cosineSimilarity(queryEmbedding, storedEmbedding);
                    if (score > maxScore) maxScore = score;
                }
            }

            // Fallback if maxScore is still -1 (no embeddings found)
            if (maxScore === -1 && p.embedding) {
                maxScore = cosineSimilarity(queryEmbedding, p.embedding);
            }

            return {
                ...p,
                score: maxScore,
                accuracy: Math.round(maxScore * 100)
            };
        });

        // 4. Sort by Score (Descending) and take top 3
        matches.sort((a, b) => b.score - a.score);
        const topMatches = matches.slice(0, 3);

        res.json({ matches: topMatches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to match part' });
    }
};

exports.getAllParts = async (req, res) => {
    try {
        if (isDbConnected()) {
            const parts = await Part.find({}).select('-embedding -embeddings');
            res.json(parts);
        } else {
            // Return memory parts without heavy embeddings
            // const cleanParts = MEMORY_PARTS.map(({ embedding, embeddings, ...rest }) => rest);
            // Actually, for in-memory it doesn't matter much to strip fields for performance, but good for bandwidth
            const cleanParts = MEMORY_PARTS.map(p => {
                const copy = { ...p };
                delete copy.embedding;
                delete copy.embeddings;
                return copy;
            });
            res.json(cleanParts);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch parts' });
    }
};

exports.getStats = async (req, res) => {
    try {
        let totalParts, lowStock, recentParts;

        if (isDbConnected()) {
            totalParts = await Part.countDocuments({});
            lowStock = await Part.countDocuments({ stock: { $lt: 10 } });
            recentParts = await Part.find({})
                .select('-image -images -embedding -embeddings')
                .sort({ createdAt: -1 })
                .limit(5);
        } else {
            totalParts = MEMORY_PARTS.length;
            lowStock = MEMORY_PARTS.filter(p => p.stock < 10).length;
            recentParts = [...MEMORY_PARTS]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(p => {
                    const copy = { ...p };
                    delete copy.image;
                    delete copy.images;
                    delete copy.embedding;
                    delete copy.embeddings;
                    return copy;
                });
        }

        res.json({
            totalParts,
            lowStock,
            recentParts
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

exports.getCategories = (req, res) => {
    res.json(categoriesMemory);
};

exports.updatePart = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, number, category, stock, description, images } = req.body;

        const updateData = {
            name,
            number,
            category,
            stock: parseInt(stock),
            description
        };

        // Only update images and embeddings if new images are provided
        if (images && Array.isArray(images) && images.length > 0) {
            updateData.images = images;
            updateData.image = images[0]; // Update primary

            const embeddingPromises = images.map(img => embeddingService.generateImageEmbedding(img));
            const embeddings = await Promise.all(embeddingPromises);

            updateData.embeddings = embeddings;
            updateData.embedding = embeddings[0]; // Update primary
        }

        if (isDbConnected()) {
            const updatedPart = await Part.findOneAndUpdate(
                { id: id },
                updateData,
                { new: true }
            );
            if (!updatedPart) return res.status(404).json({ error: 'Part not found' });
            res.json({ message: 'Part updated successfully', part: updatedPart });
        } else {
            const index = MEMORY_PARTS.findIndex(p => p.id === id);
            if (index === -1) return res.status(404).json({ error: 'Part not found' });

            MEMORY_PARTS[index] = { ...MEMORY_PARTS[index], ...updateData };
            res.json({ message: 'Part updated successfully', part: MEMORY_PARTS[index] });
        }

        // Update categories
        if (!categoriesMemory.includes(category)) {
            categoriesMemory.push(category);
        }
    } catch (error) {
        console.error('Error updating part:', error);
        res.status(500).json({ error: 'Failed to update part' });
    }
};

exports.deletePart = async (req, res) => {
    try {
        const { id } = req.params;

        if (isDbConnected()) {
            const deletedPart = await Part.findOneAndDelete({ id: id });
            if (!deletedPart) return res.status(404).json({ error: 'Part not found' });
        } else {
            const index = MEMORY_PARTS.findIndex(p => p.id === id);
            if (index === -1) return res.status(404).json({ error: 'Part not found' });
            MEMORY_PARTS.splice(index, 1);
        }

        res.json({ message: 'Part deleted successfully' });
    } catch (error) {
        console.error('Error deleting part:', error);
        res.status(500).json({ error: 'Failed to delete part' });
    }
};
