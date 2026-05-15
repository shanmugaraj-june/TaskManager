const prisma = require('../config/database');

// GET /api/users  (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { assignedTasks: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(users.map(u => ({ ...u, taskCount: u._count.assignedTasks })));
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        projectMembers: { select: { project: { select: { id: true, name: true } } } },
        _count: { select: { assignedTasks: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      ...user,
      projects: user.projectMembers.map(m => m.project),
      taskCount: user._count.assignedTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser };
