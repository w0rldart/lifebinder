import { test, expect } from '@playwright/test';
import { onboardUser } from './helpers';

test.describe('Internationalization (i18n)', () => {
  test('should change language in settings and immediately reflect in navigation', async ({ page }) => {
    // 1. Onboard
    await onboardUser(page, 'LangPass123!');

    // English by default, wait for settings link to exist in English:
    const settingsLinkEn = page.locator('nav').getByRole('link').filter({ hasText: /Settings/i }).first();
    await settingsLinkEn.click();

    // 2. Click the French button
    const frenchButton = page.getByRole('button', { name: /Français/i });
    await expect(frenchButton).toBeVisible();
    await frenchButton.click();

    // 3. Assert the navigation immediately updates to French
    // "Settings" in French is "Paramètres" based on the locale file structure
    // (We also check "Dashboard" -> "Tableau de bord")
    await expect(page.locator('nav')).toContainText(/Paramètres|Tableau de bord/i);

    // Assert that standard UI elements like logout also changed
    const lockButton = page.getByRole('button').filter({ hasText: /Verrouiller/i }).first();
    await expect(lockButton).toBeVisible();
    
    // Switch back to english to ensure idempotency
    const englishButton = page.getByRole('button', { name: /English/i });
    await englishButton.click();
    await expect(page.locator('nav')).toContainText(/Settings/i);
  });
});
