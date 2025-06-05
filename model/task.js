const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
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
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    claimer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    credits: {
      type: Number,
      required: [true, 'Please add credit amount'],
      min: [1, 'Credits must be at least 1']
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'in_review', 'completed', 'cancelled'],
      default: 'open'
    },
    complexity: {
      type: String,
      enum: ['general', 'complex'],
      default: 'general'
    },
    location: {
      type: String,
      enum: ['remote', 'offline'],
      default: 'remote'
    },
    category: {
      type: String,
      required: [true, 'Please add a category']
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Please add estimated hours']
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline']
    },
    skills: {
      type: [String],
      default: []
    },
    submission: {
      content: String,
      submittedAt: Date,
      files: [String],
      feedback: String,
      aiReview: {
        score: Number,
        feedback: String,
        completion: String,
        reviewedAt: Date
      }
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reviewedAt: Date
    }
  }, {
    timestamps: true
  });
  
  module.exports = mongoose.model('Task', TaskSchema);
