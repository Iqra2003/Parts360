const embeddingService = require('./embeddingService');
const db = require('./db');

// In-memory store for demonstration if MongoDB is not connected
let partsMemory = [];

/**
 * Calculate Cosine Similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - Similarity score (-1 to 1)
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
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

// Initial categories
let categoriesMemory = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body'];

exports.addPart = async (req, res) => {
    try {
        const { name, number, category, stock, description, image } = req.body;

        // 1. Generate Embedding
        const embedding = await embeddingService.generateImageEmbedding(image);

        const newPart = {
            id: Date.now().toString(),
            name,
            number,
            category,
            stock: parseInt(stock),
            description,
            image, // In production, store image in S3/Cloudinary and save URL here
            embedding,
            createdAt: new Date()
        };

        // 2. Save to Database
        // await db.collection('parts').insertOne(newPart);
        partsMemory.push(newPart);

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

        // 2. Fetch all parts (or use Vector Search if DB supports it)
        // const allParts = await db.collection('parts').find().toArray();
        const allParts = partsMemory;

        // 3. Calculate Similarity
        const matches = allParts.map(part => {
            const score = cosineSimilarity(queryEmbedding, part.embedding);
            return {
                ...part,
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

exports.getAllParts = (req, res) => {
    res.json(partsMemory);
};

exports.getStats = (req, res) => {
    const totalParts = partsMemory.length;
    const lowStock = partsMemory.filter(p => p.stock < 10).length; // Assuming < 10 is low stock

    // Get 5 most recent parts
    const recentParts = [...partsMemory]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

    res.json({
        totalParts,
        lowStock,
        recentParts
    });
};

exports.getCategories = (req, res) => {
    res.json(categoriesMemory);
};
