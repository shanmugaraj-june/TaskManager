const express = require('express');
const { body } = require('express-validator');
const { getMyTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/my', getMyTasks);
router.get('/:id', getTask);

router.patch('/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Priority: high, medium, or low.'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Status: todo, in-progress, or done.'),
    body('assigneeId').optional({ nullable: true }).isUUID().withMessage('Valid assignee ID.'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Valid ISO date.'),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;
