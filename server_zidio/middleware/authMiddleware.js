// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // Import asyncHandler if not already in your global error handler

// Middleware to protect routes: verifies JWT and attaches user to req
// Using asyncHandler here for consistency, though manual error handling is also fine.
exports.protect = asyncHandler(async (req, res, next) => { // Wrap with asyncHandler
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) { // Added check if user was actually found
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            res.status(401); // Set status before throwing for asyncHandler
            throw new Error('Not authorized, token failed');
        }
    } else { // No token found in headers
        res.status(401); // Set status before throwing for asyncHandler
        throw new Error('Not authorized, no token');
    }
});

// Middleware to check if the authenticated user has an 'admin' role
// This should be in authMiddleware.js IF you delete adminMiddleware.js
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403); // Set status before throwing (if using asyncHandler pattern for this too)
        throw new Error('Not authorized as an admin'); // Throw an error that errorHandler can catch
    }
};

// OR, if you want admin to also use asyncHandler for more robust error flow:
/*
exports.admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
});
*/