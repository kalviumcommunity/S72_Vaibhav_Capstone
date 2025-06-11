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
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Only allow admin to modify credits
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Only admins can update credits.' });
      }
  
      if (!operation || !amount) {
        return res.status(400).json({ success: false, message: 'Provide operation (add/subtract) and amount' });
      }
  
      // Perform credit update
      if (operation === 'add') {
        user.credits += amount;
      } else if (operation === 'subtract') {
        if (user.credits < amount) {
          return res.status(400).json({ success: false, message: 'Insufficient credits' });
        }
        user.credits -= amount;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid operation. Use "add" or "subtract"' });
      }
  
      await user.save();
      res.status(200).json({ success: true, data: { credits: user.credits } });
  
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };

  //(In mongoDB) db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })