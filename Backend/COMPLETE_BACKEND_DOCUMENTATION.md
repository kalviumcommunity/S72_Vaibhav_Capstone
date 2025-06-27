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

### 3. controller/userController.js

#### Purpose & Context

This file contains all user-related logic for the backend, including:
- Fetching user profile statistics
- Getting all users or a single user
- Updating user profile and credits
- Uploading user avatars
- Fetching all tasks for the current user

It interacts with the User and Task models, and is used by user-related API endpoints.

#### Error Log & Troubleshooting

- **User not found**
  - **Error:** `{ success: false, message: 'User not found' }`
  - **Why:** The user ID does not exist in the database.
  - **Fix:** Ensure the user is registered and the ID is correct.

- **Insufficient credits**
  - **Error:** `{ success: false, message: 'Insufficient credits' }`
  - **Why:** Attempting to subtract more credits than the user has.
  - **Fix:** Only subtract credits if the user has enough.

- **No file uploaded (avatar upload)**
  - **Error:** `{ success: false, message: 'No file uploaded.' }`
  - **Why:** The request did not include a file.
  - **Fix:** Ensure the frontend sends a file in the request.

- **Server errors**
  - **Error:** `{ success: false, message: 'Server Error', error: ... }`
  - **Why:** Unexpected issues (DB, file system, etc.)
  - **Fix:** Check server logs for details.

#### Line-by-Line Explanation

```js
const User = require('../model/user');
const { Task } = require('../model/task');
```
- **What:** Imports the User and Task Mongoose models.
- **Why:** Needed to interact with users and tasks in MongoDB.
- **How:** Used for finding, creating, and updating users and tasks.

---

#### Get User Profile Stats

```js
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
```
- **What:** Returns statistics about the current user's profile and tasks.
- **Why:** Lets the frontend display user stats (credits, tasks, rating).
- **How:** Finds user by ID, counts tasks created/completed/in-progress, returns stats.
- **Concepts:**
  - **MongoDB queries:** `countDocuments` counts matching documents.
  - **Error handling:** Returns 404 if user not found, 500 for server errors.

---

#### Get All Users

```js
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
```
- **What:** Returns all users in the database.
- **Why:** Lets admins or the frontend display a list of users.
- **How:** Finds all users, excludes the `__v` field (Mongoose version key).
- **Concepts:**
  - **Mongoose select:** `.select('-__v')` excludes a field from results.

---

#### Get Single User

```js
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
```
- **What:** Returns a single user by ID.
- **Why:** Lets the frontend display a user's profile.
- **How:** Finds user by ID, excludes `__v`, returns user data.
- **Concepts:**
  - **Route params:** `req.params.id` gets the user ID from the URL.

---

#### Update User Profile

```js
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
```
- **What:** Updates the current user's profile (name, bio, skills).
- **Why:** Lets users edit their profile info.
- **How:** Finds user by ID, updates fields, returns updated user.
- **Concepts:**
  - **Mongoose update:** `findByIdAndUpdate` updates and returns the new document.
  - **Validation:** `runValidators: true` ensures data is valid.

---

#### Update User Credits

```js
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
```
- **What:** Adds or subtracts credits from the current user.
- **Why:** Used for task payments and rewards.
- **How:** Checks operation, updates credits, saves user.
- **Concepts:**
  - **Request body:** `operation` is 'add' or 'subtract', `amount` is a number.
  - **Validation:** Ensures enough credits before subtracting.

---

#### Upload User Avatar

```js
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
```
- **What:** Uploads and sets a new avatar for the user.
- **Why:** Lets users personalize their profile.
- **How:** Checks for file, updates user's avatar field, saves user.
- **Concepts:**
  - **File upload:** `req.file` is set by multer middleware.
  - **Static files:** Avatar is served from `/uploads/avatars/`.

---

// ... (Continue with the rest of the file, e.g., get all tasks for the current user, etc.)

---

### 4. controller/taskController.js

#### Purpose & Context

This file contains all task-related logic for the backend, including:
- Creating, updating, deleting tasks
- Claiming, submitting, approving, and rejecting tasks
- Handling file uploads for task submissions
- Fetching tasks (all, available, by user, by filters)
- Downloading submitted files
- Providing title/description suggestions

It interacts with the Task and User models, and is used by task-related API endpoints.

#### Error Log & Troubleshooting

- **Task not found**
  - **Error:** `{ success: false, message: 'Task not found' }`
  - **Why:** The task ID does not exist in the database.
  - **Fix:** Ensure the task exists and the ID is correct.

- **Invalid task ID format**
  - **Error:** `{ success: false, message: 'Invalid task ID format' }`
  - **Why:** The provided ID is not a valid MongoDB ObjectId.
  - **Fix:** Check the ID format before making the request.

- **Insufficient credits (task creation)**
  - **Error:** `{ success: false, message: 'Insufficient credits' }`
  - **Why:** User does not have enough credits to create a task.
  - **Fix:** Add more credits or lower the task's credit value.

- **Invalid file type (upload)**
  - **Error:** `Invalid file type. Only PNG and JPG files are allowed.`
  - **Why:** Attempted to upload a file that is not PNG/JPG.
  - **Fix:** Only upload allowed file types.

- **Server errors**
  - **Error:** `{ success: false, message: 'Server Error', error: ... }`
  - **Why:** Unexpected issues (DB, file system, etc.)
  - **Fix:** Check server logs for details.

#### Line-by-Line Explanation (First Section)

```js
const mongoose = require('mongoose');
const { Task, TASK_STATUS } = require('../model/task');
const User = require('../model/user');
const axios = require('axios'); // Import axios
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { protect } = require('../middleware/auth');
```
- **What:** Imports all required modules and models.
- **Why:** Needed for DB operations, file uploads, HTTP requests, and authentication.
- **How:** Each module serves a specific purpose (see below).
- **Concepts:**
  - **Mongoose:** For MongoDB queries and models.
  - **multer:** For handling file uploads.
  - **fs/path:** For file system operations.
  - **express:** For router/middleware (if used).

```js
require('dotenv').config();
```
- **What:** Loads environment variables from `.env`.
- **Why:** Needed for config (e.g., file paths, secrets).

---

#### Multer File Upload Setup

```js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/tasks';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});
```
- **What:** Configures where and how uploaded files are stored.
- **Why:** Ensures files are saved in the right place with unique names.
- **How:**
  - Checks if the upload directory exists, creates it if not.
  - Generates a unique filename for each upload.
- **Concepts:**
  - **multer.diskStorage:** Customizes file storage for uploads.
  - **fs.existsSync/fs.mkdirSync:** File system operations.

```js
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG and JPG files are allowed.'));
    }
  }
}).array('files', 5); // Allow up to 5 files
```
- **What:** Sets up multer middleware for file uploads.
- **Why:** Restricts uploads to images, limits file size and count.
- **How:**
  - Only allows PNG/JPG/JPEG files.
  - Limits each file to 5MB, max 5 files per upload.
- **Concepts:**
  - **multer.array:** Accepts multiple files under the 'files' field.

---

#### Get Available Tasks

```js
const getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      status: TASK_STATUS.OPEN,
      claimant: null 
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching available tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available tasks'
    });
  }
};
```
- **What:** Returns all tasks that are open and unclaimed.
- **Why:** Used for the task marketplace (available tasks to claim).
- **How:** Finds tasks with status 'open' and no claimant, sorts by newest.
- **Concepts:**
  - **MongoDB query:** Filters by status and claimant.

---

#### Get All Tasks (with Filters)

```js
const getTasks = async (req, res) => {
  try {
    let filter = {};
    const { search, category, status, skill, userId, available } = req.query;

    // Validate userId if present
    let validUserId = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = userId;
    }

    // Handle 'available' filter for marketplace
    if (available === 'true') {
      filter = {
        status: TASK_STATUS.OPEN,
        claimant: null
      };

      // If user is logged in (and userId is valid), exclude their own tasks from available list
      if (validUserId) {
        filter.creator = { $ne: validUserId };
      }
    } else if (validUserId) {
      // For My Tasks page - show only tasks where user is creator or claimant
      filter = {
        $or: [
          { creator: validUserId },
          { claimant: validUserId }
        ]
      };
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Status filter (only applies if not filtering by 'available' which sets status to 'open')
    if (status && available !== 'true') {
      filter.status = status;
    }

    // Skill filter
    if (skill) {
      filter.skills = skill; // Assuming 'skills' in task model is an array of strings
    }

    const tasks = await Task.find(filter)
      .populate('creator', 'name avatar rating')
      .populate('claimant', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
};
```
- **What:** Returns all tasks, with optional filters (search, category, status, skill, user, available).
- **Why:** Powers the task marketplace, user dashboards, and search.
- **How:** Builds a dynamic filter object based on query params, fetches and populates related user info.
- **Concepts:**
  - **MongoDB queries:** Dynamic filtering, population of related documents.
  - **Regex search:** For flexible searching by title/description.

---

#### Get Single Task

```js
const getTask = async (req, res) => {
  try {
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findById(req.params.id)
      .populate({
        path: 'creator',
        select: 'name avatar rating',
        model: 'User'
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only populate claimant if it exists
    if (task.claimant) {
      await task.populate({
        path: 'claimant',
        select: 'name avatar rating',
        model: 'User'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};
```
- **What:** Returns a single task by ID, with creator and claimant info.
- **Why:** Lets the frontend display detailed task info.
- **How:** Validates ID, fetches task, populates related user fields.
- **Concepts:**
  - **Mongoose populate:** Joins related user data into the task object.

---

#### Create New Task

```js
const createTask = async (req, res) => {
  try {
    // Check if user has enough credits
    const creator = await User.findById(req.user.id);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (creator.credits < req.body.credits) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits'
      });
    }

    // Create the task
    const task = await Task.create({
      ...req.body,
      creator: req.user.id
    });

    // Update creator's credits and tasksCreated count
    creator.credits -= req.body.credits;
    creator.tasksCreated += 1;
    await creator.save();

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
};
```
- **What:** Creates a new task and deducts credits from the creator.
- **Why:** Lets users post new tasks for others to claim.
- **How:** Checks credits, creates task, updates user, returns new task.
- **Concepts:**
  - **Request body:** Task details are sent in the request.
  - **Atomicity:** Ensures credits are only deducted if task is created.

---

#### Continued: controller/taskController.js (Core Task Actions)

##### Claim a Task

```js
const claimTask = async (req, res) => {
  try {
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    if (task.claimant) {
      return res.status(400).json({
        success: false,
        message: 'Task already claimed'
      });
    }
    if (task.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own task'
      });
    }
    task.claimant = req.user.id;
    task.status = TASK_STATUS.IN_PROGRESS;
    await task.save();
    // Optionally, update user's tasksInProgress count, etc.
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error claiming task:', error);
    res.status(500).json({
      success: false,
      message: 'Error claiming task'
    });
  }
};
```
- **What:** Allows a user to claim a task if it's available.
- **Why:** Ensures only one user can claim a task, and not the creator.
- **How:** Checks ID, task existence, claim status, and user; updates task.
- **Concepts:**
  - **Authorization:** Prevents self-claiming and double-claiming.

---

##### Submit a Task

```js
const submitTask = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      if (!task.claimant || task.claimant.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to submit this task' });
      }
      if (task.status !== TASK_STATUS.IN_PROGRESS && task.status !== TASK_STATUS.REJECTED) {
        return res.status(400).json({ success: false, message: 'Task cannot be submitted in its current status' });
      }
      // Prepare submission object
      const submission = {
        content: req.body.content,
        files: req.files ? req.files.map(file => ({ path: file.path, originalname: file.originalname })) : [],
        submittedAt: new Date()
      };
      task.submission = submission;
      task.status = TASK_STATUS.SUBMITTED;
      await task.save();
      res.json({ success: true, task });
    } catch (error) {
      console.error('Error submitting task:', error);
      res.status(500).json({ success: false, message: 'Error submitting task' });
    }
  });
};
```
- **What:** Lets the claimant submit their work and files for a task.
- **Why:** Enables file uploads and submission notes for review.
- **How:** Uses multer to handle files, checks authorization, updates task.
- **Concepts:**
  - **File upload:** Uses multer middleware.
  - **Authorization:** Only the claimant can submit.

---

##### Download a Submitted File

```js
const downloadFile = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !task.submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const file = task.submission.files.find(f => f.path.endsWith(req.params.filename));
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.download(file.path, file.originalname);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ success: false, message: 'Error downloading file' });
  }
};
```
- **What:** Allows users to download a file submitted for a task.
- **Why:** Lets creator or claimant access submitted work.
- **How:** Finds the file in the task's submission, streams it to the client.
- **Concepts:**
  - **res.download:** Sends a file for download with the original name.

---

##### Approve a Task Submission

```js
const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this task' });
    }
    if (task.status !== TASK_STATUS.SUBMITTED) {
      return res.status(400).json({ success: false, message: 'Task is not submitted' });
    }
    task.status = TASK_STATUS.COMPLETED;
    // Optionally, update claimant's credits, tasksCompleted, etc.
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error approving task:', error);
    res.status(500).json({ success: false, message: 'Error approving task' });
  }
};
```
- **What:** Lets the creator approve a submitted task.
- **Why:** Marks the task as completed and can trigger rewards.
- **How:** Checks authorization and status, updates task.
- **Concepts:**
  - **Authorization:** Only the creator can approve.

---

##### Reject a Task Submission

```js
const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this task' });
    }
    if (task.status !== TASK_STATUS.SUBMITTED) {
      return res.status(400).json({ success: false, message: 'Task is not submitted' });
    }
    task.status = TASK_STATUS.REJECTED;
    task.rejectionReason = req.body.reason || 'No reason provided';
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({ success: false, message: 'Error rejecting task' });
  }
};
```
- **What:** Lets the creator reject a submitted task (request changes).
- **Why:** Allows feedback and resubmission.
- **How:** Checks authorization and status, updates task with rejection reason.
- **Concepts:**
  - **Feedback loop:** Enables iterative improvement.

---

##### Cancel a Task

```js
const cancelTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this task' });
    }
    if (task.status === TASK_STATUS.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed task' });
    }
    task.status = TASK_STATUS.CANCELLED;
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error cancelling task:', error);
    res.status(500).json({ success: false, message: 'Error cancelling task' });
  }
};
```
- **What:** Lets the creator cancel a task before completion.
- **Why:** Allows for aborting tasks that are no longer needed.
- **How:** Checks authorization and status, updates task.

---

##### Delete a Task

```js
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }
    await task.remove();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Error deleting task' });
  }
};
```
- **What:** Lets the creator delete a task.
- **Why:** Removes tasks that are no longer needed.
- **How:** Checks authorization, removes task from DB.

---

##### Update a Task

```js
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }
    Object.assign(task, req.body);
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
};
```
- **What:** Lets the creator update a task's details.
- **Why:** Allows editing of task info before completion.
- **How:** Checks authorization, updates fields, saves task.

---

##### Title and Description Suggestions

```js
const getTitleSuggestions = async (req, res) => {
  // Example: returns a static list or could use AI/ML in production
  res.json({
    success: true,
    suggestions: [
      'Design a Logo',
      'Build a Landing Page',
      'Write a Blog Post',
      'Create a Marketing Plan'
    ]
  });
};

const getDescriptionSuggestions = async (req, res) => {
  res.json({
    success: true,
    suggestions: [
      'Describe your requirements in detail.',
      'Include any deadlines or special instructions.',
      'Attach reference files if needed.'
    ]
  });
};
```
- **What:** Provides static suggestions for task titles and descriptions.
- **Why:** Helps users quickly fill out forms.
- **How:** Returns a static array; could be dynamic in production.

---

// End of controller/taskController.js documentation. Next: middleware, models, and routes. 

---

## 5. `middleware/auth.js`

#### Purpose & Context

This file contains middleware for **protecting routes** using JWT authentication.  
It ensures that only authenticated users can access certain API endpoints.

#### Line-by-Line Explanation

```js
const jwt = require('jsonwebtoken');
const User = require('../model/user');
```
- **What:** Imports the JWT library and the User model.
- **Why:** JWT is used to verify tokens; User is needed to fetch the authenticated user from the database.

```js
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
```
- **What:** Middleware function to protect routes.
- **Why:** Ensures only users with a valid JWT can access protected endpoints.
- **How:**  
  - Checks for a Bearer token in the `Authorization` header.
  - If missing, returns 401 Unauthorized.
  - If present, verifies the token using the secret.
  - If valid, attaches the user to `req.user` and calls `next()` to proceed.
  - If invalid, returns 401 Unauthorized.
- **Concepts:**
  - **JWT:** JSON Web Token for stateless authentication.
  - **Express middleware:** Functions that run before route handlers.

---

## 6. Models (`model/` directory)

### a. `model/user.js`

#### Purpose & Context

Defines the **User schema** for MongoDB using Mongoose.  
Represents users in the system, including authentication, profile, and stats.

#### Key Concepts

- **Fields:** name, email, password (hashed), credits, avatar, bio, skills, tasksCreated, tasksCompleted, joinedDate, rating, etc.
- **Password Hashing:** Uses pre-save hooks to hash passwords.
- **Methods:** Custom methods for password comparison, etc.

---

### b. `model/task.js`

#### Purpose & Context

Defines the **Task schema** for MongoDB using Mongoose.  
Represents tasks posted by users, including status, creator, claimant, files, and more.

#### Key Concepts

- **Fields:** title, description, category, credits, status, creator, claimant, skills, submission, etc.
- **Status Enum:** OPEN, IN_PROGRESS, SUBMITTED, COMPLETED, REJECTED, CANCELLED.
- **Submission:** Stores submitted files and content.
- **Timestamps:** Tracks creation and update times.

---

### c. `model/review.js` and `model/transaction.js`

#### Purpose & Context

- **review.js:** Stores reviews/ratings for users or tasks.
- **transaction.js:** Tracks credit transactions between users (e.g., for task payments).

---

## 7. Routes (`routes/` directory)

### a. `routes/authRoutes.js`

#### Purpose & Context

Defines all **authentication-related API endpoints** (register, login, Google OAuth, password reset).

#### Key Concepts

- **POST /api/auth/register:** Register a new user.
- **POST /api/auth/login:** Login with email/password.
- **POST /api/auth/google:** Login with Google OAuth.
- **POST /api/auth/request-otp:** Request OTP for password reset.
- **POST /api/auth/reset-password:** Reset password using OTP.

---

### b. `routes/userRoutes.js`

#### Purpose & Context

Defines all **user-related API endpoints** (profile, stats, avatar upload, etc.).

#### Line-by-Line Explanation

```js
const express = require('express');
const { getUsers, getUser, updateProfile, uploadAvatar, getProfileStats, getMyTasks } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../model/user');
const Task = require('../model/task');

const router = express.Router();
```
- **What:** Sets up the Express router and imports controllers/middleware.

**File Upload Setup:**
- Uses `multer` to handle avatar uploads, storing them in `uploads/avatars` and naming them with the user ID and timestamp.
- Filters to allow only image files.

**Routes:**
- **GET /api/users/** – Get all users.
- **GET /api/users/:id** – Get a single user by ID.
- **PUT /api/users/profile** – Update current user's profile (protected).
- **POST /api/users/avatar** – Upload avatar (protected, with file upload).
- **GET /api/users/stats** – Get profile stats (protected).
- **GET /api/users/my-tasks** – Get all tasks for the current user (protected).

---

### c. `routes/taskRoutes.js`

#### Purpose & Context

Defines all **task-related API endpoints** (CRUD, claim, submit, approve, reject, etc.).

#### Line-by-Line Explanation

```js
const express = require('express');
const {
  getAvailableTasks,
  getTasks,
  getTask,
  createTask,
  claimTask,
  submitTask,
  markOfflineTaskComplete,
  approveTask,
  rejectTask,
  cancelTask,
  deleteTask,
  updateTask,
  downloadFile,
  getTitleSuggestions,
  getDescriptionSuggestions
} = require('../controller/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();
```
- **What:** Sets up the Express router and imports controllers/middleware.

**Routes:**
- **GET /api/tasks/available** – Get all available (open, unclaimed) tasks.
- **GET /api/tasks/** – Get all tasks (with filters).
- **GET /api/tasks/:id** – Get a single task by ID.
- **POST /api/tasks/** – Create a new task (protected).
- **POST /api/tasks/:id/claim** – Claim a task (protected).
- **POST /api/tasks/:id/submit** – Submit a task (protected, with file upload).
- **POST /api/tasks/:id/approve** – Approve a submitted task (protected).
- **POST /api/tasks/:id/reject** – Reject a submitted task (protected).
- **POST /api/tasks/:id/cancel** – Cancel a task (protected).
- **DELETE /api/tasks/:id** – Delete a task (protected).
- **PUT /api/tasks/:id** – Update a task (protected).
- **GET /api/tasks/:id/download/:filename** – Download a submitted file (protected).
- **GET /api/tasks/title-suggestions** – Get title suggestions.
- **GET /api/tasks/description-suggestions** – Get description suggestions.

---

If you want a more detailed, line-by-line breakdown of any specific middleware, model, or route file, just let me know which one! 

## Deployment Note

- When deploying, update your backend CORS settings to allow only your deployed frontend URL (e.g., https://your-frontend.netlify.app).
- Remove localhost origins from the CORS allowed origins list for production security.
- Make sure your frontend uses the deployed backend URL (https://s72-vaibhav-capstone.onrender.com) in its config. 