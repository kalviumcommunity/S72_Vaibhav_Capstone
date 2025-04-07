const Task = require('../model/task');
const User = require('../model/user');

exports.getTasks = async (req, res) => {
    try {
      // Build query
      let query = {};
      
      // Filter by status
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // Filter by category
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      // Filter by complexity
      if (req.query.complexity) {
        query.complexity = req.query.complexity;
      }
      
      // Filter by location
      if (req.query.location) {
        query.location = req.query.location;
      }
      
      const tasks = await Task.find(query)
        .populate('creator', 'name avatar rating')
        .populate('claimer', 'name avatar rating')
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };


//   GET Method to retireve a single task  -> route(/api/tasks/:id):

exports.getTask = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('creator', 'name avatar rating')
        .populate('claimer', 'name avatar rating');
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };

 //   POST Method to post a task  -> route(/api/tasks):
 
 exports.createTask = async (req, res) => {
  try {
    // Add creator to req.body
    req.body.creator = req.user.id;
    
    // Check if user has enough credits
    const user = await User.findById(req.user.id);
    if (user.credits < req.body.credits) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits'
      });
    }
    
    // Deduct credits from creator
    user.credits -= req.body.credits;
    user.tasksCreated += 1;
    await user.save();
    
    // Create task
    const task = await Task.create(req.body);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
