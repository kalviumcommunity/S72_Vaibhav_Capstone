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

// Protected routes
router.post('/', protect, createTask);
router.put('/:id/claim', protect, claimTask);
router.put('/:id/submit', protect, submitTask);
router.put('/:id/mark-complete', protect, markOfflineTaskComplete);
router.put('/:id/approve', protect, approveTask);
router.put('/:id/reject', protect, rejectTask);
router.put('/:id/cancel', protect, cancelTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.get('/:id/files/:filename', protect, downloadFile);

// Public routes
router.get('/available', getAvailableTasks);
router.get('/', getTasks);
router.get('/autocomplete-titles', getTitleSuggestions);
router.get('/autocomplete-descriptions', getDescriptionSuggestions);

// This should be last because it matches any string after /tasks/
router.get('/:id', getTask);

module.exports = router;
