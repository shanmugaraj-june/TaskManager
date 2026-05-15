// dashboard.js
const express = require('express');
const { getDashboard, getMyTasksSummary } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/', getDashboard);
router.get('/my-tasks', getMyTasksSummary);

module.exports = router;
