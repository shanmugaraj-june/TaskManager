const prisma = require('../config/database');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.id;
    const today = new Date();

    // Scope: admins see everything, members see their assigned tasks
    const taskWhere = isAdmin ? {} : { assigneeId: userId };
    const projectWhere = isAdmin ? {} : { members: { some: { userId } } };

    const [totalTasks, todoCount, inProgressCount, doneCount, overdueCount, projects, tasksByUser] =
      await Promise.all([
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
        prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { ...taskWhere, status: 'DONE' } }),
        prisma.task.count({
          where: { ...taskWhere, dueDate: { lt: today }, status: { not: 'DONE' } },
        }),
        prisma.project.count({ where: projectWhere }),
        isAdmin
          ? prisma.task.groupBy({
              by: ['assigneeId'],
              where: { assigneeId: { not: null } },
              _count: { id: true },
              orderBy: { _count: { id: 'desc' } },
              take: 6,
            })
          : [],
      ]);

    // Hydrate user names for tasksByUser
    let byUser = [];
    if (tasksByUser.length) {
      const userIds = tasksByUser.map(t => t.assigneeId).filter(Boolean);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      byUser = tasksByUser.map(t => ({
        user: users.find(u => u.id === t.assigneeId),
        taskCount: t._count.id,
      }));
    }

    // Recent tasks (last 7 days)
    const recentTasks = await prisma.task.findMany({
      where: {
        ...taskWhere,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true, title: true, status: true, priority: true, dueDate: true,
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      stats: {
        totalTasks,
        byStatus: { todo: todoCount, inProgress: inProgressCount, done: doneCount },
        overdue: overdueCount,
        activeProjects: projects,
      },
      tasksByUser: byUser,
      recentTasks: recentTasks.map(t => ({
        ...t,
        isOverdue: t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < today,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/my-tasks
const getMyTasksSummary = async (req, res, next) => {
  try {
    const { status } = req.query;
    const today = new Date();
    const where = { assigneeId: req.user.id };
    if (status) where.status = status.toUpperCase().replace('-', '_');

    const [tasks, overdueCount] = await Promise.all([
      prisma.task.findMany({
        where,
        select: {
          id: true, title: true, status: true, priority: true, dueDate: true,
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
      }),
      prisma.task.count({
        where: { assigneeId: req.user.id, dueDate: { lt: today }, status: { not: 'DONE' } },
      }),
    ]);

    res.json({
      assigned: tasks.length,
      overdue: overdueCount,
      tasks: tasks.map(t => ({
        ...t,
        isOverdue: t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < today,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getMyTasksSummary };
