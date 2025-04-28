import express from 'express';
import { pipelineService } from '../services/pipeline.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all pipelines
router.get('/', async (req, res) => {
  try {
    const pipelines = await pipelineService.getAllPipelines();
    res.json(pipelines);
  } catch (error) {
    logger.error('Error in GET /pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Get pipeline by ID
router.get('/:id', async (req, res) => {
  try {
    const pipeline = await pipelineService.getPipelineById(req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json(pipeline);
  } catch (error) {
    logger.error(`Error in GET /pipelines/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// Create new pipeline
router.post('/', async (req, res) => {
  try {
    const { name, nodes } = req.body;
    if (!name || !nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Invalid pipeline data' });
    }
    const pipeline = await pipelineService.createPipeline({ name, nodes });
    res.status(201).json(pipeline);
  } catch (error) {
    logger.error('Error in POST /pipelines:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

// Update pipeline
router.put('/:id', async (req, res) => {
  try {
    const { name, nodes } = req.body;
    if (!name || !nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Invalid pipeline data' });
    }
    const pipeline = await pipelineService.updatePipeline(req.params.id, { name, nodes });
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json(pipeline);
  } catch (error) {
    logger.error(`Error in PUT /pipelines/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update pipeline' });
  }
});

// Delete pipeline
router.delete('/:id', async (req, res) => {
  try {
    const success = await pipelineService.deletePipeline(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in DELETE /pipelines/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

export default router; 