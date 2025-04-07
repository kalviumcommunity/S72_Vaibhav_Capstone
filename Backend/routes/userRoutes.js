
const express = require('express');
const { getUsers, getUser} = require('../controller/userController');
// const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);


module.exports = router;