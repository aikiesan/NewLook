/**
 * Custom React Hook: useOnlineStatus
 * Detects when user goes offline/online
 * Sprint 4: Task 4.2 - Network offline detection
 */

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    function handleOnline() {
      logger.info('✅ Network connection restored')
      setIsOnline(true)
    }

    function handleOffline() {
      logger.warn('⚠️ Network connection lost')
      setIsOnline(false)
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

