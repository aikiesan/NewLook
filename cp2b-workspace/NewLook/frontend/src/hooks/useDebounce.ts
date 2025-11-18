/**
 * Custom React Hook: useDebounce
 * Prevents spam clicks and excessive API calls
 * Sprint 4: Task 4.1 - Performance Optimization
 */

import { useEffect, useState } from 'react'

/**
 * Debounce a value - delays update until user stops typing/clicking
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 500)
 * 
 * useEffect(() => {
 *   // API call only happens after user stops typing for 500ms
 *   fetchResults(debouncedQuery)
 * }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancel timeout if value changes before delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle function calls - ensures function runs at most once per interval
 * 
 * @param callback - Function to throttle
 * @param delay - Minimum delay between calls (default: 300ms)
 * @returns Throttled function
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll event')
 * }, 100) // Runs at most every 100ms
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [lastRun, setLastRun] = useState(Date.now())

  return ((...args) => {
    const now = Date.now()
    
    if (now - lastRun >= delay) {
      setLastRun(now)
      return callback(...args)
    }
  }) as T
}

