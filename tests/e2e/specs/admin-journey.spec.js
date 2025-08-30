import { test, expect } from '@playwright/test';

test.describe('Admin Journey - Complete Management Process', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@beniken.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verify admin dashboard loads
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByText(/dashboard administrativo/i)).toBeVisible();
  });

  test('Admin can manage orders', async ({ page }) => {
    // Navigate to orders management
    await page.getByRole('link', { name: /pedidos/i }).click();
    
    // Verify orders list loads
    await expect(page.getByTestId('orders-table')).toBeVisible();
    
    // View order details
    await page.getByTestId('order-row').first().click();
    await expect(page.getByText(/detalles del pedido/i)).toBeVisible();
    
    // Update order status
    await page.getByLabel(/estado/i).selectOption('en-preparacion');
    await page.getByRole('button', { name: /actualizar/i }).click();
    
    // Verify status updated
    await expect(page.getByText(/estado actualizado/i)).toBeVisible();
  });

  test('Admin can manage inventory', async ({ page }) => {
    // Navigate to inventory
    await page.getByRole('link', { name: /inventario/i }).click();
    
    // Verify inventory table loads
    await expect(page.getByTestId('inventory-table')).toBeVisible();
    
    // Add new product
    await page.getByRole('button', { name: /agregar producto/i }).click();
    await page.getByLabel(/nombre del producto/i).fill('Costillar Premium');
    await page.getByLabel(/precio/i).fill('12000');
    await page.getByLabel(/stock/i).fill('50');
    await page.getByLabel(/categoría/i).selectOption('vacuno');
    
    // Save product
    await page.getByRole('button', { name: /guardar/i }).click();
    
    // Verify product was added
    await expect(page.getByText(/producto agregado/i)).toBeVisible();
    await expect(page.getByText('Costillar Premium')).toBeVisible();
  });

  test('Admin can view reports and analytics', async ({ page }) => {
    // Navigate to reports
    await page.getByRole('link', { name: /reportes/i }).click();
    
    // Verify dashboard loads
    await expect(page.getByText(/dashboard de reportes/i)).toBeVisible();
    
    // Check KPI cards are visible
    await expect(page.getByText(/total pedidos/i)).toBeVisible();
    await expect(page.getByText(/ingresos totales/i)).toBeVisible();
    
    // Test date range filter
    await page.getByLabel(/desde/i).fill('2024-01-01');
    await page.getByLabel(/hasta/i).fill('2024-12-31');
    
    // Export report
    await page.getByRole('button', { name: /exportar pdf/i }).click();
    
    // Verify export initiated
    await expect(page.getByText(/generando reporte/i)).toBeVisible();
  });

  test('Admin can manage users', async ({ page }) => {
    // Navigate to users management
    await page.getByRole('link', { name: /usuarios/i }).click();
    
    // Verify users table loads
    await expect(page.getByTestId('users-table')).toBeVisible();
    
    // Create new user
    await page.getByRole('button', { name: /crear usuario/i }).click();
    await page.getByLabel(/nombre/i).fill('Carlos Admin');
    await page.getByLabel(/email/i).fill('carlos@beniken.com');
    await page.getByLabel(/rol/i).selectOption('admin');
    
    // Save user
    await page.getByRole('button', { name: /crear/i }).click();
    
    // Verify user was created
    await expect(page.getByText(/usuario creado/i)).toBeVisible();
    await expect(page.getByText('Carlos Admin')).toBeVisible();
  });
});