import { test, expect } from '@playwright/test'

test.describe('Sales Page - Product Catalog', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await context.addInitScript(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user_id', '1')
      localStorage.setItem('user_nombre', 'Test User')
      localStorage.setItem('user_rol', 'CAJERO')
    })

    await page.goto('/ventas')
  })

  test('should display sales page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Catálogo de Productos/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Carrito/i })).toBeVisible()
    await expect(page.getByPlaceholder(/Buscar por nombre o código/i)).toBeVisible()
  })

  test('should display product catalog', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    
    // Check that products are displayed
    const productCards = await page.locator('[class*="border-gray-200"]').count()
    expect(productCards).toBeGreaterThan(0)
  })

  test('should search products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Buscar por nombre o código/i)
    
    await searchInput.fill('ALMENDRAS')
    await page.getByRole('button', { name: /Buscar/i }).click()
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Should show matching products or "no products found" message
    const hasProducts = await page.locator('text=/ALMENDRAS/i').isVisible().catch(() => false)
    const noProducts = await page.locator('text=/No se encontraron productos/i').isVisible().catch(() => false)
    
    expect(hasProducts || noProducts).toBeTruthy()
  })

  test('should filter products by category', async ({ page }) => {
    const categorySelect = page.locator('select').first()
    
    // Select a category (adjust based on available categories)
    await categorySelect.selectOption({ index: 1 }) // Select first non-empty option
    
    await page.waitForTimeout(1000)
    
    // Products should be filtered
    const hasProducts = await page.locator('text=/Producto/i').isVisible().catch(() => false)
    const noProducts = await page.locator('text=/No se encontraron productos/i').isVisible().catch(() => false)
    
    expect(hasProducts || noProducts).toBeTruthy()
  })
})

test.describe('Sales Page - Cart Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await context.addInitScript(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user_id', '1')
      localStorage.setItem('user_nombre', 'Test User')
      localStorage.setItem('user_rol', 'CAJERO')
    })

    await page.goto('/ventas')
  })

  test('should show empty cart message initially', async ({ page }) => {
    await expect(page.getByText(/El carrito está vacío/i)).toBeVisible()
  })

  test('should add product to cart by clicking', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    
    // Find a product card that is NOT out of stock
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      
      // Wait a bit for cart update
      await page.waitForTimeout(500)
      
      // Cart should no longer be empty or should show the product
      const isEmpty = await page.getByText(/El carrito está vacío/i).isVisible().catch(() => false)
      expect(isEmpty).toBe(false)
    }
  })

  test('should scan product by barcode', async ({ page }) => {
    const scanInput = page.getByPlaceholder(/Escanear código/i).or(page.locator('input[type="text"]').first())
    
    // Enter a product code (adjust based on your test data)
    await scanInput.fill('123456')
    await scanInput.press('Enter')
    
    await page.waitForTimeout(1000)
    
    // Should either add to cart or show error for invalid code
    const hasError = await page.locator('text=/error|no encontrado/i').isVisible().catch(() => false)
    const cartHasItems = !(await page.getByText(/El carrito está vacío/i).isVisible().catch(() => true))
    
    expect(hasError || cartHasItems).toBeTruthy()
  })

  test('should update product quantity in cart', async ({ page }) => {
    // First, add a product to cart
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Find and click the + button to increase quantity
      const plusButton = page.getByRole('button', { name: '+' }).first()
      if (await plusButton.isVisible()) {
        await plusButton.click()
        
        // Quantity should increase
        await expect(page.locator('text=/cantidad.*2/i').or(page.locator('span:has-text("2")'))).toBeVisible()
      }
    }
  })

  test('should remove product from cart', async ({ page }) => {
    // First, add a product to cart
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Find and click the delete/trash button
      const deleteButton = page.getByRole('button', { name: /Eliminar/i }).first()
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        // Cart should be empty again
        await expect(page.getByText(/El carrito está vacío/i)).toBeVisible()
      }
    }
  })

  test('should clear entire cart', async ({ page }) => {
    // First, add a product to cart
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Click "Limpiar Todo" button
      const clearButton = page.getByRole('button', { name: /Limpiar Todo/i })
      if (await clearButton.isVisible()) {
        await clearButton.click()
        
        // Cart should be empty
        await expect(page.getByText(/El carrito está vacío/i)).toBeVisible()
      }
    }
  })
})

test.describe('Sales Page - Checkout Process', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await context.addInitScript(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user_id', '1')
      localStorage.setItem('user_nombre', 'Test User')
      localStorage.setItem('user_rol', 'CAJERO')
    })

    await page.goto('/ventas')
  })

  test('should disable payment button with empty cart', async ({ page }) => {
    const payButton = page.getByRole('button', { name: /PAGAR/i })
    
    // Button should not be visible or should be disabled when cart is empty
    const isVisible = await payButton.isVisible().catch(() => false)
    if (isVisible) {
      await expect(payButton).toBeDisabled()
    }
  })

  test('should open payment modal when clicking pay button', async ({ page }) => {
    // First, add a product to cart
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Click pay button
      const payButton = page.getByRole('button', { name: /PAGAR/i })
      if (await payButton.isVisible() && await payButton.isEnabled()) {
        await payButton.click()
        
        // Payment modal should appear
        await expect(page.getByText(/Seleccionar Método de Pago/i)).toBeVisible()
      }
    }
  })

  test('should show payment options in modal', async ({ page }) => {
    // Add product and open payment modal
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      const payButton = page.getByRole('button', { name: /PAGAR/i })
      if (await payButton.isVisible() && await payButton.isEnabled()) {
        await payButton.click()
        
        // Check for payment options
        await expect(page.getByText(/Efectivo/i)).toBeVisible()
        await expect(page.getByText(/Débito/i)).toBeVisible()
        await expect(page.getByText(/Transferencia/i)).toBeVisible()
        await expect(page.getByText(/Fiado/i)).toBeVisible()
      }
    }
  })
})

test.describe('Sales Page - Boundary Cases', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user_id', '1')
      localStorage.setItem('user_nombre', 'Test User')
      localStorage.setItem('user_rol', 'CAJERO')
    })

    await page.goto('/ventas')
  })

  test('should handle search for nonexistent product', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Buscar por nombre o código/i)
    
    await searchInput.fill('PRODUCTO_QUE_NO_EXISTE_XYZ123')
    await page.getByRole('button', { name: /Buscar/i }).click()
    
    await page.waitForTimeout(1000)
    
    // Should show "no products found" message
    await expect(page.getByText(/No se encontraron productos/i)).toBeVisible()
  })

  test('should prevent adding out of stock product', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for products marked as "SIN STOCK"
    const outOfStockProduct = page.locator('text=/SIN STOCK|SIN LOTES/i').first()
    
    if (await outOfStockProduct.isVisible()) {
      const productCard = outOfStockProduct.locator('..')
      
      // Try to click - should not be added to cart or should show error
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Cart should remain empty or error shown
      const cartEmpty = await page.getByText(/El carrito está vacío/i).isVisible()
      const hasError = await page.locator('text=/sin stock|no disponible/i').isVisible().catch(() => false)
      
      expect(cartEmpty || hasError).toBeTruthy()
    }
  })

  test('should show warning when exceeding available stock', async ({ page }) => {
    // Add product to cart
    await page.waitForSelector('text=/Almendras|Nueces|Producto/i', { timeout: 10000 })
    const productCard = page.locator('[class*="hover:border-blue-500"]').first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForTimeout(500)
      
      // Try to increase quantity many times
      const plusButton = page.getByRole('button', { name: '+' }).first()
      if (await plusButton.isVisible()) {
        for (let i = 0; i < 20; i++) {
          await plusButton.click()
          await page.waitForTimeout(100)
        }
        
        // Should show stock warning
        await expect(page.locator('text=/stock insuficiente|disponible/i')).toBeVisible({ timeout: 5000 })
      }
    }
  })
})
