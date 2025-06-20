const User = require('../model/user');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// In-memory OTP store (for demo; use DB/Redis for production)
const otpStore = {};

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
  });
}

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

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }

    // Verify the access token with Google
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    const { id, email, name, picture } = googleResponse.data;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google info
      user = await User.create({
        name: name,
        email: email,
        avatar: picture,
        googleId: id,
        password: 'google-auth-' + Math.random().toString(36).substring(7), // Dummy password for Google users
        joinedDate: new Date()
      });
    } else {
      // Update existing user's Google info if not already set
      if (!user.googleId) {
        user.googleId = id;
        if (!user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      }
    }

    // Create JWT token
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
        skills: user.skills,
        tasksCompleted: user.tasksCompleted,
        tasksCreated: user.tasksCreated,
        joinedDate: user.joinedDate,
        rating: user.rating
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// @desc Request OTP for password reset
// @route POST /api/auth/request-otp
// @access Public
exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
  await sendOTPEmail(email, otp);
  res.json({ success: true, message: 'OTP sent to email' });
};

// @desc Reset password with OTP
// @route POST /api/auth/reset-password
// @access Public
exports.resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.password = newPassword;
  await user.save();
  delete otpStore[email];
  res.json({ success: true, message: 'Password reset successful' });
};