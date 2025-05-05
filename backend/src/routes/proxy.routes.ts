import express from 'express';
import { proxyService } from '../services/proxy.service';
import { proxyMappingService } from '../services/proxy-mapping.service';
import { browserService } from '../services/browser.service';
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

// Create proxy mapping
router.post('/mapping', async (req, res) => {
  try {
    const { emailIds, maxProxies, maxEmailsPerProxy } = req.body;
    
    if (!emailIds || !Array.isArray(emailIds)) {
      return res.status(400).json({ error: 'Valid emailIds array is required' });
    }
    
    if (!maxProxies || isNaN(parseInt(maxProxies))) {
      return res.status(400).json({ error: 'Valid maxProxies is required' });
    }
    
    if (!maxEmailsPerProxy || isNaN(parseInt(maxEmailsPerProxy))) {
      return res.status(400).json({ error: 'Valid maxEmailsPerProxy is required' });
    }
    
    const mappings = await proxyMappingService.createProxyMapping(
      emailIds,
      parseInt(maxProxies as string),
      parseInt(maxEmailsPerProxy as string)
    );
    
    res.status(201).json({
      message: `Successfully created ${mappings.length} email-to-proxy mappings`,
      mappings
    });
  } catch (error) {
    logger.error('Error in POST /proxies/mapping:', error);
    res.status(500).json({ error: 'Failed to create proxy mappings' });
  }
});

// Get proxy mappings
router.get('/mapping', async (req, res) => {
  try {
    const mappings = await proxyMappingService.getProxyMappings();
    res.json(mappings);
  } catch (error) {
    logger.error('Error in GET /proxies/mapping:', error);
    res.status(500).json({ error: 'Failed to get proxy mappings' });
  }
});

// Delete proxy mapping for an email
router.delete('/mapping/:emailId', async (req, res) => {
  try {
    const success = await proxyMappingService.deleteProxyMapping(req.params.emailId);
    if (!success) {
      return res.status(404).json({ error: 'Proxy mapping not found' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in DELETE /proxies/mapping/${req.params.emailId}:`, error);
    res.status(500).json({ error: 'Failed to delete proxy mapping' });
  }
});

// Open browser windows for email accounts with proxies
router.post('/browser/open', async (req, res) => {
  try {
    const count = await browserService.openBrowserWindows();
    res.json({
      message: `Successfully opened ${count} browser windows for email accounts`,
      count
    });
  } catch (error) {
    logger.error('Error in POST /proxies/browser/open:', error);
    res.status(500).json({ error: 'Failed to open browser windows' });
  }
});

// Close all browser windows
router.post('/browser/close', async (req, res) => {
  try {
    await browserService.closeAllSessions();
    res.json({ message: 'All browser windows have been closed' });
  } catch (error) {
    logger.error('Error in POST /proxies/browser/close:', error);
    res.status(500).json({ error: 'Failed to close browser windows' });
  }
});

// Get browser session stats
router.get('/browser/stats', async (req, res) => {
  try {
    const count = browserService.getActiveSessionCount();
    res.json({
      activeSessions: count
    });
  } catch (error) {
    logger.error('Error in GET /proxies/browser/stats:', error);
    res.status(500).json({ error: 'Failed to get browser stats' });
  }
});

export default router; 