const prisma = require('../config/database');

const projectSelect = {
  id: true,
  name: true,
  description: true,
  adminId: true,
  createdAt: true,
  updatedAt: true,
  admin: { select: { id: true, name: true, email: true } },
  members: {
    select: {
      joinedAt: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  _count: { select: { tasks: true } },
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const where = req.user.role === 'ADMIN'
      ? {}
      : { members: { some: { userId: req.user.id } } };

    const projects = await prisma.project.findMany({
      where,
      select: projectSelect,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = projects.map(p => ({
      ...p,
      memberCount: p.members.length,
      taskCount: p._count.tasks,
      members: p.members.map(m => ({ ...m.user, joinedAt: m.joinedAt })),
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: projectSelect,
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    res.json({
      ...project,
      memberCount: project.members.length,
      taskCount: project._count.tasks,
      members: project.members.map(m => ({ ...m.user, joinedAt: m.joinedAt })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        adminId: req.user.id,
        members: { create: { userId: req.user.id } },
      },
      select: projectSelect,
    });

    res.status(201).json({
      ...project,
      memberCount: project.members.length,
      taskCount: project._count.tasks,
      members: project.members.map(m => ({ ...m.user, joinedAt: m.joinedAt })),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      select: projectSelect,
    });

    res.json({
      ...project,
      memberCount: project.members.length,
      taskCount: project._count.tasks,
      members: project.members.map(m => ({ ...m.user, joinedAt: m.joinedAt })),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const taskCount = await prisma.task.count({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully.', tasksDeleted: taskCount });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) return res.status(409).json({ error: 'User is already a member.' });

    await prisma.projectMember.create({ data: { projectId, userId } });
    const count = await prisma.projectMember.count({ where: { projectId } });

    res.status(201).json({ message: 'Member added successfully.', memberCount: count });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { adminId: true } });
    if (project.adminId === userId) {
      return res.status(400).json({ error: 'Cannot remove the project admin.' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    // Unassign their tasks
    await prisma.task.updateMany({
      where: { projectId, assigneeId: userId },
      data: { assigneeId: null },
    });

    res.json({ message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
