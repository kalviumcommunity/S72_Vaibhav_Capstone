const express = require('express');
const { getUsers, getUser, updateProfile, updateCredits } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const User = require('../model/user');

const router = express.Router();

// Public routes
router.get('/', getUsers);
router.get('/:id', getUser);

// Protected routes
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

router.put('/credits', updateCredits);

module.exports = router;