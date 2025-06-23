# Complete Backend Documentation

## Project Overview

This backend is built with Node.js, Express, and MongoDB (via Mongoose). It provides RESTful APIs for authentication, user management, and task management, including file uploads and real-time features. The backend is structured for clarity, modularity, and security.

### Directory Structure

- `controller/` – Business logic for routes (auth, user, task)
- `middleware/` – Express middleware (e.g., authentication)
- `model/` – Mongoose schemas (MongoDB models)
- `routes/` – Express route definitions
- `public/` – Static files (uploads, avatars)
- `uploads/` – Uploaded files (avatars, tasks)
- `server.js` – Main entry point (Express app)
- `package.json` – Dependencies and scripts

---

## Error Log & Troubleshooting

### Common Errors

- **Port in use**  
  - **Error:** `EADDRINUSE: address already in use`  
  - **Why:** Another process is using the same port (default 5000).  
  - **Fix:** Change the port or stop the other process.

- **MongoDB connection error**  
  - **Error:** `MongoNetworkError: failed to connect to server`  
  - **Why:** Wrong `MONGO_URI`, MongoDB not running, or network/firewall issues.  
  - **Fix:** Check your `.env` file, ensure MongoDB is running and accessible.

- **CORS errors**  
  - **Error:** `Access-Control-Allow-Origin` missing or blocked  
  - **Why:** Frontend and backend are on different domains/ports, and CORS is not configured.  
  - **Fix:** Use the `cors` middleware and configure allowed origins.

- **JWT errors**  
  - **Error:** `jwt malformed`, `invalid signature`, or `jwt expired`  
  - **Why:** Wrong/missing token, or token expired.  
  - **Fix:** Ensure the frontend sends the correct token, and the backend uses the right `JWT_SECRET`.

---

## File-by-File Explanations

### 1. `server.js`

#### Purpose & Context

This is the **main entry point** for your backend.  
It sets up the Express server, connects to MongoDB, configures middleware, and mounts all routes.

#### Line-by-Line Explanation

```js
require('dotenv').config();
```
- **What:** Loads environment variables from a `.env` file into `process.env`.
- **Why:** Keeps sensitive info (like DB URIs, secrets) out of code.
- **How:** The `dotenv` package reads `.env` and sets variables.

```js
const express = require('express');
```
- **What:** Imports the Express framework.
- **Why:** Express is a minimal web server for Node.js.
- **How:** `require('express')` gives you the Express module.

```js
const mongoose = require('mongoose');
```
- **What:** Imports Mongoose, an ODM (Object Data Modeling) library for MongoDB.
- **Why:** Makes working with MongoDB easier (schemas, validation, queries).
- **How:** `mongoose.connect` is used to connect to the database.

```js
const cors = require('cors');
```
- **What:** Imports the CORS middleware.
- **Why:** Allows your backend to accept requests from different origins (e.g., your frontend).
- **How:** `app.use(cors())` enables CORS for all routes.

```js
const path = require('path');
```
- **What:** Node.js built-in module for handling file paths.
- **Why:** Needed for serving static files and resolving directories.
- **How:** `path.join`, `path.resolve` are used for cross-platform paths.

```js
const app = express();
```
- **What:** Creates an Express application instance.
- **Why:** This is your web server.
- **How:** You use `app` to define routes, middleware, etc.

```js
app.use(express.json());
```
- **What:** Middleware to parse incoming JSON requests.
- **Why:** Allows you to access `req.body` as a JS object.
- **How:** Express parses the body and attaches it to the request.

```js
app.use(cors());
```
- **What:** Enables CORS for all routes.
- **Why:** So your frontend (on a different port/domain) can make requests.
- **How:** The `cors` middleware sets the right headers.

```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
- **What:** Serves static files from the `uploads` directory.
- **Why:** So uploaded files (avatars, task files) can be accessed via URL.
- **How:** `express.static` serves files at `/uploads/*`.

```js
// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
```
- **What:** Imports route modules for authentication, users, and tasks.
- **Why:** Keeps route logic organized and modular.
- **How:** Each file exports an Express router.

```js
// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
```
- **What:** Mounts the routers at specific base paths.
- **Why:** Organizes API endpoints (e.g., `/api/auth/login`).
- **How:** Requests to these paths are handled by the respective routers.

```js
// Serve frontend (if deploying fullstack)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
  });
}
```
- **What:** Serves the frontend build in production.
- **Why:** So the backend can serve both API and frontend.
- **How:** Static files are served from the frontend build directory.

```js
// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
```
- **What:** Connects to MongoDB, then starts the server.
- **Why:** The app should only start if the database is connected.
- **How:** `mongoose.connect` returns a promise; on success, `app.listen` starts the server.

#### Concepts Clarified

- **Express:** A web framework for Node.js, used to build APIs and web servers.
- **Middleware:** Functions that run before route handlers (e.g., for parsing JSON, handling CORS).
- **Routing:** Organizing endpoints by resource (auth, users, tasks).
- **Static Files:** Files served directly (images, uploads) without processing.
- **Environment Variables:** Secure way to store secrets/config outside code.
- **MongoDB/Mongoose:** NoSQL database and its JS library for schemas and queries.

---

### 2. controller/authController.js

#### Purpose & Context

This file contains all authentication-related logic for the backend, including:
- User registration
- User login
- Google OAuth login
- Password reset via OTP (One-Time Password)
- Fetching the current logged-in user's profile

It interacts with the User model, handles JWT token creation, and sends emails for password resets.

#### Error Log & Troubleshooting

- **User already exists on registration**
  - **Error:** `{ success: false, message: 'User already exists' }`
  - **Why:** Attempting to register with an email already in use.
  - **Fix:** Use a different email or login instead.

- **Invalid credentials on login**
  - **Error:** `{ success: false, message: 'Invalid credentials' }`
  - **Why:** Email not found or password incorrect.
  - **Fix:** Double-check email and password.

- **Google OAuth errors**
  - **Error:** `{ success: false, message: 'Google authentication failed' }`
  - **Why:** Invalid/missing access token, or Google API issues.
  - **Fix:** Ensure correct Google client ID and valid access token.

- **OTP not sent or expired**
  - **Error:** `{ success: false, message: 'User not found' }` or `{ success: false, message: 'OTP expired' }`
  - **Why:** Email not registered, or OTP expired (10 min window).
  - **Fix:** Register first, or request a new OTP.

- **Server errors**
  - **Error:** `{ success: false, message: 'Server Error', error: ... }`
  - **Why:** Unexpected issues (DB, email, etc.)
  - **Fix:** Check server logs for details.

#### Line-by-Line Explanation

```js
const User = require('../model/user');
```
- **What:** Imports the User Mongoose model.
- **Why:** Needed to interact with the users collection in MongoDB.
- **How:** Used for finding, creating, and updating users.

```js
const jwt = require('jsonwebtoken');
```
- **What:** Imports the JWT library.
- **Why:** Used to create and verify authentication tokens.
- **How:** `jwt.sign` and `jwt.verify` are used for token management.

```js
const axios = require('axios');
```
- **What:** Imports Axios for HTTP requests.
- **Why:** Used to call Google APIs for OAuth login.
- **How:** `axios.get` fetches user info from Google.

```js
const nodemailer = require('nodemailer');
```
- **What:** Imports Nodemailer for sending emails.
- **Why:** Used to send OTP emails for password reset.
- **How:** `transporter.sendMail` sends emails.

```js
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
```
- **What:** Helper function to create a JWT token for a user ID.
- **Why:** Used after registration/login to authenticate users.
- **How:** Uses secret and expiry from environment variables.

```js
// In-memory OTP store (for demo; use DB/Redis for production)
const otpStore = {};
```
- **What:** Stores OTPs in memory, keyed by email.
- **Why:** For demo purposes; not persistent or scalable.
- **How:** Should use a database or Redis in production.

```js
// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```
- **What:** Generates a random 6-digit number as a string.
- **Why:** Used for OTP (One-Time Password) for password reset.
- **How:** Math functions ensure a 6-digit result.

```js
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
```
- **What:** Sends an OTP email to the user.
- **Why:** Needed for password reset flow.
- **How:** Uses Gmail SMTP; credentials from environment variables.

---

#### Registration Endpoint

```js
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
```
- **What:** Handles user registration.
- **Why:** Allows new users to sign up.
- **How:** Checks for existing user, creates new user, returns JWT and user info.
- **Concepts:**
  - **Async/await:** Handles asynchronous DB operations.
  - **HTTP status codes:** 201 for created, 400 for bad request, 500 for server error.

---

#### Login Endpoint

```js
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
```
- **What:** Handles user login.
- **Why:** Authenticates users and issues JWT tokens.
- **How:** Finds user, checks password, returns token and user info.
- **Concepts:**
  - **Password hashing:** Passwords are stored hashed; `matchPassword` compares hashes.
  - **JWT:** Token is used for future authenticated requests.

---

#### Get Current User Endpoint

```js
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
```
- **What:** Returns the current logged-in user's profile.
- **Why:** Lets the frontend display user info.
- **How:** Uses user ID from JWT (set by auth middleware).
- **Concepts:**
  - **Protected route:** Only accessible with valid JWT.

---

#### Google OAuth Login Endpoint

```js
exports.googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Access token is required' });
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
```
- **What:** Handles login/signup via Google OAuth.
- **Why:** Lets users sign in with Google for convenience and security.
- **How:** Verifies Google token, creates or updates user, returns JWT.
- **Concepts:**
  - **OAuth:** Third-party authentication.
  - **Dummy password:** Google users get a random password (not used for login).

---

#### OTP Request & Password Reset

```js
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
```
- **What:** Sends an OTP to the user's email for password reset.
- **Why:** Securely verifies user identity before allowing password reset.
- **How:** Generates OTP, stores it in memory, sends email.
- **Concepts:**
  - **OTP:** One-Time Password, valid for 10 minutes.
  - **Security:** In production, use persistent storage for OTPs.

// ... (Continue with reset password and any other functions in the file)

---

// ... The next sections will cover each file in the backend directory in the same detailed, beginner-friendly, concept-focused manner. 