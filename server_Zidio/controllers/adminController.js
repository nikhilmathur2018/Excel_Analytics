const User = require('../models/User');
const UploadedFile = require('../models/UploadedFile'); // Not used in this file, but good to keep if needed later
const asyncHandler = require('express-async-handler'); // Import asyncHandler

exports.getAllUsers = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const users = await User.find({}).select('-password');
    res.json(users);
});

exports.deleteUser = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404); // Set status before throwing error for asyncHandler
        throw new Error('User not found');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
});

exports.updateUserRole = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404); // Set status before throwing error for asyncHandler
        throw new Error('User not found');
    }
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated', user });
});