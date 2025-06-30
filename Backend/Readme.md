Backend deployment: https://s72-vaibhav-capstone.onrender.com

## Key Feature Implementations: Where to Find Them

### 1. WebSocket-based Real-time Communication
- **File:** `server.js`
- **Location:** Lines 9, 49–54 (and related logic)
- **Description:**
  - Sets up a Socket.io server for real-time communication.
  - Handles joining task-specific chat rooms and sending/receiving messages in real time.
  - Example:
    ```js
    const { Server } = require('socket.io');
    // ...
    const io = new Server(server, { ... });
    io.on('connection', (socket) => {
      socket.on('joinTaskRoom', (taskId) => {
        socket.join(taskId);
      });
      socket.on('sendMessage', (msg) => {
        io.to(msg.taskId).emit('receiveMessage', msg);
      });
    });
    ```

### 2. Implemented Authentication (3rd Party - Google)
- **Files:**
  - `controller/authController.js` (function: `exports.googleLogin`)
  - `routes/authRoutes.js` (route: `/api/auth/google`)
  - `model/user.js` (field: `googleId`)
- **Description:**
  - Handles Google OAuth login by verifying the access token, fetching user info from Google, and creating/updating users in the database.
  - The route `/api/auth/google` is used for Google login.
  - Example (from `authController.js`):
    ```js
    // @desc    Google OAuth Login
    // @route   POST /api/auth/google
    exports.googleLogin = async (req, res) => {
      // ...
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      // ...
    }
    ```

### 3. API Integration (OTP Provider)
- **Files:**
  - `controller/authController.js` (functions: `generateOTP`, `sendOTPEmail`, `requestOTP`, `resetPasswordWithOTP`)
  - `routes/authRoutes.js` (routes: `/api/auth/request-otp`, `/api/auth/reset-password`)
- **Description:**
  - OTPs are generated and sent to users via email for password reset using Nodemailer.
  - The API endpoints `/api/auth/request-otp` and `/api/auth/reset-password` handle OTP requests and verification.
  - Example (from `authController.js`):
    ```js
    // Generate random 6-digit OTP
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Send OTP email
    async function sendOTPEmail(email, otp) {
      // ...
    }
    ```