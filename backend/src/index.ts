import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pipelineRoutes from './routes/pipeline.routes';
import actionRoutes from './routes/action.routes';
import emailAccountRoutes from './routes/email-accounts.routes';
import proxyRoutes from './routes/proxy.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// CORS configuration with all origins allowed
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/email-accounts', emailAccountRoutes);
app.use('/api/proxies', proxyRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// API test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Test route for generating log error
app.get('/api/test-log', (req, res) => {
  logger.error('This is a test error log');
  logger.warn('This is a test warning log');
  logger.info('This is a test info log');
  res.json({ message: 'Test logs generated. Check console and log file.' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`API is available at http://localhost:${port}/api`);
}); 