import { test, expect } from '@playwright/test';

test.describe('User Journey - Complete Order Process', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('User can complete a full order process', async ({ page }) => {
    // Step 1: Verify homepage loads
    await expect(page).toHaveTitle(/Carnes Beniken/);
    await expect(page.getByText('Carnes Beniken')).toBeVisible();

    // Step 2: Navigate to order page
    await page.getByRole('button', { name: /hacer pedido/i }).click();
    await expect(page).toHaveURL(/.*\/pedido/);

    // Step 3: Fill customer information
    await page.getByLabel(/nombre completo/i).fill('Juan Pérez');
    await page.getByLabel(/email/i).fill('juan.perez@example.com');
    await page.getByLabel(/teléfono/i).fill('+56912345678');
    
    // Step 4: Continue to product selection
    await page.getByRole('button', { name: /continuar/i }).click();

    // Step 5: Select products
    await expect(page.getByText(/seleccionar productos/i)).toBeVisible();
    
    // Add first product
    await page.getByTestId('product-lomo-liso').getByRole('button', { name: /agregar/i }).click();
    
    // Verify product was added to cart
    await expect(page.getByTestId('cart-item-lomo-liso')).toBeVisible();
    
    // Step 6: Proceed to checkout
    await page.getByRole('button', { name: /proceder al pago/i }).click();

    // Step 7: Select payment method
    await page.getByLabel(/efectivo/i).check();
    
    // Step 8: Confirm order
    await page.getByRole('button', { name: /confirmar pedido/i }).click();

    // Step 9: Verify order confirmation
    await expect(page.getByText(/pedido confirmado/i)).toBeVisible();
    await expect(page.getByText(/número de pedido/i)).toBeVisible();
  });

  test('User can view product catalog', async ({ page }) => {
    // Navigate to products
    await page.getByRole('link', { name: /productos/i }).click();
    
    // Verify products are displayed
    await expect(page.getByTestId('product-grid')).toBeVisible();
    await expect(page.getByTestId('product-card')).toHaveCount({ min: 1 });
    
    // Test product filtering
    await page.getByLabel(/categoría/i).selectOption('vacuno');
    await expect(page.getByTestId('product-card')).toHaveCount({ min: 1 });
    
    // Test product search
    await page.getByPlaceholder(/buscar productos/i).fill('lomo');
    await page.getByRole('button', { name: /buscar/i }).click();
    await expect(page.getByText(/lomo/i)).toBeVisible();
  });

  test('User can contact the business', async ({ page }) => {
    // Navigate to contact
    await page.getByRole('link', { name: /contacto/i }).click();
    
    // Fill contact form
    await page.getByLabel(/nombre/i).fill('María González');
    await page.getByLabel(/email/i).fill('maria@example.com');
    await page.getByLabel(/mensaje/i).fill('Consulta sobre productos disponibles');
    
    // Submit form
    await page.getByRole('button', { name: /enviar mensaje/i }).click();
    
    // Verify confirmation
    await expect(page.getByText(/mensaje enviado/i)).toBeVisible();
  });
});