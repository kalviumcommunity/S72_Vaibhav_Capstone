const mongoose = require('mongoose');
const { Task, TASK_STATUS } = require('../model/task');
const User = require('../model/user');
const axios = require('axios'); // Import axios
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Load environment variables from .env file
require('dotenv').config();

// Configure multer for file uploads
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

// Debug log to check if Task is properly imported
console.log('Task model:', Task);

// @desc    Get available tasks
// @route   GET /api/tasks/available
// @access  Public
const getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      status: { $in: [TASK_STATUS.OPEN, TASK_STATUS.BIDDING] },
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

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
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
        status: { $in: [TASK_STATUS.OPEN, TASK_STATUS.BIDDING] },
        claimant: null
      };
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

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
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
      })
      .populate({
        path: 'bids.bidder',
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

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
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

    // Create the task with locked credits
    const task = await Task.create({
      ...req.body,
      creator: req.user.id,
      lockedCredits: 0 // Credits locked later in escrow when a proposal is selected
    });

    // Update creator's tasksCreated count
    creator.tasksCreated += 1;
    await creator.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully. Credits will be locked once you select a proposal.',
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

// @desc    Claim a task
// @route   POST /api/tasks/:id/claim
// @access  Private
const claimTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task is already claimed
    if (task.claimant) {
      return res.status(400).json({
        success: false,
        message: 'Task is already claimed'
      });
    }

    // Check if task is open
    if (task.status !== TASK_STATUS.OPEN) {
      return res.status(400).json({
        success: false,
        message: 'Task is not available for claiming'
      });
    }

    // Check if user is trying to claim their own task
    if (task.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own task'
      });
    }

    // Update task with claimant
    task.claimant = req.user._id;
    task.status = TASK_STATUS.IN_PROGRESS;
    task.claimedAt = Date.now();
    
    await task.save();

    // Populate the task with creator and claimant details
    await task.populate('creator', 'name avatar rating');
    await task.populate('claimant', 'name avatar rating');

    res.json({
      success: true,
      message: 'Task claimed successfully',
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

// @desc    Submit task
// @route   PUT /api/tasks/:id/submit
// @access  Private
const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.claimant.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this task' });
    }
    // Handle file uploads
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const files = req.files ? req.files.map(file => file.filename) : [];
        const content = req.body.content || '';

        // Update task with submission details
        let filesArr = [];
        if (req.files && Array.isArray(req.files)) {
          filesArr = req.files.map(f => ({ path: f.path, originalname: f.originalname }));
        } else if (req.file) {
          filesArr = [{ path: req.file.path, originalname: req.file.originalname }];
        }
        task.submission = {
          content: content,
          submittedAt: new Date(),
          files: filesArr
        };
        task.status = TASK_STATUS.SUBMITTED;

        // AI Review logic
        try {
          if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not set, skipping AI review');
            task.aiReview = 'AI review unavailable - service not configured.';
          } else {
            const prompt = `You are an expert reviewer. Review the following task submission for quality and relevance.\nTitle: ${task.title}\nDescription: ${task.description}\nSubmission: ${task.submission.content}\nGive a short review (2-3 sentences) and a score out of 10. Format: Review: <text>\nScore: <number>.`;
            
            console.log('Calling Gemini API for AI review...');
            console.log('API Key present:', !!process.env.GEMINI_API_KEY, 'Key length:', process.env.GEMINI_API_KEY?.length);
            
            const geminiResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                contents: [
                  { parts: [{ text: prompt }] }
                ]
              },
              { 
                headers: { 
                  'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
              }
            );
            
            const aiReview = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (aiReview) {
              console.log('AI review generated successfully');
              task.aiReview = aiReview;
            } else {
              console.warn('No AI review text in Gemini response');
              task.aiReview = 'AI review unavailable - no response from AI service.';
            }
          }
        } catch (err) {
          console.error('Error generating AI review:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          task.aiReview = 'AI review unavailable - error contacting AI service.';
        }

        // Save the task
        await task.save();

        // Populate the task with creator and claimant details
        await task.populate('creator', 'name avatar rating');
        await task.populate('claimant', 'name avatar rating');

        res.json({
          success: true,
          task
        });
      } catch (error) {
        console.error('Error saving task submission:', error);
        res.status(500).json({
          success: false,
          message: 'Error saving task submission'
        });
      }
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting task'
    });
  }
};

// @desc    Download task file
// @route   GET /api/tasks/:id/files/:filename
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    console.log(`Attempting to download file: ${filename} for task ID: ${id}`);

    // Construct the file path
    const filePath = path.join(__dirname, '../uploads/tasks', filename);
    console.log(`Full file path: ${filePath}`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found at: ${filePath}`);
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ success: false, message: 'Failed to download file.' });
      }
    });
  } catch (error) {
    console.error('Error in downloadFile controller:', error);
    res.status(500).json({ success: false, message: 'Server error during file download.' });
  }
};

// @desc    Mark offline task as complete
// @route   PUT /api/tasks/:id/mark-complete
// @access  Private
const markOfflineTaskComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this task as complete'
      });
    }

    task.status = 'completed';
    await task.save();

    // Update user credits using locked credits
    const claimant = await User.findById(task.claimant);
    if (claimant) {
      claimant.credits += task.lockedCredits;
      claimant.tasksCompleted += 1;
      await claimant.save();
    }

    // Creator credits were already deducted at proposal selection (escrow)
    // No further deduction needed here

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error marking task as complete:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking task as complete'
    });
  }
};

// @desc    Approve task
// @route   PUT /api/tasks/:id/approve
// @access  Private
const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this task' });
    }
    // Only transfer credits if approved
    const claimant = await User.findById(task.claimant);
    if (claimant) {
      claimant.credits += task.lockedCredits; // Transfer locked credits to claimant
      claimant.tasksCompleted += 1;
      await claimant.save();
    }
    // Creator credits were already deducted at proposal selection (escrow)
    // Clear locked credits and mark as completed
    task.lockedCredits = 0;
    task.status = TASK_STATUS.COMPLETED;
    await task.save();
    await task.populate('creator', 'name avatar rating');
    await task.populate('claimant', 'name avatar rating');
    res.json({ success: true, message: 'Task approved successfully. Credits transferred to claimant.', task });
  } catch (error) {
    console.error('Error approving task:', error);
    res.status(500).json({ success: false, message: 'Error approving task' });
  }
};

// @desc    Reject task
// @route   PUT /api/tasks/:id/reject
// @access  Private
const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this task' });
    }
    
    // Refund locked credits to creator when rejected
    const creator = await User.findById(task.creator);
    if (creator && task.lockedCredits > 0) {
      creator.credits += task.lockedCredits;
      await creator.save();
    }
    
    task.status = TASK_STATUS.REJECTED;
    task.rejectionReason = req.body.reason;
    task.lockedCredits = 0; // Clear locked credits
    await task.save();
    await task.populate('creator', 'name avatar rating');
    await task.populate('claimant', 'name avatar rating');
    res.json({ success: true, message: 'Task rejected and credits refunded to creator.', task });
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({ success: false, message: 'Error rejecting task' });
  }
};

// @desc    Cancel task
// @route   PUT /api/tasks/:id/cancel
// @access  Private
const cancelTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this task'
      });
    }

    // Refund locked credits when task is cancelled
    if (task.lockedCredits > 0) {
      const creator = await User.findById(task.creator);
      if (creator) {
        creator.credits += task.lockedCredits;
        await creator.save();
      }
    }

    task.status = 'cancelled';
    task.lockedCredits = 0;
    await task.save();

    res.json({
      success: true,
      message: 'Task cancelled successfully and locked credits refunded.',
      task
    });
  } catch (error) {
    console.error('Error cancelling task:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if the user is the task creator
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    // Don't allow deletion of completed tasks (to preserve payment history)
    if (task.status === TASK_STATUS.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Cannot delete completed tasks. Please cancel first if needed.' });
    }

    // Return locked credits to creator if task is deleted
    const creator = await User.findById(task.creator);
    if (creator && task.lockedCredits > 0) {
      creator.credits += task.lockedCredits;
      await creator.save();
      console.log(`Returned ${task.lockedCredits} locked credits to user ${creator.email}. New balance: ${creator.credits}`);
    } else if (!creator) {
      console.error('Creator not found when deleting task:', task.creator);
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully and locked credits returned to creator.' });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
};

// @desc    Place a bid on a task
// @route   POST /api/tasks/:id/bid
// @access  Private
const placeBid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.status !== TASK_STATUS.OPEN && task.status !== TASK_STATUS.BIDDING) {
      return res.status(400).json({ success: false, message: 'This task is no longer accepting proposals' });
    }

    if (task.claimant) {
      return res.status(400).json({ success: false, message: 'This task has already been assigned' });
    }

    if (task.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot bid on your own task' });
    }

    const alreadyBid = task.bids.some(b => b.bidder.toString() === req.user._id.toString());
    if (alreadyBid) {
      return res.status(400).json({ success: false, message: 'You have already placed a bid on this task' });
    }

    if (task.maxBidders && task.bids.length >= task.maxBidders) {
      return res.status(400).json({ success: false, message: `This task has reached its maximum number of proposals (${task.maxBidders})` });
    }

    const { message, credits, days } = req.body;
    task.bids.push({ bidder: req.user._id, credits: Number(credits) || 0, days: Number(days) || 1, message: message || '' });

    // Transition OPEN → BIDDING on first proposal
    if (task.status === TASK_STATUS.OPEN) {
      task.status = TASK_STATUS.BIDDING;
    }
    await task.save();

    await task.populate('creator', 'name avatar rating');
    await task.populate('claimant', 'name avatar rating');
    await task.populate('bids.bidder', 'name avatar rating');

    res.status(201).json({ success: true, message: 'Proposal submitted successfully', task });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: 'Error placing bid' });
  }
};

// @desc    Select a bidder and assign the task
// @route   PUT /api/tasks/:id/select-bidder
// @access  Private (creator only)
const selectBidder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the task creator can select a bidder' });
    }

    if (task.status !== TASK_STATUS.OPEN && task.status !== TASK_STATUS.BIDDING) {
      return res.status(400).json({ success: false, message: 'Task is not accepting proposals' });
    }

    if (task.claimant) {
      return res.status(400).json({ success: false, message: 'Task has already been assigned' });
    }

    const { bidderId } = req.body;
    if (!bidderId || !mongoose.Types.ObjectId.isValid(bidderId)) {
      return res.status(400).json({ success: false, message: 'Invalid bidder ID' });
    }

    const bidExists = task.bids.some(b => b.bidder.toString() === bidderId);
    if (!bidExists) {
      return res.status(404).json({ success: false, message: 'Selected user has not submitted a proposal for this task' });
    }

    // Lock credits in escrow by deducting from creator's balance now
    const creator = await User.findById(task.creator);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    if (creator.credits < task.credits) {
      return res.status(400).json({ success: false, message: 'Insufficient credits to lock for this task' });
    }
    creator.credits -= task.credits;
    await creator.save();

    task.claimant = bidderId;
    task.status = TASK_STATUS.ASSIGNED;
    task.lockedCredits = task.credits;
    task.claimedAt = Date.now();
    await task.save();

    await task.populate('creator', 'name avatar rating');
    await task.populate('claimant', 'name avatar rating');
    await task.populate('bids.bidder', 'name avatar rating');

    res.json({ success: true, message: 'Proposal accepted. Credits locked in escrow. Worker has been assigned.', task });
  } catch (error) {
    console.error('Error selecting bidder:', error);
    res.status(500).json({ success: false, message: 'Error selecting bidder' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if the user is the task creator
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    // Only allow update if task is OPEN and unclaimed
    if (task.status !== TASK_STATUS.OPEN || task.claimant) {
      return res.status(400).json({ success: false, message: 'Only open and unclaimed tasks can be updated' });
    }

    // Update task fields - only update if provided
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.credits !== undefined) task.credits = req.body.credits;
    if (req.body.estimatedHours !== undefined) task.estimatedHours = req.body.estimatedHours;
    if (req.body.category !== undefined) task.category = req.body.category;
    if (req.body.skills !== undefined) task.skills = req.body.skills;
    if (req.body.deadline !== undefined && req.body.deadline !== '') {
      task.deadline = new Date(req.body.deadline);
    }

    const updatedTask = await task.save();

    res.json({ success: true, task: updatedTask });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
};

// @desc    Get title suggestions
// @route   GET /api/tasks/autocomplete-titles
// @access  Public
const getTitleSuggestions = async (req, res) => {
  const { query } = req.query;

  console.log('Title suggestions request received:', { query, length: query?.length });

  if (!query || query.length < 3) {
    return res.json({ success: true, suggestions: [] }); // Return empty for short queries
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ success: false, message: 'AI service not configured' });
  }

  try {
    const prompt = `Generate 3-5 concise, relevant, and creative task title suggestions based on the following incomplete input, suitable for a task marketplace. Only provide the suggestions as a comma-separated list, without any introductory or concluding sentences. If no good suggestions, return nothing: ${query}`;

    console.log('Calling Gemini API for title suggestions...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY, 'Key length:', process.env.GEMINI_API_KEY?.length);
    
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Gemini API response received');
    const generatedText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    let suggestions = [];

    if (generatedText) {
      // Attempt to parse as a comma-separated list
      suggestions = generatedText.split(',').map(s => s.trim()).filter(s => s.length > 0);
      console.log('Parsed suggestions:', suggestions);
    } else {
      console.warn('No generated text in Gemini response');
    }
    
    res.json({ success: true, suggestions });

  } catch (error) {
    console.error('Error fetching title suggestions from Gemini API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get description suggestions
// @route   GET /api/tasks/autocomplete-descriptions
// @access  Public
const getDescriptionSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 10) { // Require a bit more input for descriptions
    return res.json({ success: true, suggestions: [] });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ success: false, message: 'AI service not configured' });
  }

  try {
    const prompt = `Generate 1-2 detailed and comprehensive task description suggestions based on the following incomplete input, suitable for a task marketplace. Focus on clarity, required deliverables, and any specific constraints. Only provide the suggestions as a numbered list, without any introductory or concluding sentences. If no good suggestions, return nothing: ${query}`;

    console.log('Calling Gemini API for description suggestions...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY, 'Key length:', process.env.GEMINI_API_KEY?.length);
    
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Gemini API response received for descriptions');
    const generatedText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    let suggestions = [];

    if (generatedText) {
      // Assuming numbered list, split by newline and remove numbering
      suggestions = generatedText.split(/\d+\.\s*/).map(s => s.trim()).filter(s => s.length > 0);
      console.log('Parsed description suggestions:', suggestions);
    } else {
      console.warn('No generated text in Gemini response for descriptions');
    }
    
    res.json({ success: true, suggestions });

  } catch (error) {
    console.error('Error fetching description suggestions from Gemini API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = {
  getAvailableTasks,
  getTasks,
  getTask,
  createTask,
  claimTask,
  placeBid,
  selectBidder,
  submitTask,
  downloadFile,
  markOfflineTaskComplete,
  approveTask,
  rejectTask,
  cancelTask,
  deleteTask,
  updateTask,
  getTitleSuggestions,
  getDescriptionSuggestions
};