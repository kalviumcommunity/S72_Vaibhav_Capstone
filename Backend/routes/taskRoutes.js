
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
router.post('/', createTask);
router.put('/:id/claim', protect, claimTask);
router.put('/:id/submit', protect, submitTask);
router.put('/:id/mark-complete', protect, markOfflineTaskComplete);
router.put('/:id/approve', protect, approveTask);
router.put('/:id/reject', protect, rejectTask);
router.put('/:id/cancel', protect, cancelTask);

module.exports = router;
