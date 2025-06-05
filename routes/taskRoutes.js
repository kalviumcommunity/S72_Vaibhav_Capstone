
const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  
} = require('../controller/taskController');
// const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTask);


module.exports = router;
