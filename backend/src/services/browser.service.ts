import { logger } from '../utils/logger';
import { proxyMappingService } from './proxy-mapping.service';
import puppeteer, { Browser, Page } from 'puppeteer';

interface BrowserSession {
  emailId: string;
  email: string;
  browser: Browser;
  page: Page;
}

export class BrowserService {
  private static instance: BrowserService;
  private activeSessions: Map<string, BrowserSession> = new Map();

  private constructor() {}

  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  /**
   * Open browser windows for each email account with its assigned proxy
   * @returns Number of browser windows opened
   */
  async openBrowserWindows(): Promise<number> {
    try {
      // Close any existing sessions first
      await this.closeAllSessions();

      // Get current proxy mappings
      const mappings = await proxyMappingService.getProxyMappings();
      
      logger.info(`Opening browser windows for ${mappings.length} email accounts`);
      
      let successCount = 0;
      
      // Open browser for each mapping
      for (const mapping of mappings) {
        try {
          await this.openBrowserWindow(
            mapping.emailId,
            mapping.email,
            {
              host: mapping.proxyHost,
              port: mapping.proxyPort,
              username: mapping.proxyUsername,
              password: mapping.proxyPassword
            }
          );
          successCount++;
        } catch (error) {
          logger.error(`Error opening browser for ${mapping.email}:`, error);
        }
      }
      
      logger.info(`Successfully opened ${successCount} browser windows`);
      return successCount;
    } catch (error) {
      logger.error('Error opening browser windows:', error);
      throw new Error('Failed to open browser windows');
    }
  }

  /**
   * Open a browser window for a specific email account with the assigned proxy
   * @param emailId Email account ID
   * @param email Email address
   * @param proxy Proxy configuration
   */
  private async openBrowserWindow(
    emailId: string, 
    email: string, 
    proxy: { host: string; port: number; username: string; password: string }
  ): Promise<void> {
    try {
      // Format proxy URL
      const proxyUrl = `${proxy.host}:${proxy.port}`;
      
      // Launch browser with proxy settings
      const browser = await puppeteer.launch({
        headless: false, // Show the browser window
        args: [
          `--proxy-server=${proxyUrl}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1280,720'
        ]
      });
      
      // Open a new page
      const page = await browser.newPage();
      
      // Set up proxy authentication if needed
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
      
      // Navigate to Google sign-in page
      await page.goto('https://accounts.google.com/signin');
      
      // Add event listener for browser close
      browser.on('disconnected', () => {
        this.activeSessions.delete(emailId);
        logger.info(`Browser session for ${email} was closed`);
      });
      
      // Store the session
      this.activeSessions.set(emailId, {
        emailId,
        email,
        browser,
        page
      });
      
      logger.info(`Successfully opened browser for ${email} with proxy ${proxyUrl}`);
    } catch (error) {
      logger.error(`Error opening browser for ${email}:`, error);
      throw new Error(`Failed to open browser for ${email}`);
    }
  }

  /**
   * Close all active browser sessions
   */
  async closeAllSessions(): Promise<void> {
    const sessions = Array.from(this.activeSessions.values());
    logger.info(`Closing ${sessions.length} active browser sessions`);
    
    for (const session of sessions) {
      try {
        await session.browser.close();
        logger.info(`Closed browser session for ${session.email}`);
      } catch (error) {
        logger.error(`Error closing browser session for ${session.email}:`, error);
      }
    }
    
    this.activeSessions.clear();
  }

  /**
   * Get active browser session for an email
   * @param emailId Email account ID
   * @returns Browser session or null if not found
   */
  getSession(emailId: string): BrowserSession | null {
    return this.activeSessions.get(emailId) || null;
  }

  /**
   * Get all active browser sessions
   * @returns Map of email ID to browser session
   */
  getActiveSessions(): Map<string, BrowserSession> {
    return this.activeSessions;
  }

  /**
   * Get count of active browser sessions
   * @returns Number of active sessions
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }
}

export const browserService = BrowserService.getInstance();
export default BrowserService.getInstance(); 