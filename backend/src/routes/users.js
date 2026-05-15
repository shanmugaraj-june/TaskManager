const express = require('express');
const { getUsers, getUser } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/', requireAdmin, getUsers);
router.get('/:id', getUser);

module.exports = router;
