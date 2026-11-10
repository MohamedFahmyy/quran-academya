const app = require('./app');
const config = require('./config/app.config');

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`  Al Quran Academy Website Server`);
  console.log(`  Environment: ${config.env}`);
  console.log(`  Port:        ${config.port}`);
  console.log(`  URL:         http://localhost:${config.port}`);
  console.log(`===============================================`);
});

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed successfully. Exiting process.');
    process.exit(0);
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    console.error('Forced shutdown due to lingering connections.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

