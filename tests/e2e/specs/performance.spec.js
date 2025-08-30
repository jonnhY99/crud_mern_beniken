import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.getByText('Carnes Beniken')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('Product catalog loads efficiently', async ({ page }) => {
    await page.goto('/productos');
    
    const startTime = Date.now();
    await expect(page.getByTestId('product-grid')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // Product grid should load within 2 seconds
  });

  test('Admin dashboard loads within acceptable time', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@beniken.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    const startTime = Date.now();
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2500); // Dashboard should load within 2.5 seconds
  });

  test('Large order processing performs well', async ({ page }) => {
    await page.goto('/pedido');
    
    // Fill customer info quickly
    await page.getByLabel(/nombre/i).fill('Performance Test User');
    await page.getByLabel(/email/i).fill('perf@test.com');
    await page.getByLabel(/teléfono/i).fill('+56912345678');
    await page.getByRole('button', { name: /continuar/i }).click();
    
    // Add multiple products
    const startTime = Date.now();
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('product-card').nth(i).getByRole('button', { name: /agregar/i }).click();
    }
    
    const addTime = Date.now() - startTime;
    expect(addTime).toBeLessThan(5000); // Adding 5 products should take less than 5 seconds
    
    // Verify cart updates efficiently
    await expect(page.getByTestId('cart-items')).toHaveCount(5);
  });

  test('Search functionality performs well', async ({ page }) => {
    await page.goto('/productos');
    
    const searchTerms = ['lomo', 'asado', 'costilla', 'vacuno', 'cerdo'];
    
    for (const term of searchTerms) {
      const startTime = Date.now();
      
      await page.getByPlaceholder(/buscar/i).fill(term);
      await page.getByRole('button', { name: /buscar/i }).click();
      await expect(page.getByTestId('search-results')).toBeVisible();
      
      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(1500); // Each search should complete within 1.5 seconds
    }
  });
});