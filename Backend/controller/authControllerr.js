const User = require('../model/user');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nodemailer = require('nodemailer');


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
