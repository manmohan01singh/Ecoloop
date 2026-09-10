import { createClient } from 'redis';
import config from './env.js';
import logger from '../utils/logger.js';

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err.message);
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error.message);
    // Don't exit - Redis is optional for MVP
  }
};

export default redisClient;
