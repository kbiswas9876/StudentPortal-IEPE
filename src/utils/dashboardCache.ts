/**
 * Dashboard Cache Utility
 * Implements hybrid loading: instant cache load → background fetch → smooth update
 */

export interface CachedDashboardData {
  books: any[]
  timestamp: number
}

const CACHE_KEY = 'dashboard_books_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached dashboard data from localStorage
 */
export function getCachedDashboardData(): CachedDashboardData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data: CachedDashboardData = JSON.parse(cached)
    
    // Check if cache is still valid
    const now = Date.now()
    if (now - data.timestamp > CACHE_DURATION) {
      // Cache expired
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading dashboard cache:', error)
    return null
  }
}

/**
 * Save dashboard data to localStorage cache
 */
export function cacheDashboardData(books: any[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData: CachedDashboardData = {
      books,
      timestamp: Date.now()
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching dashboard data:', error)
  }
}

/**
 * Clear dashboard cache
 */
export function clearDashboardCache(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Error clearing dashboard cache:', error)
  }
}

/**
 * Check if cache exists and is valid
 */
export function hasFreshCache(): boolean {
  const cached = getCachedDashboardData()
  return cached !== null
}
