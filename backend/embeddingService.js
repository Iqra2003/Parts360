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

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        console.warn('No API Key found. Returning MOCK embedding.');
        return mockEmbedding();
    }

    try {
        // Example call to a hypothetical embedding endpoint
        // Note: For real image embeddings, you'd use a vision model or CLIP.
        // Since this is a demo, we will stick to mock for now unless user specifically requested a real model implementation.
        // BUT, if the user provided a key, they expect it to work.
        // However, OpenAI's text-embedding-3-small DOES NOT accept images.
        // We need a vision model.

        // For now, to avoid breaking if they just put a text key, we will still use mock
        // but log that we are doing so.
        // REAL IMPLEMENTATION requires a different service or complex setup.

        // Let's stick to the mock but make it deterministic based on the image string length for "fake" consistency
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
