const prisma = require('../config/database');

const taskSelect = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  projectId: true,
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true } },
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
};

const formatTask = (task) => ({
  ...task,
  isOverdue: isOverdue(task.dueDate, task.status),
});

// GET /api/projects/:id/tasks
const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId, overdue } = req.query;
    const projectId = req.params.id;

    const where = { projectId };
    if (status) where.status = status.toUpperCase().replace('-', '_');
    if (priority) where.priority = priority.toUpperCase();
    if (assigneeId) where.assigneeId = assigneeId;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    }

    // Members only see their own tasks unless they're project admin
    if (req.user.role !== 'ADMIN') {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { adminId: true } });
      if (project.adminId !== req.user.id) {
        where.assigneeId = req.user.id;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: [{ status: 'asc' }, { priority: 'asc' }, { dueDate: 'asc' }],
    });

    res.json(tasks.map(formatTask));
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/my  — tasks assigned to current user
const getMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { assigneeId: req.user.id };
    if (status) where.status = status.toUpperCase().replace('-', '_');

    const tasks = await prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
    });

    res.json(tasks.map(formatTask));
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: taskSelect });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(formatTask(task));
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, assigneeId, dueDate } = req.body;
    const projectId = req.params.id;

    // Verify assignee is project member (if provided)
    if (assigneeId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!membership) {
        return res.status(400).json({ error: 'Assignee must be a member of this project.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority?.toUpperCase() || 'MEDIUM',
        status: status?.toUpperCase().replace('-', '_') || 'TODO',
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
      select: taskSelect,
    });

    res.status(201).json(formatTask(task));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      select: { ...taskSelect, project: { select: { adminId: true } } },
    });

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const isAdmin = req.user.role === 'ADMIN' || task.project.adminId === req.user.id;
    const isAssignee = task.assignee?.id === req.user.id;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ error: 'You do not have permission to update this task.' });
    }

    // Members can only update status of their own tasks
    let updateData = {};
    if (isAdmin) {
      const { title, description, priority, status, assigneeId, dueDate } = req.body;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority.toUpperCase();
      if (status !== undefined) updateData.status = status.toUpperCase().replace('-', '_');
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    } else {
      // Member: only status
      if (req.body.status !== undefined) {
        updateData.status = req.body.status.toUpperCase().replace('-', '_');
      }
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      select: taskSelect,
    });

    res.json(formatTask(updated));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      select: { projectId: true, project: { select: { adminId: true } } },
    });

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const isAdmin = req.user.role === 'ADMIN' || task.project.adminId === req.user.id;
    if (!isAdmin) return res.status(403).json({ error: 'Only project admins can delete tasks.' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectTasks, getMyTasks, getTask, createTask, updateTask, deleteTask };
