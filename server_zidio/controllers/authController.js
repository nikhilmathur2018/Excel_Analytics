// const { resolveInclude } = require('ejs'); // REMOVE THIS LINE - unused import
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Import asyncHandler


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.registerUser = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400); // Set status before throwing error for asyncHandler
        throw new Error('User already exists');
    }
    const user = await User.create({ username, email, password });
    res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
});

exports.loginUser = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Set status before throwing error for asyncHandler
        throw new Error('Invalid email or password');
    }
});