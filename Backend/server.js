const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

// Create uploads directories if they don't exist
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'tasks'),
  path.join(__dirname, 'uploads', 'avatars')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Use CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // Vite local dev
      'http://localhost:3000', // React local dev
      'http://localhost:5174', // Vite alternative port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://credbuzz.netlify.app', // Production Netlify
      'https://s-72-vaibhav-capstone--vaibh74050.replit.app', // Replit production
      /\.replit\.(dev|app)$/ // Allow all Replit subdomains (.replit.dev and .replit.app)
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io chat logic (simple per-task room)
io.on('connection', (socket) => {
  socket.on('joinTaskRoom', (taskId) => {
    socket.join(taskId);
  });
  socket.on('sendMessage', (msg) => {
    // msg: { taskId, userId, userName, content, timestamp }
    io.to(msg.taskId).emit('receiveMessage', msg);
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log('Connected to database successfully!');
    
    // Load routes after database connection
    const userRoutes = require('./routes/userRoutes');
    const taskRoutes = require('./routes/taskRoutes');
    const authRoutes = require('./routes/authRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/tasks', taskRoutes);

    // Health check endpoint for UptimeRobot monitoring
    app.get('/api/health', async (req, res) => {
      try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        };

        const healthCheck = {
          status: dbState === 1 ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          service: 'CredBuzz API',
          database: {
            status: dbStatus[dbState] || 'unknown',
            connected: dbState === 1
          }
        };

        if (dbState !== 1) {
          return res.status(503).json(healthCheck);
        }

        res.status(200).json(healthCheck);
      } catch (error) {
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          message: error.message
        });
      }
    });

    // Simple ping endpoint (lightweight for frequent checks)
    app.get('/api/ping', (req, res) => {
      res.status(200).send('pong');
    });

    app.get('/', (req, res) => {
      res.send("Hello!");
    });

    server.listen(port, () => {
      console.log(`The website is running on http://localhost:${port}`);
      console.log(`Socket.io server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();