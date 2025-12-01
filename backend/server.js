const path = require('path');
const express = require('express');
const cors = require('cors');
const partController = require('./partController');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large image payloads

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Database Connection
db.connect();

// Routes
// app.get('/', (req, res) => {
//     res.send('Spare Parts Matching API is running');
// });

// Add a new part (with image embedding generation)
app.post('/api/parts', partController.addPart);

// Match an image to existing parts
app.post('/api/match', partController.matchPart);

// Get all parts
app.get('/api/parts', partController.getAllParts);

// Get dashboard stats
app.get('/api/stats', partController.getStats);

// Get categories
app.get('/api/categories', partController.getCategories);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${process.env.PORT || PORT}`);
});
