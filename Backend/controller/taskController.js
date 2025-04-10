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

 //   PUT Method for claiming a task -> route(/api/tasks/:id/claim):
 
 exports.claimTask = async (req, res) => {
     try {
       let task = await Task.findById(req.params.id);
       
       if (!task) {
         return res.status(404).json({
           success: false,
           message: 'Task not found'
         });
       }
       
       // Check if task is already claimed
       if (task.status !== 'open') {
         return res.status(400).json({
           success: false,
           message: 'This task is not available for claiming'
         });
       }
       
       // Check if user is trying to claim their own task
       if (task.creator.toString() === req.user.id) {
         return res.status(400).json({
           success: false,
           message: 'You cannot claim your own task'
         });
       }
       
       // Update task
       task.claimer = req.user.id;
       task.status = 'claimed';
       await task.save();
       
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
 
   // @desc    Submit task for review
 // @route   PUT /api/tasks/:id/submit
 // @access  Private
 exports.submitTask = async (req, res) => {
   try {
     let task = await Task.findById(req.params.id);
     
     if (!task) {
       return res.status(404).json({
         success: false,
         message: 'Task not found'
       });
     }
     
     // Check if user is the claimer
     if (task.claimer.toString() !== req.user.id) {
       return res.status(401).json({
         success: false,
         message: 'You can only submit tasks you have claimed'
       });
     }
     
     // Check if task is in claimed status
     if (task.status !== 'claimed') {
       return res.status(400).json({
         success: false,
         message: 'This task cannot be submitted at this time'
       });
     }
     
     // Generate AI review for complex remote tasks
     let aiReview = null;
     if (task.complexity === 'complex' && task.location === 'remote') {
       // This would be an actual AI API call in production
       aiReview = {
         score: Math.floor(Math.random() * 20) + 80, // 80-100 score
         feedback: 'AI-generated review of the submission',
         completion: 'High',
         reviewedAt: new Date()
       };
     }
     
     // Update task
     task.submission = {
       content: req.body.content,
       submittedAt: new Date(),
       files: req.body.files || [],
       aiReview
     };
     task.status = 'in_review';
     await task.save();
     
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
 
 // @desc    Mark offline task as complete
 // @route   PUT /api/tasks/:id/mark-complete
 // @access  Private
 exports.markOfflineTaskComplete = async (req, res) => {
   try {
     let task = await Task.findById(req.params.id);
     
     if (!task) {
       return res.status(404).json({
         success: false,
         message: 'Task not found'
       });
     }
     
     // Check if user is the claimer
     if (task.claimer.toString() !== req.user.id) {
       return res.status(401).json({
         success: false,
         message: 'You can only mark tasks you have claimed as complete'
       });
     }
     
     // Check if task is in claimed status and is offline
     if (task.status !== 'claimed' || task.location !== 'offline') {
       return res.status(400).json({
         success: false,
         message: 'This task cannot be marked as complete at this time'
       });
     }
     
     // Update task
     task.submission = {
       content: "Task completed offline",
       submittedAt: new Date(),
       files: []
     };
     task.status = 'in_review';
     await task.save();
     
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
 
 // @desc    Approve a task
 // @route   PUT /api/tasks/:id/approve
 // @access  Private
 exports.approveTask = async (req, res) => {
   try {
     let task = await Task.findById(req.params.id);
     
     if (!task) {
       return res.status(404).json({
         success: false,
         message: 'Task not found'
       });
     }
     
     // Check if user is the creator
     if (task.creator.toString() !== req.user.id) {
       return res.status(401).json({
         success: false,
         message: 'You can only approve tasks you created'
       });
     }
     
     // Check if task is in review status
     if (task.status !== 'in_review') {
       return res.status(400).json({
         success: false,
         message: 'This task is not ready for approval'
       });
     }
     
     // Add credits to claimer
     const claimer = await User.findById(task.claimer);
     claimer.credits += task.credits;
     claimer.tasksCompleted += 1;
     
     // Calculate new rating for claimer
     if (req.body.rating) {
       const newRatingCount = claimer.ratingCount + 1;
       const newRating = ((claimer.rating * claimer.ratingCount) + req.body.rating) / newRatingCount;
       claimer.rating = newRating.toFixed(1);
       claimer.ratingCount = newRatingCount;
     }
     
     await claimer.save();
     
     // Update task
     task.status = 'completed';
     task.review = {
       rating: req.body.rating,
       comment: req.body.comment,
       reviewedAt: new Date()
     };
     await task.save();
     
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
 
 // @desc    Reject a task
 // @route   PUT /api/tasks/:id/reject
 // @access  Private
 exports.rejectTask = async (req, res) => {
   try {
     let task = await Task.findById(req.params.id);
     
     if (!task) {
       return res.status(404).json({
         success: false,
         message: 'Task not found'
       });
     }
     
     // Check if user is the creator
     if (task.creator.toString() !== req.user.id) {
       return res.status(401).json({
         success: false,
         message: 'You can only reject tasks you created'
       });
     }
     
     // Check if task is in review status
     if (task.status !== 'in_review') {
       return res.status(400).json({
         success: false,
         message: 'This task cannot be rejected at this time'
       });
     }
     
     // Update task submission with feedback
     task.submission.feedback = req.body.feedback;
     task.status = 'claimed'; // Return to claimed status for resubmission
     await task.save();
     
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
 
 // @desc    Cancel a task
 // @route   PUT /api/tasks/:id/cancel
 // @access  Private
 exports.cancelTask = async (req, res) => {
   try {
     let task = await Task.findById(req.params.id);
     
     if (!task) {
       return res.status(404).json({
         success: false,
         message: 'Task not found'
       });
     }
     
     // Check if user is the creator
     if (task.creator.toString() !== req.user.id) {
       return res.status(401).json({
         success: false,
         message: 'You can only cancel tasks you created'
       });
     }
     
     // Check if task can be cancelled
     if (!['open', 'claimed'].includes(task.status)) {
       return res.status(400).json({
         success: false,
         message: 'This task cannot be cancelled at this time'
       });
     }
     
     // Refund credits to creator
     const creator = await User.findById(task.creator);
     creator.credits += task.credits;
     await creator.save();
     
     // Update task
     task.status = 'cancelled';
     await task.save();
     
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