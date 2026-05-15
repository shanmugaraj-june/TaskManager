const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Related record not found.' });
  }

  // Express-validator errors passed manually
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Generic server error
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error.',
  });
};

module.exports = errorHandler;
