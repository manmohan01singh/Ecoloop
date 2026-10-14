import app from './app.js';
import config from './config/env.js';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import sequelize from './models/index.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    // Sync database models (creates tables if not exist)
    // Using force: false to avoid dropping tables, and alter: false to avoid constraint issues
    await sequelize.sync({ force: false, alter: false });
    logger.info('Database synced');

    // Start server
    app.listen(config.port, () => {
      logger.info(`Circuvio API running on port ${config.port} [${config.env}]`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
