const express = require('express');
const dotenv = require('dotenv');
require ('dotenv').config();
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/database');
const setupSocket = require('./config/socket');

// initialize app
const app = express();

// middlewares
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  credentials: true
}));

// connect DB
connectDB();

// mount the router
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const farmRoute = require('./routes/farmRoutes');
app.use('/api/farm', farmRoute);

const animalRoute = require('./routes/animalRoutes');
app.use('/api/animal', animalRoute);

const cropRoute = require('./routes/cropRoutes');
app.use('/api/crop', cropRoute);

const marketListingRoutes = require('./routes/marketListingRoute');
app.use('/api/market-listings', marketListingRoutes);

const buyerOfferRoutes = require('./routes/buyerOfferRoutes');
app.use('/api/buyerOffer', buyerOfferRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// default root
app.get('/', (req,res) => {
    res.send('Server Up and running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    
    // MongoDB validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }
    
    // MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `User with this ${field} already exists`
        });
    }
    
    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// listen
const PORT = process.env.PORT || 5000
const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
    console.log(`Server Running on PORT http://localhost:${PORT}`);
    console.log('Socket.IO server ready for connections');
});

module.exports = { app, server };