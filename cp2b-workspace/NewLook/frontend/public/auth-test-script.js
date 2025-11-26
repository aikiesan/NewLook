/**
 * CP2B Maps V3 - Authentication Testing Script
 *
 * Usage:
 * 1. Open browser DevTools Console
 * 2. Navigate to /login page
 * 3. Paste this entire script
 * 4. Run `AuthTest.runAll()` or individual tests
 */

window.AuthTest = {
  results: [],
  startTime: null,

  log: function(message, type = 'info') {
    const timestamp = Date.now() - this.startTime
    const entry = { timestamp, message, type }
    this.results.push(entry)

    const icon = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || 'ℹ️'

    console.log(`[${timestamp}ms] ${icon} ${message}`)
  },

  /**
   * Test 1: Check Auth State
   */
  checkAuthState: function() {
    console.group('🔍 Test 1: Auth State Inspector')
    this.startTime = Date.now()

    // Check cookies
    const authCookies = document.cookie
      .split(';')
      .filter(c => c.includes('sb-'))
      .map(c => c.trim())

    if (authCookies.length > 0) {
      this.log(`Found ${authCookies.length} Supabase cookies`, 'success')
      authCookies.forEach(cookie => {
        console.log(`  ${cookie.substring(0, 50)}...`)
      })
    } else {
      this.log('No Supabase auth cookies found', 'warning')
    }

    // Check localStorage
    const localStorageKeys = Object.keys(localStorage)
      .filter(k => k.includes('supabase'))

    if (localStorageKeys.length > 0) {
      this.log(`Found ${localStorageKeys.length} Supabase localStorage entries`, 'success')
    } else {
      this.log('No Supabase localStorage entries', 'warning')
    }

    // Check environment variables (public ones only)
    const envVars = {
      hasSupabaseUrl: !!window.location.origin,
      // Can't check actual env vars from browser
    }

    console.groupEnd()
    return { authCookies, localStorageKeys, envVars }
  },

  /**
   * Test 2: Monitor Loading State
   */
  monitorLoadingState: async function(duration = 10000) {
    console.group('⏱️ Test 2: Loading State Monitor')
    this.startTime = Date.now()
    this.log(`Monitoring loading state for ${duration/1000} seconds...`)

    const loadingStates = []
    const interval = setInterval(() => {
      // Check if loading spinner is visible
      const spinners = document.querySelectorAll('[class*="animate-spin"]')
      const hasSpinner = spinners.length > 0

      loadingStates.push({
        time: Date.now() - this.startTime,
        hasSpinner,
        spinnerCount: spinners.length
      })
    }, 100) // Check every 100ms

    await new Promise(resolve => setTimeout(resolve, duration))
    clearInterval(interval)

    // Analyze results
    const spinnerDuration = loadingStates.filter(s => s.hasSpinner).length * 100
    const finalState = loadingStates[loadingStates.length - 1]

    this.log(`Spinner visible for ${spinnerDuration}ms`, spinnerDuration > 5000 ? 'error' : 'success')
    this.log(`Final state: ${finalState.hasSpinner ? 'Still loading (BAD!)' : 'Loaded (GOOD!)'}`,
      finalState.hasSpinner ? 'error' : 'success')

    console.groupEnd()
    return { loadingStates, spinnerDuration }
  },

  /**
   * Test 3: Performance Metrics
   */
  checkPerformance: function() {
    console.group('📊 Test 3: Performance Metrics')
    this.startTime = Date.now()

    // Check page load metrics
    if (window.performance && window.performance.timing) {
      const perf = window.performance.timing
      const pageLoad = perf.loadEventEnd - perf.navigationStart
      const domReady = perf.domContentLoadedEventEnd - perf.navigationStart

      this.log(`Page load time: ${pageLoad}ms`, pageLoad < 3000 ? 'success' : 'warning')
      this.log(`DOM ready time: ${domReady}ms`, domReady < 1000 ? 'success' : 'warning')
    }

    // Check resource timing
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource')
      const slowResources = resources.filter(r => r.duration > 1000)

      if (slowResources.length > 0) {
        this.log(`Found ${slowResources.length} slow resources (>1s)`, 'warning')
        slowResources.forEach(r => {
          console.log(`  ${r.name.substring(0, 50)}: ${r.duration.toFixed(0)}ms`)
        })
      } else {
        this.log('All resources loaded quickly', 'success')
      }
    }

    console.groupEnd()
  },

  /**
   * Test 4: Network Request Monitor
   */
  monitorNetworkRequests: function() {
    console.group('🌐 Test 4: Network Request Monitor')
    this.startTime = Date.now()

    const originalFetch = window.fetch
    let requestCount = 0

    window.fetch = function(...args) {
      requestCount++
      const url = args[0]
      const startTime = Date.now()

      return originalFetch.apply(this, args)
        .then(response => {
          const duration = Date.now() - startTime
          const status = response.status

          const icon = status >= 200 && status < 300 ? '✅' : '❌'
          console.log(`${icon} [${duration}ms] ${status} ${url}`)

          return response
        })
        .catch(error => {
          const duration = Date.now() - startTime
          console.log(`❌ [${duration}ms] ERROR ${url}:`, error.message)
          throw error
        })
    }

    this.log('Network request monitoring enabled', 'success')
    this.log('Try logging in now - requests will be logged', 'info')

    console.groupEnd()

    // Return restore function
    return () => {
      window.fetch = originalFetch
      console.log(`📊 Total requests monitored: ${requestCount}`)
    }
  },

  /**
   * Test 5: Auth Flow Simulation
   */
  simulateAuthFlow: async function() {
    console.group('🔄 Test 5: Auth Flow Simulation')
    this.startTime = Date.now()

    this.log('Simulating auth flow...', 'info')

    // Check initial state
    this.log('Step 1: Checking initial state...', 'info')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Simulate form interaction
    const emailInput = document.querySelector('input[type="email"]')
    const passwordInput = document.querySelector('input[type="password"]')
    const submitButton = document.querySelector('button[type="submit"]')

    if (emailInput && passwordInput && submitButton) {
      this.log('Step 2: Form elements found', 'success')

      // Check if fields are enabled
      const fieldsEnabled = !emailInput.disabled && !passwordInput.disabled
      this.log(`Step 3: Form fields ${fieldsEnabled ? 'enabled' : 'disabled'}`,
        fieldsEnabled ? 'success' : 'warning')

      // Check if button is enabled
      const buttonEnabled = !submitButton.disabled
      this.log(`Step 4: Submit button ${buttonEnabled ? 'enabled' : 'disabled'}`,
        buttonEnabled ? 'success' : 'warning')
    } else {
      this.log('Step 2: Form elements not found!', 'error')
    }

    console.groupEnd()
  },

  /**
   * Test 6: Console Log Monitor
   */
  monitorConsoleLogs: function(duration = 30000) {
    console.group('📝 Test 6: Console Log Monitor')
    this.startTime = Date.now()

    const logs = {
      auth: [],
      error: [],
      warning: [],
      other: []
    }

    // Intercept console methods
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = function(...args) {
      const message = args.join(' ')
      if (message.includes('[Auth]')) {
        logs.auth.push({ time: Date.now(), message, type: 'log' })
      } else {
        logs.other.push({ time: Date.now(), message, type: 'log' })
      }
      return originalLog.apply(console, args)
    }

    console.error = function(...args) {
      const message = args.join(' ')
      logs.error.push({ time: Date.now(), message })
      return originalError.apply(console, args)
    }

    console.warn = function(...args) {
      const message = args.join(' ')
      logs.warning.push({ time: Date.now(), message })
      return originalWarn.apply(console, args)
    }

    this.log(`Monitoring console for ${duration/1000} seconds...`, 'info')

    setTimeout(() => {
      // Restore original console methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn

      // Report findings
      console.group('📊 Console Log Summary')
      console.log(`Auth logs: ${logs.auth.length}`)
      console.log(`Errors: ${logs.error.length}`)
      console.log(`Warnings: ${logs.warning.length}`)
      console.log(`Other logs: ${logs.other.length}`)

      if (logs.auth.length > 0) {
        console.group('🔐 Auth Logs Timeline')
        logs.auth.forEach(log => {
          console.log(`[${log.time}ms] ${log.message}`)
        })
        console.groupEnd()
      }

      if (logs.error.length > 0) {
        console.group('❌ Errors')
        logs.error.forEach(log => {
          console.error(log.message)
        })
        console.groupEnd()
      }

      console.groupEnd()
    }, duration)

    console.groupEnd()
  },

  /**
   * Run All Tests
   */
  runAll: async function() {
    console.clear()
    console.log('🚀 CP2B Maps V3 - Authentication Test Suite')
    console.log('=' .repeat(60))

    // Test 1
    await this.checkAuthState()
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 2
    await this.monitorLoadingState(10000)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 3
    await this.checkPerformance()
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 5
    await this.simulateAuthFlow()

    console.log('=' .repeat(60))
    console.log('✅ Test suite completed!')
    console.log('💡 To monitor network requests, run: AuthTest.monitorNetworkRequests()')
    console.log('💡 To monitor console logs, run: AuthTest.monitorConsoleLogs(30000)')
  },

  /**
   * Generate Report
   */
  generateReport: function() {
    console.group('📋 Test Report')
    console.table(this.results)
    console.groupEnd()

    return this.results
  }
}

// Auto-run if on login page
if (window.location.pathname.includes('/login')) {
  console.log('🔍 Auth test script loaded!')
  console.log('💡 Run AuthTest.runAll() to start testing')
  console.log('💡 Or run individual tests:')
  console.log('   - AuthTest.checkAuthState()')
  console.log('   - AuthTest.monitorLoadingState(10000)')
  console.log('   - AuthTest.checkPerformance()')
  console.log('   - AuthTest.monitorNetworkRequests()')
  console.log('   - AuthTest.simulateAuthFlow()')
  console.log('   - AuthTest.monitorConsoleLogs(30000)')
}
