import { Page, Browser, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Authentication helper to manage login state
 */
export class AuthHelper {
  private storageStatePath: string;

  /**
   * Initialize with storage state path
   * @param storageStatePath - Path to storage state file
   */
  constructor(storageStatePath: string = '.auth/state.json') {
    this.storageStatePath = storageStatePath;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(storageStatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Login and save authentication state
   * @param page - Playwright Page
   * @param context - Browser Context
   * @param username - Username
   * @param password - Password
   */
  async login(page: Page, context: BrowserContext, username: string, password: string): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(username, password);
    
    // Save storage state
    await this.saveStorageState(context);
  }

  /**
   * Save storage state to file
   * @param context - Browser Context
   */
  async saveStorageState(context: BrowserContext): Promise<void> {
    await context.storageState({ path: this.storageStatePath });
  }

  /**
   * Check if storage state exists
   * @returns True if storage state exists
   */
  hasStorageState(): boolean {
    return fs.existsSync(this.storageStatePath);
  }

  /**
   * Get storage state path
   * @returns Storage state file path
   */
  getStorageStatePath(): string {
    return this.storageStatePath;
  }
}