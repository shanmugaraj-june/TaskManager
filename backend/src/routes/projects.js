const express = require('express');
const { body, param } = require('express-validator');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { createTask, getProjectTasks } = require('../controllers/taskController');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// Project CRUD
router.get('/', getProjects);

router.post('/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name is required (max 100 chars).'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 chars.'),
  ],
  validate,
  createProject
);

router.get('/:id', requireProjectMember, getProject);

router.put('/:id',
  requireProjectAdmin,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name max 100 chars.'),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  updateProject
);

router.delete('/:id', requireProjectAdmin, deleteProject);

// Members
router.post('/:id/members',
  requireProjectAdmin,
  [body('userId').isUUID().withMessage('Valid user ID required.')],
  validate,
  addMember
);

router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

// Tasks within project
router.get('/:id/tasks', requireProjectMember, getProjectTasks);

router.post('/:id/tasks',
  requireProjectAdmin,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title required (max 200 chars).'),
    body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Priority: high, medium, or low.'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Status: todo, in-progress, or done.'),
    body('assigneeId').optional().isUUID().withMessage('Valid assignee user ID required.'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date.'),
  ],
  validate,
  createTask
);

module.exports = router;
