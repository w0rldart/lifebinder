import { expect, type Page } from '@playwright/test';

/**
 * Helper to bypass the initial setup screen and authenticate a fresh browser context.
 * Useful for tests that need to evaluate app functionality rather than the login process itself.
 */
export async function onboardUser(page: Page, passphrase = 'TestPassphrase123!') {
  await page.goto('/');
  await page.getByAltText('Life Binder').waitFor();
  
  const passwords = page.locator('input[type="password"]');
  // Fill both the new password and confirm password fields
  await passwords.first().fill(passphrase);
  await passwords.nth(1).fill(passphrase);
  
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('nav')).toBeVisible();
}
