/**
 * Revision Hub Cache Utility
 * Implements hybrid loading: instant cache load → background fetch → smooth update
 */

export interface CachedRevisionHubData {
  questions: any[]
  timestamp: number
  userId: string
}

const CACHE_KEY_PREFIX = 'revision_hub_cache_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cache key for specific user
 */
function getCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`
}

/**
 * Get cached revision hub data from localStorage
 */
export function getCachedRevisionHubData(userId: string): CachedRevisionHubData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(getCacheKey(userId))
    if (!cached) return null
    
    const data: CachedRevisionHubData = JSON.parse(cached)
    
    // Verify it's for the correct user
    if (data.userId !== userId) {
      localStorage.removeItem(getCacheKey(userId))
      return null
    }
    
    // Check if cache is still valid
    const now = Date.now()
    if (now - data.timestamp > CACHE_DURATION) {
      // Cache expired
      localStorage.removeItem(getCacheKey(userId))
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading revision hub cache:', error)
    return null
  }
}

/**
 * Save revision hub data to localStorage cache
 */
export function cacheRevisionHubData(userId: string, questions: any[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData: CachedRevisionHubData = {
      questions,
      timestamp: Date.now(),
      userId
    }
    
    localStorage.setItem(getCacheKey(userId), JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching revision hub data:', error)
  }
}

/**
 * Clear revision hub cache for specific user
 */
export function clearRevisionHubCache(userId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(getCacheKey(userId))
  } catch (error) {
    console.error('Error clearing revision hub cache:', error)
  }
}

/**
 * Check if cache exists and is valid for user
 */
export function hasFreshRevisionHubCache(userId: string): boolean {
  const cached = getCachedRevisionHubData(userId)
  return cached !== null
}
