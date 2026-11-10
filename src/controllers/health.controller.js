exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Al Quran Academy Website',
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

