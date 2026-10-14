import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
}));

// Rate limiting
if (config.env !== 'test') {
  app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// API routes
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Circuvio API - From digital waste to ecological worth',
    version: '2.0.0',
    docs: '/api/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
