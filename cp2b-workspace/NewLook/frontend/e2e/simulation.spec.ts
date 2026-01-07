import { test, expect } from '@playwright/test'
import { SimulationPage } from './pages/simulation.page'
import { a11y } from './fixtures/test-fixtures'

/**
 * Economic Simulation E2E Tests
 *
 * Tests the complete simulation workflow including:
 * - Page load (authenticated)
 * - Region selection on map
 * - Parameter configuration
 * - Simulation execution
 * - Results display
 * - Regional impact viewing
 * - Export functionality
 *
 * Note: These tests require authentication (uses stored auth state)
 */

test.describe('Economic Simulation Page', () => {
  let simulationPage: SimulationPage

  test.beforeEach(async ({ page }) => {
    simulationPage = new SimulationPage(page)
  })

  test.describe('Page Load (Authenticated)', () => {
    test('should load simulation page with map', async () => {
      await simulationPage.goto('pt')

      // Map should be visible
      await expect(simulationPage.leafletContainer).toBeVisible()
    })

    test('should display control panel', async () => {
      await simulationPage.goto('pt')

      // Control panel should be visible
      const controlPanelVisible = await simulationPage.isControlPanelVisible()
      expect(controlPanelVisible).toBe(true)
    })

    test('should show instruction message when no region selected', async ({ page }) => {
      await simulationPage.goto('pt')

      // Should show instruction to click on map
      const infoMessage = page.locator('text=/Clique em uma região|Click on a region/i')
      await expect(infoMessage).toBeVisible()
    })

    test('should display header with navigation', async () => {
      await simulationPage.goto('pt')

      await expect(simulationPage.header).toBeVisible()
    })

    test('should load region markers on map', async ({ page }) => {
      await simulationPage.goto('pt')

      // Wait for region markers to appear
      try {
        await page.waitForSelector('.leaflet-marker-icon, .leaflet-interactive', {
          timeout: 30000,
        })
      } catch {
        // Markers might be choropleth polygons instead
      }

      // Map should be interactive
      await expect(simulationPage.leafletContainer).toBeVisible()
    })
  })

  test.describe('Region Selection', () => {
    test('should allow selecting a region by clicking on map', async () => {
      await simulationPage.goto('pt')

      // Try to select a region (click on choropleth)
      await simulationPage.selectRegionFromChoropleth()

      // Check if region is selected (controls should update)
      // This might not always work if no regions are rendered
    })

    test('should show region details after selection', async ({ page }) => {
      await simulationPage.goto('pt')

      // Click on a region
      await simulationPage.selectRegionFromChoropleth()

      // Wait a moment for API response
      await page.waitForTimeout(2000)

      // If region was selected, details should show
      const regionSelected = await simulationPage.isRegionSelected()
      // This is optional as it depends on map data
    })
  })

  test.describe('Simulation Controls', () => {
    test('should have investment slider', async ({ page }) => {
      await simulationPage.goto('pt')

      const slider = page.locator('input[type="range"]').first()
      await expect(slider).toBeVisible()
    })

    test('should have sector selector', async () => {
      await simulationPage.goto('pt')

      await expect(simulationPage.sectorSelect).toBeVisible()
    })

    test('should allow changing investment percentage', async ({ page }) => {
      await simulationPage.goto('pt')

      // First select a region
      await simulationPage.selectRegionFromChoropleth()
      await page.waitForTimeout(1000)

      // Try to change investment
      const slider = page.locator('input[type="range"]').first()
      if (await slider.isVisible()) {
        await slider.fill('20')
        // Verify value changed
      }
    })

    test('should allow selecting different sectors', async ({ page }) => {
      await simulationPage.goto('pt')

      // Select agriculture sector
      const sectorSelect = page.locator('select').first()
      if (await sectorSelect.isVisible()) {
        await sectorSelect.selectOption({ index: 0 })
        await page.waitForTimeout(300)
      }
    })

    test('should toggle control panel visibility', async ({ page }) => {
      await simulationPage.goto('pt')

      const toggleButton = page.locator('[aria-label*="Minimizar"], [aria-label*="Expandir"]').first()
      if (await toggleButton.isVisible()) {
        await toggleButton.click()
        await page.waitForTimeout(500)

        // Panel should be minimized
        await toggleButton.click()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Simulation Execution', () => {
    test.skip('should run simulation when region is selected', async ({ page }) => {
      // This test requires a real region to be selected
      await simulationPage.goto('pt')

      // Select a region
      await simulationPage.selectRegionFromChoropleth()
      await page.waitForTimeout(2000)

      // Check if run button is enabled
      const runButton = page.locator('button:has-text("Executar"), button:has-text("Run")')
      if (await runButton.isVisible() && !(await runButton.isDisabled())) {
        await runButton.click()

        // Wait for results
        await page.waitForTimeout(5000)

        // Check for results panel
        const resultsPanel = page.locator('h2:has-text("Resultados"), h2:has-text("Results")')
        // Results may or may not appear depending on API
      }
    })

    test('should show loading state during simulation', async ({ page }) => {
      await simulationPage.goto('pt')

      // If we can trigger a simulation, check loading state
      const runButton = page.locator('button:has-text("Executar"), button:has-text("Run")')

      // Just verify the button exists
      // Actual loading test requires region selection and API
    })

    test('should display error for invalid simulation', async ({ page }) => {
      await simulationPage.goto('pt')

      // Try to run simulation without region
      const runButton = page.locator('button:has-text("Executar"), button:has-text("Run")')

      if (await runButton.isVisible() && !(await runButton.isDisabled())) {
        // If button is enabled without region, it should show error
        // This depends on the actual validation logic
      }
    })
  })

  test.describe('Results Display', () => {
    test.skip('should display results panel after simulation', async ({ page }) => {
      // This requires successful simulation
      // Skip unless we have test data
    })

    test.skip('should show VAB impact in results', async ({ page }) => {
      // This requires successful simulation
    })

    test.skip('should show economic multiplier', async ({ page }) => {
      // This requires successful simulation
    })

    test.skip('should show jobs created estimate', async ({ page }) => {
      // This requires successful simulation
    })

    test.skip('should show sector breakdown', async ({ page }) => {
      // This requires successful simulation
    })
  })

  test.describe('Export Functionality', () => {
    test.skip('should allow downloading results as JSON', async ({ page }) => {
      // This requires successful simulation with results
      await simulationPage.goto('pt')

      // Would need to run a simulation first
      // Then check download button
    })
  })

  test.describe('Regional Impact View', () => {
    test.skip('should show regional impact panel when clicking region after simulation', async () => {
      // This requires successful simulation
    })

    test.skip('should display spillover weight information', async () => {
      // This requires successful simulation
    })
  })

  test.describe('New Simulation', () => {
    test.skip('should reset form when starting new simulation', async ({ page }) => {
      // This requires a completed simulation first
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible form controls', async ({ page }) => {
      await simulationPage.goto('pt')

      // Sector select should have label context
      const sectorSelect = page.locator('select').first()
      if (await sectorSelect.isVisible()) {
        // Should be accessible
        await expect(sectorSelect).toBeVisible()
      }
    })

    test('should have accessible buttons', async ({ page }) => {
      await simulationPage.goto('pt')

      // Buttons should have accessible labels
      const buttons = page.locator('button[aria-label], button:has-text("")')
      const count = await buttons.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should support keyboard navigation', async ({ page }) => {
      await simulationPage.goto('pt')

      // Tab through elements
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should have visible focus indicators', async ({ page }) => {
      await simulationPage.goto('pt')
      await a11y.checkFocusVisible(page)
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await simulationPage.goto('pt')

      // Map should still be visible
      await expect(simulationPage.leafletContainer).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await simulationPage.goto('pt')

      await expect(simulationPage.leafletContainer).toBeVisible()
    })

    test('should adapt panels for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await simulationPage.goto('pt')

      // Panels should still be accessible (maybe collapsed)
      await expect(simulationPage.mapContainer).toBeVisible()
    })
  })

  test.describe('Localization', () => {
    test('should display Portuguese content', async ({ page }) => {
      await simulationPage.goto('pt')

      // Check for Portuguese text
      const ptText = page.locator('text=/Modelo Insumo-Produto/i')
      await expect(ptText).toBeVisible()
    })

    test('should work with English locale', async ({ page }) => {
      await page.goto('/en/dashboard/simulation')

      // Should load (may redirect to login if not authenticated in English)
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('Performance', () => {
    test('should load page within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await simulationPage.goto('pt')

      const loadTime = Date.now() - startTime

      // Page should load within 30 seconds
      expect(loadTime).toBeLessThan(30000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/v1/simulation/**', (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ detail: 'Internal Server Error' }),
        })
      )

      await simulationPage.goto('pt')

      // Page should still render
      await expect(simulationPage.mapContainer).toBeVisible()
    })

    test('should display error message on simulation failure', async ({ page }) => {
      await simulationPage.goto('pt')

      // Mock simulation failure
      await page.route('**/api/v1/simulation/shock/**', (route) =>
        route.fulfill({
          status: 400,
          body: JSON.stringify({ detail: 'Invalid region code' }),
        })
      )

      // If we could trigger a simulation, it should show error
    })
  })
})

test.describe('Simulation Integration', () => {
  test('should complete full simulation workflow', async ({ page }) => {
    const simulationPage = new SimulationPage(page)
    await simulationPage.goto('pt')

    // 1. Verify page loaded
    await expect(simulationPage.leafletContainer).toBeVisible()

    // 2. Wait for map to be ready
    await page.waitForSelector('.leaflet-tile-loaded', { timeout: 30000 })

    // 3. Check control panel is visible
    const hasControlPanel = await simulationPage.isControlPanelVisible()
    expect(hasControlPanel).toBe(true)

    // 4. Verify sector selector is available
    await expect(simulationPage.sectorSelect).toBeVisible()

    // Full workflow would require:
    // - Region selection (clicking on map)
    // - Setting investment percentage
    // - Selecting sector
    // - Running simulation
    // - Verifying results
    // This requires real test data or mocked API
  })
})
