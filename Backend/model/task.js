const mongoose = require('mongoose');

// Define status enum values
const TASK_STATUS = {
  OPEN: 'open',
  BIDDING: 'bidding',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Check if the model exists before creating it
let Task;
try {
  Task = mongoose.model('Task');
} catch {
  const taskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    credits: {
      type: Number,
      required: [true, 'Please add credit value'],
      min: [1, 'Credits must be at least 1']
    },
    lockedCredits: {
      type: Number,
      default: 0,
      min: [0, 'Locked credits cannot be negative']
    },
    skills: [{
      type: String,
      required: true
    }],
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline']
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.OPEN
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Please add estimated hours'],
      min: [1, 'Estimated hours must be at least 1']
    },
    category: {
      type: String,
      required: [true, 'Please add a category']
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    submission: {
      content: String,
      submittedAt: Date,
      files: [{
        path: String,
        originalname: String
      }]
    },
    rejectionReason: String,
    aiReview: {
      type: String,
      default: ''
    },
    maxBidders: {
      type: Number,
      default: 5,
      min: [1, 'Must allow at least 1 bidder'],
      max: [20, 'Cannot exceed 20 bidders']
    },
    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        credits: {
          type: Number,
          default: 0,
          min: [0, 'Credits cannot be negative']
        },
        days: {
          type: Number,
          default: 1,
          min: [1, 'Days must be at least 1']
        },
        message: {
          type: String,
          default: ''
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Index for better query performance
  taskSchema.index({ status: 1, creator: 1, claimant: 1 });

  Task = mongoose.model('Task', taskSchema);
}

// Debug log
console.log('Task model defined:', Task);

module.exports = { Task, TASK_STATUS };
