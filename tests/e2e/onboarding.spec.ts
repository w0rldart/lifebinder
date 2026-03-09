import { test, expect } from '@playwright/test';

test.describe('Onboarding and Authentication', () => {
  test('should setup a new passphrase and load dashboard', async ({ page }) => {
    // 1. Navigate to local dev server
    await page.goto('/');

    // 2. Assert land on lock/setup screen
    await expect(page.getByAltText('Life Binder')).toBeVisible();

    // 3. Fill passphrase fields (using generic input selectors to bypass i18n text changes)
    await page.locator('input[type="password"]').first().fill('SuperSecure123!');
    await page.locator('input[type="password"]').nth(1).fill('SuperSecure123!');
    
    // 4. Submit form
    await page.locator('button[type="submit"]').click();

    // 5. Verify successful onboarding (should see Dashboard content)
    // The logout button and primary layout navigation are reliable indicators
    await expect(page.locator('nav')).toBeVisible();
  });
});
