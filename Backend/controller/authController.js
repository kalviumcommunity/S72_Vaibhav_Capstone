
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

   // @desc    Register user
   
   exports.register = async (req, res) => {
     try {
       const { name, email, password } = req.body;
   
       // Check if user already exists
       const userExists = await User.findOne({ email });
       if (userExists) {
         return res.status(400).json({ success: false, message: 'User already exists' });
       }
   
       // Create user
       const user = await User.create({
         name,
         email,
         password
       });
   
       // Create token
       const token = generateToken(user._id);
   
       res.status(201).json({
         success: true,
         token,
         user: {
           id: user._id,
           name: user.name,
           email: user.email,
           credits: user.credits,
           avatar: user.avatar,
           bio: user.bio,
           skills: user.skills
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
   
   // @desc    Login user
  
   exports.login = async (req, res) => {
     try {
       const { email, password } = req.body;
   
       // Check if user exists
       const user = await User.findOne({ email }).select('+password');
       if (!user) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
       }
   
       // Check if password matches
       const isMatch = await user.matchPassword(password);
       if (!isMatch) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
       }
   
       // Create token
       const token = generateToken(user._id);
   
       res.status(200).json({
         success: true,
         token,
         user: {
           id: user._id,
           name: user.name,
           email: user.email,
           credits: user.credits,
           avatar: user.avatar,
           bio: user.bio,
           skills: user.skills
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
          avatar: user.avatar,
          bio: user.bio,
          skills: user.skills,
          tasksCompleted: user.tasksCompleted,
          tasksCreated: user.tasksCreated,
          joinedDate: user.joinedDate,
          rating: user.rating
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