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
        const parts = await Part.find({});
        res.json(parts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch parts' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const parts = await Part.find({});
        const totalParts = parts.length;
        const lowStock = parts.filter(p => p.stock < 10).length;

        // Get 5 most recent parts
        const recentParts = [...parts]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        res.json({
            totalParts,
            lowStock,
            recentParts
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

exports.getCategories = (req, res) => {
    res.json(categoriesMemory);
};
