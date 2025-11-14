const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/users');
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserDelete,
  validatePasswordReset
} = require('../middleware/validators/userValidator');
const bcrypt = require('bcrypt');

// create new user
router.post('/', validateUserRegistration, asyncWrapper(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    userType = 'farmer',
    profile,
    location,
    subscription
  } = req.body;

  // Check if user already exists by email or phone
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email or phone number already exists'
    });
  }

  try {
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType,
      profile,
      location,
      subscription
    });

    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
}));

// GET all users
router.get('/', asyncWrapper(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
}));

// GET user by ID
router.get('/:id', asyncWrapper(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, data: user });
}));

// UPDATE user
router.put('/:id', validateUserUpdate, asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Backend - Update user error:', error);
    // Let the global error handler deal with validation errors
    throw error;
  }
}));

// DELETE user
router.delete('/:id', validateUserDelete, asyncWrapper(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// LOGIN user
router.post('/login', validateUserLogin, asyncWrapper(async (req, res) => {
  const { phone, password } = req.body;

  // Find user by phone — include password
  const user = await User.findOne({ phone }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or password'
    });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or password'
    });
  }

  // Return user data (excluding password)
  const userResponse = user.toObject();
  delete userResponse.password;

  const token = `token-${user._id}-${Date.now()}`;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: userResponse
  });
}));

// RESET PASSWORD route
router.post('/reset-password', validatePasswordReset, asyncWrapper(async (req, res) => {
  const { phone, newPassword } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this phone number'
    });
  }

  // Force password to update even if same hash is provided
  user.password = newPassword + Date.now();  // temporary trick to trigger modification
  user.password = newPassword;  // overwrite immediately after
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
}));

module.exports = router;