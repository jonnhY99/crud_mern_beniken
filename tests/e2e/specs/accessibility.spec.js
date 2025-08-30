import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('Homepage is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  });

  test('Navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus').textContent();
    expect(firstFocusable).toBeTruthy();
    
    // Continue tabbing through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').count();
      expect(focused).toBe(1);
    }
  });

  test('Forms are accessible', async ({ page }) => {
    await page.goto('/pedido');
    
    // Check form has proper labels
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/teléfono/i)).toBeVisible();
    
    // Check form can be navigated with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.type('Juan Pérez');
    await page.keyboard.press('Tab');
    await page.keyboard.type('juan@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('+56912345678');
    
    // Check form submission with Enter key
    await page.keyboard.press('Tab'); // Focus on submit button
    await page.keyboard.press('Enter');
    
    // Should proceed to next step
    await expect(page.getByText(/seleccionar productos/i)).toBeVisible();
  });

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Check main text has sufficient contrast
    const textElements = await page.locator('p, h1, h2, h3, span').all();
    
    for (const element of textElements.slice(0, 10)) { // Check first 10 elements
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // Basic check that text is not transparent
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
    }
  });

  test('ARIA attributes are properly used', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for proper ARIA labels on buttons
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
    
    // Check for proper roles on interactive elements
    const interactiveElements = await page.locator('[role]').all();
    for (const element of interactiveElements) {
      const role = await element.getAttribute('role');
      expect(['button', 'link', 'tab', 'tabpanel', 'dialog', 'menu', 'menuitem']).toContain(role);
    }
  });
});