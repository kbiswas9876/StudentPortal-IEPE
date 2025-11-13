'use client'

/**
 * ChartJsProvider Component
 * Client-side component that ensures Chart.js is configured before any charts are rendered
 * Import this component in the root layout to register Chart.js globally
 */

import { useEffect, useState } from 'react'

export function ChartJsProvider({ children }: { children: React.ReactNode }) {
  const [isChartJsReady, setIsChartJsReady] = useState(false)

  useEffect(() => {
    // Import and register Chart.js components
    import('@/lib/chartjs-config').then(() => {
      setIsChartJsReady(true)
    })
  }, [])

  // Render children immediately - Chart.js will be ready when components need it
  return <>{children}</>
}
