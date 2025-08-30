import { test, expect } from '@playwright/test';

test.describe('Complete Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full order process', async ({ page }) => {
    // 1. Navigate to products
    await page.click('text=Menú de Productos');
    await expect(page).toHaveURL(/.*productos/);

    // 2. Add product to cart
    await page.click('[data-testid="add-to-cart"]:first-child');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // 3. Go to cart
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('h2')).toContainText('Carrito de Compras');

    // 4. Proceed to checkout
    await page.click('text=Proceder al Pago');

    // 5. Fill customer form
    await page.fill('[data-testid="customer-name"]', 'Test Customer E2E');
    await page.fill('[data-testid="customer-email"]', 'e2e@test.com');
    await page.fill('[data-testid="customer-phone"]', '+56987654321');
    await page.fill('[data-testid="customer-address"]', 'Test Address 123');

    // 6. Submit order
    await page.click('text=Confirmar Pedido');

    // 7. Verify order confirmation
    await expect(page.locator('h2')).toContainText('Pedido Confirmado');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should validate customer form fields', async ({ page }) => {
    await page.click('text=Menú de Productos');
    await page.click('[data-testid="add-to-cart"]:first-child');
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Proceder al Pago');

    // Try to submit without filling required fields
    await page.click('text=Confirmar Pedido');

    // Check validation messages
    await expect(page.locator('text=Nombre es requerido')).toBeVisible();
    await expect(page.locator('text=Email es requerido')).toBeVisible();
  });

  test('should handle frequent customer detection', async ({ page }) => {
    await page.click('text=Menú de Productos');
    await page.click('[data-testid="add-to-cart"]:first-child');
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Proceder al Pago');

    // Fill name and email for frequent customer
    await page.fill('[data-testid="customer-name"]', 'Cliente Frecuente');
    await page.fill('[data-testid="customer-email"]', 'frecuente@beniken.com');

    // Wait for frequent customer check
    await expect(page.locator('text=Cliente Frecuente Detectado')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@beniken.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('text=Iniciar Sesión');
    await page.goto('/admin');
  });

  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard Administrativo');
    
    // Check KPI cards
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-orders"]')).toBeVisible();
  });

  test('should export reports', async ({ page }) => {
    // Test PDF export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Exportar PDF');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    // Test Excel export
    const downloadPromise2 = page.waitForEvent('download');
    await page.click('text=Exportar Excel');
    const download2 = await downloadPromise2;
    expect(download2.suggestedFilename()).toContain('.xlsx');
  });

  test('should open stock inventory modal', async ({ page }) => {
    await page.click('text=Revisar');
    await expect(page.locator('text=Inventario de Stock')).toBeVisible();
    
    // Check modal content
    await expect(page.locator('[data-testid="stock-table"]')).toBeVisible();
    
    // Close modal
    await page.click('[data-testid="close-modal"]');
    await expect(page.locator('text=Inventario de Stock')).not.toBeVisible();
  });
});

test.describe('Butcher Orders Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'carnicero@beniken.com');
    await page.fill('[data-testid="password"]', 'carnicero123');
    await page.click('text=Iniciar Sesión');
    await page.goto('/carnicero');
  });

  test('should display orders for butcher', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Panel del Carnicero');
    await expect(page.locator('[data-testid="orders-grid"]')).toBeVisible();
  });

  test('should update order status', async ({ page }) => {
    // Click on first order's status button
    await page.click('[data-testid="order-status-button"]:first-child');
    
    // Select new status
    await page.click('text=En Preparación');
    
    // Verify status update
    await expect(page.locator('text=Estado actualizado')).toBeVisible();
  });

  test('should open weight adjustment modal', async ({ page }) => {
    await page.click('text=Ajustar y Marcar LISTO');
    
    await expect(page.locator('text=Ajustar Peso del Pedido')).toBeVisible();
    
    // Fill weight adjustment
    await page.fill('[data-testid="exact-weight"]', '2.5');
    
    // Save changes
    await page.click('text=Guardar Cambios');
    
    await expect(page.locator('text=Peso actualizado')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile-friendly hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check that logo is visible
    await expect(page.locator('[alt="Carnes Beniken Logo"]')).toBeVisible();
    
    // Check that text is readable
    await expect(page.locator('text=Carne Fresca y de Calidad')).toBeVisible();
    
    // Check that buttons are accessible
    await expect(page.locator('text=Menú de Productos')).toBeVisible();
    await expect(page.locator('text=Contactar por WhatsApp')).toBeVisible();
  });

  test('should navigate mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check menu items
    await expect(page.locator('text=Productos')).toBeVisible();
    await expect(page.locator('text=Nosotros')).toBeVisible();
    await expect(page.locator('text=Contacto')).toBeVisible();
  });
});
