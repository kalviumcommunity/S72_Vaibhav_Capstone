const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  claimTask,
  submitTask,
  markOfflineTaskComplete,
  approveTask,
  rejectTask,
  cancelTask
} = require('../controller/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTask);


router.post('/upload-file', protect, upload.single('file'), uploadTaskFile);
router.get('/:taskId/files/:filename', protect, downloadTaskFile);

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

module.exports = router;
