import { test, expect } from '@playwright/test';

test.describe('Lock Screen & Session', () => {
  test('should lock the binder and require passphrase to re-enter', async ({ page }) => {
    // 1. Onboard
    await page.goto('/');
    await page.getByAltText('Life Binder').waitFor();
    await page.locator('input[type="password"]').first().fill('LockPass123!');
    await page.locator('input[type="password"]').nth(1).fill('LockPass123!');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('nav')).toBeVisible();

    // 2. Trigger Lock
    const lockButton = page.getByRole('button').filter({ hasText: /Lock|Log out|Logout/i }).first();
    await lockButton.click();

    // 3. Verify we are back at the unlock screen
    await expect(page.getByAltText('Life Binder')).toBeVisible();
    // Unlock screens generally only have one password input, vs two for setup
    await expect(page.locator('input[type="password"]')).toHaveCount(1);

    // 4. Unlock with correct passphrase
    await page.locator('input[type="password"]').first().fill('LockPass123!');
    await page.locator('button[type="submit"]').click();

    // 5. Verify back in dashboard
    await expect(page.locator('nav')).toBeVisible();
  });
});
