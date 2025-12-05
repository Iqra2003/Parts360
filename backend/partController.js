const embeddingService = require('./embeddingService');
const Part = require('./models/Part');

// Initial categories
let categoriesMemory = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body'];

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
        const { name, number, category, stock, description, image } = req.body;

        // 1. Generate Embedding
        const embedding = await embeddingService.generateImageEmbedding(image);

        // 2. Save to Database
        const newPart = new Part({
            id: Date.now().toString(),
            name,
            number,
            category,
            stock: parseInt(stock),
            description,
            image, // In production, store image in S3/Cloudinary and save URL here
            embedding
        });

        await newPart.save();

        // 3. Update Categories if new
        if (!categoriesMemory.includes(category)) {
            categoriesMemory.push(category);
        }

        res.status(201).json({ message: 'Part added successfully', partId: newPart.id });
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
        // Note: For large datasets, use MongoDB Vector Search (Atlas Search)
        const allParts = await Part.find({});

        // 3. Calculate Similarity
        const matches = allParts.map(part => {
            const score = cosineSimilarity(queryEmbedding, part.embedding);
            return {
                ...part.toObject(),
                score: score,
                accuracy: Math.round(score * 100) // Convert to percentage
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
        const parts = await Part.find({}).select('-embedding');
        res.json(parts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch parts' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalParts = await Part.countDocuments({});
        const lowStock = await Part.countDocuments({ stock: { $lt: 10 } });

        // Get 5 most recent parts, excluding heavy fields
        const recentParts = await Part.find({})
            .select('-image -embedding')
            .sort({ createdAt: -1 })
            .limit(5);

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
        const { name, number, category, stock, description, image } = req.body;

        const updateData = {
            name,
            number,
            category,
            stock: parseInt(stock),
            description
        };

        // Only update image and embedding if a new image is provided
        if (image) {
            updateData.image = image;
            updateData.embedding = await embeddingService.generateImageEmbedding(image);
        }

        const updatedPart = await Part.findOneAndUpdate(
            { id: id },
            updateData,
            { new: true }
        );

        if (!updatedPart) {
            return res.status(404).json({ error: 'Part not found' });
        }

        // Update categories if new
        if (!categoriesMemory.includes(category)) {
            categoriesMemory.push(category);
        }

        res.json({ message: 'Part updated successfully', part: updatedPart });
    } catch (error) {
        console.error('Error updating part:', error);
        res.status(500).json({ error: 'Failed to update part' });
    }
};

exports.deletePart = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPart = await Part.findOneAndDelete({ id: id });

        if (!deletedPart) {
            return res.status(404).json({ error: 'Part not found' });
        }

        res.json({ message: 'Part deleted successfully' });
    } catch (error) {
        console.error('Error deleting part:', error);
        res.status(500).json({ error: 'Failed to delete part' });
    }
};
