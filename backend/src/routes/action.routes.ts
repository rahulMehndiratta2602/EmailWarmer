import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// These would typically come from a database
const availableActions = [
  'Transfer from Spam to Inbox',
  'Click Link in Email',
  'Mark as Important',
  'Reply to Email',
  'Forward Email',
  'Delete Email',
  'Archive Email',
  'Star Email',
  'Move to Folder',
  'Tag Email',
  'Add to Contact List'
];

// Get all available actions
router.get('/', async (req, res) => {
  try {
    // In a real app, this would fetch from a database
    res.json(availableActions);
  } catch (error) {
    logger.error('Error in GET /actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// Get a specific action (not needed for this implementation but included for completeness)
router.get('/:id', async (req, res) => {
  try {
    const actionId = parseInt(req.params.id);
    if (isNaN(actionId) || actionId < 0 || actionId >= availableActions.length) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json({ action: availableActions[actionId] });
  } catch (error) {
    logger.error(`Error in GET /actions/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch action' });
  }
});

export default router; 