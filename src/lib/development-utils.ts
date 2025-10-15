// Development utilities to prevent unnecessary reloads

export const isDevelopment = process.env.NODE_ENV === 'development'

export const preventHotReload = () => {
  if (isDevelopment && typeof window !== 'undefined') {
    // Prevent hot reloading on tab focus
    const originalAddEventListener = window.addEventListener
    window.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'focus' && isDevelopment) {
        return
      }
      return originalAddEventListener.call(this, type, listener, options)
    }
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}
