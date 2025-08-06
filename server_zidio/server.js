// server.js
require('dotenv').config(); // MUST BE THE VERY FIRST LINE

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Import your route files
const authRoutes = require('./routes/auth'); // Assuming this is authRoutes.js
const uploadRoutes = require('./routes/uploadRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import your custom error handling middleware
const { errorHandler } = require('./middleware/errorMiddleware'); // You will need to create this file

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY); // Keep for debugging, remove later

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Enable body parsing for JSON
app.use(express.urlencoded({ extended: false })); // Enable body parsing for URL-encoded data (if needed)

// CORS Configuration - CRUCIAL FIX FOR CORS ERRORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://effulgent-raindrop-606589.netlify.app'], // Add your Netlify domain here
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
    credentials: true // Allow cookies and authorization headers to be sent
}));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

// Error handling middleware - CRUCIAL FIX FOR UNHANDLED ERRORS
// This must be placed AFTER all your routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));