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
  origin: ['https://credbuzz.netlify.app'],
  credentials: true // if you use cookies or authentication
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

  socket.on('sendMessage', ({ taskId, message, user }) => {
    io.to(taskId).emit('receiveMessage', { message, user, timestamp: new Date() });
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database successfully!');
    
    // Load routes after database connection
    const userRoutes = require('./routes/userRoutes');
    const taskRoutes = require('./routes/taskRoutes');
    const authRoutes = require('./routes/authRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/tasks', taskRoutes);

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