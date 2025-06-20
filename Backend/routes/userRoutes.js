const express = require('express');
const { getUsers, getUser, updateProfile, uploadAvatar, getProfileStats } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../model/user');
const Task = require('../model/task');

const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/avatars'); // Directory for avatar uploads
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get platform statistics (public route)
router.get('/user-stats', async (req, res) => {
  try {
    console.log('Fetching platform statistics');
    
    // Get total users
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    // Get total credits earned
    const totalCredits = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: '$credits' } } }
    ]);
    console.log('Total credits:', totalCredits[0]?.totalCredits || 0);
    
    // Get task statistics
    const taskStats = await Task.aggregate([
      { $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      } }
    ]);
    console.log('Task stats:', taskStats[0] || { totalTasks: 0, completedTasks: 0 });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCreditsEarned: totalCredits[0]?.totalCredits || 0,
        completedTasks: taskStats[0]?.completedTasks || 0,
        totalTasks: taskStats[0]?.totalTasks || 0
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
});

// Get user stats (protected route)
router.get('/profile-stats', protect, getProfileStats);

// Public routes
router.get('/', getUsers);
router.get('/:id', getUser);

// Protected routes
router.put('/profile', protect, updateProfile);

// New route for avatar upload
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;