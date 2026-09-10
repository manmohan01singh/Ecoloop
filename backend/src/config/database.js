import { Sequelize } from 'sequelize';
import config from './env.js';
import logger from '../utils/logger.js';

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;
