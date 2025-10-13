const express = require('express');
const { getUsers, getUser, updateProfile, uploadAvatar, getProfileStats, getMyTasks, getProfile } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../model/user');
const Task = require('../model/task');

const router = express.Router();

// Set up storage for uploaded files
// Decide storage strategy: if AWS S3 is configured, use memory storage so files can
// be uploaded to S3; otherwise fall back to disk storage under ./uploads/avatars
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

let upload;
if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
  // Memory storage for direct S3 upload
  const storage = multer.memoryStorage();
  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
} else {
  // Local disk fallback
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/avatars'); // Directory for avatar uploads
    },
    filename: function (req, file, cb) {
      cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
  });
  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
}

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

// Protected routes
router.get('/my-tasks', protect, getMyTasks);
router.get('/profile-stats', protect, getProfileStats);
router.get('/profile', protect, getProfile);

// Public routes
router.get('/', getUsers);
router.get('/:id', getUser);

// Protected routes
router.put('/profile', protect, updateProfile);

// New route for avatar upload
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;