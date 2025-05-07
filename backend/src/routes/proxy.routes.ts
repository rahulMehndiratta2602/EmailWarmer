import express from 'express';
import { proxyService } from '../services/proxy.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Get proxies
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const proxies = await proxyService.getProxies(
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );
    res.json(proxies);
  } catch (error) {
    logger.error('Error in GET /proxies:', error);
    res.status(500).json({ error: 'Failed to fetch proxies' });
  }
});

// Get proxy by ID
router.get('/:id', async (req, res) => {
  try {
    const proxy = await proxyService.getProxyById(req.params.id);
    if (!proxy) {
      return res.status(404).json({ error: 'Proxy not found' });
    }
    res.json(proxy);
  } catch (error) {
    logger.error(`Error in GET /proxies/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch proxy' });
  }
});

// Delete a single proxy by ID
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`Deleting proxy with ID: ${req.params.id}`);
    const result = await proxyService.deleteProxies([req.params.id]);
    
    if (result === 0) {
      return res.status(404).json({ error: 'Proxy not found' });
    }
    
    res.status(200).json({ message: 'Proxy deleted successfully', count: result });
  } catch (error) {
    logger.error(`Error in DELETE /proxies/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete proxy' });
  }
});

// Fetch proxies from ABCProxy and save them
router.post('/fetch', async (req, res) => {
  try {
    // Extract parameters for the new API
    const { country = 'us', protocol = 'socks5', limit = 100 } = req.body;
    
    // Log the request parameters
    logger.info(`Fetching proxies from ABCProxy: country=${country}, protocol=${protocol}, limit=${limit}`);
    
    // Call the service method with the parameters
    const proxies = await proxyService.fetchAndSaveProxies(
      country,
      limit ? parseInt(limit.toString()) : undefined
    );
    
    res.status(201).json({
      message: `Successfully fetched and saved ${proxies.length} proxies`,
      proxies
    });
  } catch (error) {
    logger.error('Error in POST /proxies/fetch:', error);
    res.status(500).json({ error: 'Failed to fetch and save proxies' });
  }
});

// Create a session proxy
router.post('/session', async (req, res) => {
  try {
    const { minutes } = req.body;
    const proxy = await proxyService.createSessionProxy(
      minutes ? parseInt(minutes as string) : undefined
    );
    res.status(201).json(proxy);
  } catch (error) {
    logger.error('Error in POST /proxies/session:', error);
    res.status(500).json({ error: 'Failed to create session proxy' });
  }
});

// Update a proxy
router.patch('/:id', async (req, res) => {
  try {
    const proxy = await proxyService.updateProxy(req.params.id, req.body);
    if (!proxy) {
      return res.status(404).json({ error: 'Proxy not found' });
    }
    res.json(proxy);
  } catch (error) {
    logger.error(`Error in PATCH /proxies/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update proxy' });
  }
});

// Delete proxies
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Valid ids array is required' });
    }
    const count = await proxyService.deleteProxies(ids);
    res.json({ message: `Successfully deleted ${count} proxies`, count });
  } catch (error) {
    logger.error('Error in DELETE /proxies:', error);
    res.status(500).json({ error: 'Failed to delete proxies' });
  }
});

// Create proxy mapping - keep for backward compatibility
router.post('/mapping', async (req, res) => {
  try {
    // Since we no longer have a separate mapping service, we'll handle this directly
    // Get unmapped emails
    const unmappedEmails = await proxyService.getUnmappedEmails();
    // Get unmapped proxies
    const unmappedProxies = await proxyService.getUnmappedProxies();
    
    // Create mappings
    const mappings = await proxyService.createMappings(unmappedEmails, unmappedProxies);
    
    res.status(201).json({
      message: `Successfully created ${mappings.length} email-to-proxy mappings`,
      mappings
    });
  } catch (error) {
    logger.error('Error in POST /proxies/mapping:', error);
    res.status(500).json({ error: 'Failed to create proxy mappings' });
  }
});

export default router; 