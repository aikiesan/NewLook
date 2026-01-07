import { Page, Locator, expect } from '@playwright/test'

/**
 * Simulation Page Object Model
 *
 * Encapsulates all interactions with the economic simulation page.
 * Handles region selection, parameter configuration, and result verification.
 */
export class SimulationPage {
  readonly page: Page

  // Map elements
  readonly mapContainer: Locator
  readonly leafletContainer: Locator
  readonly regionMarkers: Locator
  readonly choroplethLayer: Locator

  // Control panel elements
  readonly controlPanel: Locator
  readonly regionSelector: Locator
  readonly investmentSlider: Locator
  readonly investmentValue: Locator
  readonly sectorSelect: Locator
  readonly runSimulationButton: Locator
  readonly newSimulationButton: Locator

  // Results panel elements
  readonly resultsPanel: Locator
  readonly totalVabImpact: Locator
  readonly economicMultiplier: Locator
  readonly jobsCreated: Locator
  readonly taxRevenue: Locator
  readonly sectorBreakdown: Locator
  readonly downloadButton: Locator

  // Region impact panel
  readonly regionImpactPanel: Locator
  readonly regionImpactName: Locator
  readonly regionImpactValue: Locator
  readonly spilloverWeight: Locator

  // Feedback elements
  readonly errorMessage: Locator
  readonly loadingSpinner: Locator
  readonly infoMessage: Locator

  // Header
  readonly header: Locator

  constructor(page: Page) {
    this.page = page

    // Map elements
    this.mapContainer = page.locator('.leaflet-container').first()
    this.leafletContainer = page.locator('.leaflet-container')
    this.regionMarkers = page.locator('.leaflet-marker-icon')
    this.choroplethLayer = page.locator('.leaflet-interactive')

    // Control panel (left side)
    this.controlPanel = page.locator('[class*="bg-white"], [class*="bg-slate-800"]').filter({
      has: page.locator('h2:has-text("Insumo-Produto"), h2:has-text("Input-Output")'),
    })
    this.regionSelector = page.locator('[class*="emerald-50"], [class*="emerald-900"]').filter({
      hasText: /região|region/i,
    })
    this.investmentSlider = page.locator('input[type="range"]').first()
    this.investmentValue = page.locator('text=/Valor estimado|Estimated value/i').first()
    this.sectorSelect = page.locator('select').first()
    this.runSimulationButton = page.locator('button:has-text("Executar"), button:has-text("Run")')
    this.newSimulationButton = page.locator('button:has-text("Nova Simulação"), button:has-text("New Simulation")')

    // Results panel (right side)
    this.resultsPanel = page.locator('[class*="bg-white"], [class*="bg-slate-800"]').filter({
      has: page.locator('h2:has-text("Resultados"), h2:has-text("Results")'),
    })
    this.totalVabImpact = page.locator('text=/VAB Total/i').locator('..').locator('[class*="font-bold"]')
    this.economicMultiplier = page.locator('text=/Multiplicador/i').locator('..').locator('[class*="font-bold"]')
    this.jobsCreated = page.locator('text=/Empregos|Jobs/i').locator('..').locator('[class*="font-bold"]')
    this.taxRevenue = page.locator('text=/Arrecadação|Tax/i').locator('..').locator('[class*="font-bold"]')
    this.sectorBreakdown = page.locator('h3:has-text("Impacto por Setor"), h3:has-text("Sector Impact")').locator('..')
    this.downloadButton = page.locator('button:has-text("Baixar"), button:has-text("Download")')

    // Region impact panel (bottom right)
    this.regionImpactPanel = page.locator('[class*="bg-white"], [class*="bg-slate-800"]').filter({
      has: page.locator('h2:has-text("Impacto Regional"), h2:has-text("Regional Impact")'),
    })
    this.regionImpactName = this.regionImpactPanel.locator('h3').first()
    this.regionImpactValue = this.regionImpactPanel.locator('[class*="emerald-700"], [class*="emerald-400"]').first()
    this.spilloverWeight = this.regionImpactPanel.locator('text=/Spillover/i').locator('..').locator('[class*="font-bold"]')

    // Feedback elements
    this.errorMessage = page.locator('[class*="red-50"], [class*="red-900"]').filter({
      has: page.locator('p'),
    })
    this.loadingSpinner = page.locator('[class*="animate-spin"]')
    this.infoMessage = page.locator('[class*="yellow-50"], [class*="yellow-900"]').filter({
      has: page.locator('p'),
    })

    // Header
    this.header = page.locator('header').first()
  }

  /**
   * Navigate to simulation page
   */
  async goto(locale: string = 'pt') {
    await this.page.goto(`/${locale}/dashboard/simulation`)
    await this.waitForPageLoad()
  }

  /**
   * Wait for the simulation page to fully load
   */
  async waitForPageLoad() {
    // Wait for map container
    await this.leafletContainer.waitFor({ state: 'visible', timeout: 30000 })

    // Wait for tiles to load
    await this.page.waitForSelector('.leaflet-tile-loaded', { timeout: 30000 })

    // Wait for loading spinner to disappear
    const spinner = this.page.locator('[class*="animate-spin"]:visible')
    if ((await spinner.count()) > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: 30000 })
    }
  }

  /**
   * Select a region on the map by clicking
   */
  async selectRegionByClick(regionIndex: number = 0) {
    // Wait for region markers to be available
    await this.regionMarkers.first().waitFor({ state: 'visible', timeout: 30000 })

    // Click on a region marker
    const markers = this.regionMarkers
    const count = await markers.count()

    if (count > regionIndex) {
      await markers.nth(regionIndex).click()
      await this.page.waitForTimeout(1000) // Wait for region data to load
    }
  }

  /**
   * Select a region from the choropleth layer
   */
  async selectRegionFromChoropleth() {
    // Click on a choropleth polygon
    const polygons = this.choroplethLayer
    const count = await polygons.count()

    if (count > 0) {
      await polygons.first().click()
      await this.page.waitForTimeout(1000)
    }
  }

  /**
   * Check if a region is selected
   */
  async isRegionSelected(): Promise<boolean> {
    // Check for the region selector panel showing selected region
    const selectedRegionText = this.page.locator('text=/Região Selecionada|Selected Region/i')
    return await selectedRegionText.isVisible()
  }

  /**
   * Get the name of the selected region
   */
  async getSelectedRegionName(): Promise<string> {
    const regionNameLocator = this.page.locator('[class*="emerald-900"], [class*="emerald-100"]').filter({
      has: this.page.locator('[class*="font-semibold"]'),
    })
    return (await regionNameLocator.first().textContent()) || ''
  }

  /**
   * Set the investment percentage using the slider
   */
  async setInvestmentPercent(percent: number) {
    await this.investmentSlider.fill(percent.toString())
    await this.page.waitForTimeout(300)
  }

  /**
   * Select an economic sector
   */
  async selectSector(sector: 'agriculture' | 'industry' | 'services' | 'public') {
    const sectorMap = {
      agriculture: 'agriculture',
      industry: 'industry',
      services: 'services',
      public: 'public',
    }
    await this.sectorSelect.selectOption({ value: sectorMap[sector] })
    await this.page.waitForTimeout(300)
  }

  /**
   * Run the simulation
   */
  async runSimulation() {
    await this.runSimulationButton.click()
    await this.waitForSimulationResults()
  }

  /**
   * Wait for simulation results to appear
   */
  async waitForSimulationResults() {
    // Wait for loading to complete
    const loadingButton = this.page.locator('button:has-text("Simulando"), button:has-text("Simulating")')
    if (await loadingButton.isVisible()) {
      await loadingButton.waitFor({ state: 'hidden', timeout: 60000 })
    }

    // Wait for results panel to appear
    await this.resultsPanel.waitFor({ state: 'visible', timeout: 60000 })
  }

  /**
   * Get simulation results
   */
  async getSimulationResults(): Promise<{
    vabImpact: string
    multiplier: string
    jobs: string
    taxRevenue: string
  }> {
    return {
      vabImpact: (await this.totalVabImpact.textContent()) || '',
      multiplier: (await this.economicMultiplier.textContent()) || '',
      jobs: (await this.jobsCreated.textContent()) || '',
      taxRevenue: (await this.taxRevenue.textContent()) || '',
    }
  }

  /**
   * Start a new simulation
   */
  async startNewSimulation() {
    await this.newSimulationButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Download simulation results
   */
  async downloadResults() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click(),
    ])
    return download
  }

  /**
   * Click on a region in the results to see regional impact
   */
  async viewRegionImpact(regionIndex: number = 0) {
    // After simulation, click on choropleth to see regional impact
    const polygons = this.choroplethLayer
    const count = await polygons.count()

    if (count > regionIndex) {
      await polygons.nth(regionIndex).click()
      await this.page.waitForTimeout(1000)
    }
  }

  /**
   * Check if regional impact panel is visible
   */
  async isRegionImpactPanelVisible(): Promise<boolean> {
    return await this.regionImpactPanel.isVisible()
  }

  /**
   * Close the regional impact panel
   */
  async closeRegionImpactPanel() {
    const closeButton = this.regionImpactPanel.locator('button:has([class*="X"])')
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Check if there's an error message
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    if (await this.hasError()) {
      return (await this.errorMessage.locator('p').textContent()) || ''
    }
    return ''
  }

  /**
   * Check if simulation is loading
   */
  async isLoading(): Promise<boolean> {
    const loadingButton = this.page.locator('button:has-text("Simulando"), button:has-text("Simulating")')
    return await loadingButton.isVisible()
  }

  /**
   * Verify the control panel is visible
   */
  async isControlPanelVisible(): Promise<boolean> {
    const panel = this.page.locator('h2:has-text("Insumo-Produto"), h2:has-text("Input-Output")')
    return await panel.isVisible()
  }

  /**
   * Toggle control panel visibility
   */
  async toggleControlPanel() {
    const toggleButton = this.page.locator('[aria-label*="Minimizar"], [aria-label*="Expandir"], [aria-label*="Minimize"], [aria-label*="Expand"]').first()
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Check page accessibility
   */
  async checkAccessibility() {
    // Form inputs should have labels
    await expect(this.sectorSelect).toBeVisible()

    // Buttons should have accessible labels
    const buttons = this.page.locator('button[aria-label]')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)

    // Map should be present and interactive
    await expect(this.mapContainer).toBeVisible()
  }

  /**
   * Take a screenshot of the simulation page
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `e2e-results/${name}.png`, fullPage: true })
  }
}
