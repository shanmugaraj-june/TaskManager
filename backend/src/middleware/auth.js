const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.projectId;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { adminId: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.adminId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the project admin can perform this action.' });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;

    // Global admins bypass membership check
    if (req.user.role === 'ADMIN') return next();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this project.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireAdmin, requireProjectAdmin, requireProjectMember };
