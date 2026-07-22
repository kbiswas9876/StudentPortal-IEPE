'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import PremiumSidebar from '../Sidebar/PremiumSidebar'
import TopBar from './TopBar'
import { useSidebar } from '@/lib/sidebar-context'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isCollapsed: sidebarCollapsed } = useSidebar()
  const pathname = usePathname()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Don't show sidebar on certain pages
  const hideSidebar = pathname?.includes('/practice') ||
    pathname?.includes('/instructions') ||
    pathname?.includes('/solutions') ||
    pathname === '/login'

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen bg-warm-bg">
      {!hideSidebar && (
        <>
          {/* Desktop Sidebar */}
          <PremiumSidebar
            isOpen={true}
            onClose={() => { }}
            isMobile={false}
          />

          {/* Mobile Sidebar */}
          <PremiumSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
          />
        </>
      )}

      <div className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${!hideSidebar ? (
          sidebarCollapsed
            ? 'lg:ml-20'
            : 'lg:ml-[260px]'
        ) : ''}
      `}>
        {!hideSidebar && (
          <TopBar onMenuClick={toggleSidebar} />
        )}

        <main className={`
          ${!hideSidebar ? 'pt-16 lg:pt-0' : ''}
          ${!hideSidebar ? 'py-4 lg:py-6' : 'min-h-screen'}
        `}>
          {children}
        </main>
      </div>
    </div>
  )
}