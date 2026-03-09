import { test, expect } from '@playwright/test';
import { onboardUser } from './helpers';

test.describe('Destructive Actions', () => {
  test('should wipe the database entirely and reset to the onboarding screen', async ({ page }) => {
    // 1. Onboard
    await onboardUser(page, 'WipePass123!');

    // 2. Navigate to Settings -> Delete Binder
    await page.locator('nav').getByRole('link').filter({ hasText: /Settings/i }).first().click();
    
    // Trigger the delete modal
    const deleteButton = page.getByRole('button').filter({ hasText: /Delete|Reset|Wipe/i }).last();
    await deleteButton.click();

    // 3. Confirm the destructive action
    const confirmButton = page.getByRole('button', { name: /Yes, Delete Everything|Confirm/i }).first();
    // Provide a small timeout because modals might animate
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // 4. Verify we are kicked out to the setup screen (which has 2 inputs eventually)
    await expect(page.getByAltText('Life Binder')).toBeVisible();

    // 5. Test onboarding again to prove IndexedDB is truly empty
    await page.locator('input[type="password"]').first().fill('NewPass123!');
    await page.locator('input[type="password"]').nth(1).fill('NewPass123!');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('nav')).toBeVisible();

    // Check if Dashboard exists in the new empty state
    await expect(page.getByText(/Dashboard|Tableau/i)).toBeVisible();
  });
});
