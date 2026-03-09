import { test, expect } from '@playwright/test';
import { onboardUser } from './helpers';

test.describe('Data Persistence (IndexedDB)', () => {
  test('should persist newly created data across browser reloads', async ({ page }) => {
    // 1. Onboard into a new binder
    await onboardUser(page, 'PersistentPass123!');

    // 2. Change a setting that gets saved to IndexedDB (Language)
    await page.locator('nav').getByRole('link').filter({ hasText: /Settings/i }).first().click();
    
    // Click French
    const frenchButton = page.getByRole('button', { name: /Français/i });
    await expect(frenchButton).toBeVisible();
    await frenchButton.click();

    // Assert language changed
    await expect(page.locator('nav')).toContainText(/Paramètres|Tableau de bord/i);

    // 3. Navigate back to root (simulating closing tab and returning to the app later)
    await page.goto('/');

    // 4. Since we lost the memory state, we must unlock it
    await expect(page.getByAltText('Life Binder')).toBeVisible();
    await page.locator('input[type="password"]').first().fill('PersistentPass123!');
    await page.locator('button[type="submit"]').click();

    // 5. Assert the setting survived the reload
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav')).toContainText(/Paramètres|Tableau de bord/i);
  });
});
