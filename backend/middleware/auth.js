// Simple auth middleware for extracting user from localStorage tokens
// Note: In production, use proper JWT verification
const mongoose = require('mongoose');
const User = require('../models/users');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Handle demo tokens
    if (token.startsWith('demo-token-')) {
      // Try to get the most recently created user (works for demo purposes)
      // In a real app, you'd store the userId in the token or use a proper JWT
      const user = await User.findOne().sort({ createdAt: -1 });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found'
        });
      }
      
      req.user = user;
      return next();
    }

    // Handle actual production tokens with format: token-${user._id}-${Date.now()}
    if (token.startsWith('token-')) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 3) {
        const userId = tokenParts[1];
        
        if (userId) {
          const user = await User.findById(userId);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'User not found'
            });
          }
          
          req.user = user;
          return next();
        }
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;