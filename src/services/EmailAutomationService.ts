import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { EmailAccount, Proxy, Task } from '../types';

puppeteer.use(StealthPlugin());

export class EmailAutomationService {
  private browser: puppeteer.Browser | null = null;
  private pages: Map<string, puppeteer.Page> = new Map();
  private isRunning = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async startTask(account: EmailAccount, proxy: Proxy, task: Task) {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    this.pages.set(account.id, page);

    // Configure proxy
    await page.authenticate({
      username: proxy.username,
      password: proxy.password,
    });

    // Navigate to email provider
    await this.navigateToEmailProvider(page, account);

    // Perform task based on type
    switch (task.type) {
      case 'move_from_spam':
        await this.moveFromSpam(page);
        break;
      case 'mark_important':
        await this.markImportant(page);
        break;
      case 'click_link':
        await this.clickLink(page);
        break;
    }

    // Close page when done
    await page.close();
    this.pages.delete(account.id);
  }

  private async navigateToEmailProvider(page: puppeteer.Page, account: EmailAccount) {
    // TODO: Implement navigation to different email providers
    await page.goto('https://mail.google.com');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', account.email);
    await page.click('button:contains("Next")');
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', account.password);
    await page.click('button:contains("Next")');
  }

  private async moveFromSpam(page: puppeteer.Page) {
    // Navigate to spam folder
    await page.click('a[href*="spam"]');
    await page.waitForSelector('.message-list');

    // Select and move first email
    await page.click('.message-list-item:first-child');
    await page.click('button[aria-label="Move to"]');
    await page.click('div[role="menuitem"]:contains("Inbox")');
  }

  private async markImportant(page: puppeteer.Page) {
    // Select and mark email as important
    await page.click('.message-list-item:first-child');
    await page.click('button[aria-label="Mark as important"]');
  }

  private async clickLink(page: puppeteer.Page) {
    // Open email and click first non-unsubscribe link
    await page.click('.message-list-item:first-child');
    await page.waitForSelector('.message-body');
    
    const links = await page.$$('a:not([href*="unsubscribe"])');
    if (links.length > 0) {
      await links[0].click();
    }
  }

  async stop() {
    this.isRunning = false;
    for (const [_, page] of this.pages) {
      await page.close();
    }
    this.pages.clear();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 