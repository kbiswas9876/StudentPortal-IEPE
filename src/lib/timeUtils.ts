/**
 * Utility functions for time formatting and manipulation
 */

/**
 * Converts seconds to human-readable format (HHh MMm SSs)
 * @param totalSeconds - Total seconds to format
 * @returns Formatted time string
 */
export function formatTimeHumanReadable(totalSeconds: number): string {
  if (totalSeconds < 0) return '0s'
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`)
  }
  
  return parts.join(' ')
}

/**
 * Converts seconds to HH:MM:SS format
 * @param totalSeconds - Total seconds to format
 * @returns Formatted time string in HH:MM:SS format
 */
export function formatTimeHHMMSS(totalSeconds: number): string {
  if (totalSeconds < 0) return '00:00:00'
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Converts milliseconds to human-readable format
 * @param milliseconds - Milliseconds to format
 * @returns Formatted time string
 */
export function formatTimeFromMilliseconds(milliseconds: number): string {
  return formatTimeHumanReadable(Math.floor(milliseconds / 1000))
}

/**
 * Converts time string to seconds
 * @param timeString - Time string in format "HH:MM:SS" or "MM:SS"
 * @returns Total seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}
