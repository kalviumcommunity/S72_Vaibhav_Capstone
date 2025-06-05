const User = require('../model/user');

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
  