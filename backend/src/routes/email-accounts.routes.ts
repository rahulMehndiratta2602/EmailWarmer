import express from 'express';
import { emailAccountService } from '../services/email-account.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all email accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await emailAccountService.getAllEmailAccounts();
    res.json(accounts);
  } catch (error) {
    logger.error('Error in GET /email-accounts:', error);
    res.status(500).json({ error: 'Failed to fetch email accounts' });
  }
});

// Create new email account
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const account = await emailAccountService.createEmailAccount({ email, password });
    res.status(201).json(account);
  } catch (error) {
    logger.error('Error in POST /email-accounts:', error);
    res.status(500).json({ error: 'Failed to create email account' });
  }
});

// Batch operations - MUST come before /:id routes to prevent routing conflicts
// Create or update multiple email accounts (upsert)
router.post('/batch', async (req, res) => {
  try {
    const { accounts } = req.body;
    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({ error: 'Valid accounts array is required' });
    }
    
    const result = await emailAccountService.batchUpsertEmailAccounts(accounts);
    res.status(200).json({ count: result.count });
  } catch (error) {
    logger.error('Error in POST /email-accounts/batch:', error);
    res.status(500).json({ error: 'Failed to process batch operation' });
  }
});

// Optimized endpoint for file uploads with large number of accounts
router.post('/bulk-import', async (req, res) => {
  try {
    const { accounts } = req.body;
    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({ error: 'Valid accounts array is required' });
    }
    
    logger.info(`Received bulk import request with ${accounts.length} accounts`);
    
    // Use the optimized method for file imports
    const result = await emailAccountService.bulkCreateAccounts(accounts);
    
    res.status(200).json({ count: result.count });
  } catch (error) {
    logger.error('Error in POST /email-accounts/bulk-import:', error);
    res.status(500).json({ error: 'Failed to process bulk import operation' });
  }
});

// Delete multiple email accounts
router.delete('/batch', async (req, res) => {
  try {
    logger.info('Processing batch delete request');
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      logger.warn('Invalid batch delete request - missing or invalid ids array:', req.body);
      return res.status(400).json({ error: 'Valid ids array is required' });
    }
    
    logger.info(`Attempting to delete ${ids.length} email accounts`);
    const result = await emailAccountService.batchDeleteEmailAccounts(ids);
    logger.info(`Successfully deleted ${result.count} email accounts`);
    
    res.status(200).json({ count: result.count });
  } catch (error) {
    logger.error('Error in DELETE /email-accounts/batch:', error);
    res.status(500).json({ error: 'Failed to process batch delete operation' });
  }
});

// Get email account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await emailAccountService.getEmailAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    res.json(account);
  } catch (error) {
    logger.error(`Error in GET /email-accounts/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch email account' });
  }
});

// Update email account
router.patch('/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // At least one field must be provided
    if (!password && !email) {
      return res.status(400).json({ error: 'At least one field (email or password) is required' });
    }
    
    const updateData: { password?: string; email?: string } = {};
    if (password) updateData.password = password;
    if (email) updateData.email = email;
    
    const account = await emailAccountService.updateEmailAccount(req.params.id, updateData);

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    res.json(account);
  } catch (error) {
    logger.error(`Error in PATCH /email-accounts/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update email account' });
  }
});

// Delete email account
router.delete('/:id', async (req, res) => {
  try {
    const success = await emailAccountService.deleteEmailAccount(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in DELETE /email-accounts/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete email account' });
  }
});

export default router; 