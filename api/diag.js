// Diagnostic test function
module.exports = (req, res) => {
  try {
    const hasPg = !!require('pg');
    const hasBetterAuth = !!require('better-auth');
    res.status(200).json({
      status: 'ok',
      hasPg,
      hasBetterAuth,
      nodeVersion: process.version,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
