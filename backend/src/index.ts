import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pipelineRoutes from './routes/pipeline.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/pipelines', pipelineRoutes);

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 