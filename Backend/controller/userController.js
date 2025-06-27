const User = require('../model/user');
const { Task } = require('../model/task');

// @desc    Get user profile stats
// @route   GET /api/users/profile-stats
// @access  Private
exports.getProfileStats = async (req, res) => {
  try {
    console.log('Attempting to fetch user with ID:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('User found:', user.name);

    // Get task statistics
    console.log('Counting created tasks for user:', user._id);
    const createdTasks = await Task.countDocuments({ creator: user._id });
    console.log('Created tasks count:', createdTasks);

    console.log('Counting completed tasks for user:', user._id);
    const completedTasks = await Task.countDocuments({ 
      claimant: user._id,
      status: 'completed'
    });
    console.log('Completed tasks count:', completedTasks);

    console.log('Counting in-progress tasks for user:', user._id);
    const inProgressTasks = await Task.countDocuments({
      claimant: user._id,
      status: 'in-progress'
    });
    console.log('In-progress tasks count:', inProgressTasks);

    res.json({
      success: true,
      data: {
        credits: user.credits,
        tasksCreated: createdTasks,
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks,
        rating: user.rating,
        ratingCount: user.ratingCount
      }
    });
  } catch (error) {
    console.error('Error fetching user stats in getProfileStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
    try {
      const users = await User.find().select('-__v');
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };
  
  // @desc    Get single user
  // @route   GET /api/users/:id
  exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-__v');
      
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
  };
  
  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  exports.updateProfile = async (req, res) => {
    try {
      const fieldsToUpdate = {
        name: req.body.name,
        bio: req.body.bio,
        skills: req.body.skills
      };
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        fieldsToUpdate,
        {
          new: true,
          runValidators: true
        }
      );
      
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
  };
  
  // @desc    Update user credits
  // @route   PUT /api/users/credits
  // @access  Private
  exports.updateCredits = async (req, res) => {
    try {
      const { operation, amount } = req.body;
      
      if (!operation || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Please provide operation (add/subtract) and amount'
        });
      }
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (operation === 'add') {
        user.credits += amount;
      } else if (operation === 'subtract') {
        if (user.credits < amount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient credits'
          });
        }
        user.credits -= amount;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use "add" or "subtract"'
        });
      }
      
      await user.save();
      
      res.status(200).json({
        success: true,
        data: {
          credits: user.credits
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };

  // @desc    Upload user avatar
  // @route   POST /api/users/upload-avatar
  // @access  Private
  exports.uploadAvatar = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded.'
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      // Construct the public URL for the avatar
      // Assuming your server serves static files from '/public'
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      user.avatar = avatarUrl;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully!',
        user: user // Return the updated user object
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };

// @desc    Get all tasks for the current user
// @route   GET /api/users/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching tasks for user:', userId);
    const tasks = await Task.find({
      $or: [
        { creator: userId },
        { claimant: userId }
      ]
    })
    .populate('creator', 'name avatar')
    .populate('claimant', 'name avatar')
    .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error in getMyTasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching user tasks', error: error.message });
  }
};

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    console.log('Fetched user in getProfile:', user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Ensure credits is always present
    const userObj = user.toObject();
    userObj.credits = typeof userObj.credits === 'number' ? userObj.credits : 0;
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};