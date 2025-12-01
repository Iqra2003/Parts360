// embeddingService.js
// This service handles generating vector embeddings from images.
// You can use OpenAI's CLIP model or AWS Rekognition.

const axios = require('axios');

// CONFIGURATION
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

/**
 * Generates an embedding vector for a given image.
 * @param {string} imageBase64 - Base64 encoded image string.
 * @returns {Promise<number[]>} - Array of floats representing the image embedding.
 */
async function generateImageEmbedding(imageBase64) {
    console.log('Generating embedding for image...');

    // --- OPTION 1: OpenAI (Recommended for ease) ---
    // Note: OpenAI's current public embeddings are mostly text. 
    // For images, you might use a CLIP-based service or a specific model if available.
    // OR use a hosted Python service with HuggingFace.

    // For this template, we will simulate a random vector for demonstration
    // if no API key is present, to allow the UI to function.

    if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        console.warn('No API Key found. Returning MOCK embedding.');
        return mockEmbedding();
    }

    try {
        // Example call to a hypothetical embedding endpoint
        // const response = await axios.post('https://api.openai.com/v1/embeddings', {
        //   input: imageBase64,
        //   model: "text-embedding-3-small" // NOTE: This is for text. For images, use a vision model.
        // }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });

        // return response.data.data[0].embedding;

        return mockEmbedding();
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Generates a random normalized vector for testing purposes.
 * Size: 1536 (common embedding size)
 */
function mockEmbedding() {
    const size = 1536;
    const vector = Array.from({ length: size }, () => Math.random() - 0.5);
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
}

module.exports = { generateImageEmbedding };
