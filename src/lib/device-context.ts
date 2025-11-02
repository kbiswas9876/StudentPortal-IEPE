// Utility to extract device and browser information from user agent
// This is safe to call on both client and server (returns defaults on server)

export interface DeviceContext {
  deviceType: string
  browserName: string
  osName: string
  userAgentString: string
}

/**
 * Get device context information from the user agent.
 * This function is safe to call on both client and server (returns defaults on server).
 */
export function getDeviceContext(): DeviceContext {
  // Ensure this code only runs on the client-side
  if (typeof window === 'undefined') {
    return {
      deviceType: 'unknown',
      browserName: 'unknown',
      osName: 'unknown',
      userAgentString: '',
    }
  }
  
  // Simple user agent parsing without external dependencies
  const userAgent = navigator.userAgent
  
  // Detect browser
  let browserName = 'Unknown'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari'
  } else if (userAgent.includes('Edg')) {
    browserName = 'Edge'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browserName = 'Opera'
  }
  
  // Detect OS
  let osName = 'Unknown'
  if (userAgent.includes('Win')) {
    osName = 'Windows'
  } else if (userAgent.includes('Mac')) {
    osName = 'macOS'
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  } else if (userAgent.includes('Android')) {
    osName = 'Android'
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    osName = 'iOS'
  }
  
  // Detect device type
  let deviceType = 'desktop'
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/Tablet|iPad/.test(userAgent)) {
    deviceType = 'tablet'
  }
  
  return {
    deviceType,
    browserName,
    osName,
    userAgentString: userAgent,
  }
}
