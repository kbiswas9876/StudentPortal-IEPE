'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import PremiumSidebar from '../Sidebar/PremiumSidebar'
import TopBar from './TopBar'
import { useSidebar } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isCollapsed: sidebarCollapsed } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  // Strict Protection: Redirect non-active or unauthenticated users away from dashboard/protected routes
  useEffect(() => {
    if (!loading && pathname !== '/login') {
      if (!user || !userProfile || userProfile.status !== 'active') {
        router.push('/login')
      }
    }
  }, [user, userProfile, loading, pathname, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Don't show sidebar on certain pages or when user is not active
  const hideSidebar = pathname?.includes('/practice') ||
    pathname?.includes('/instructions') ||
    pathname?.includes('/solutions') ||
    pathname === '/login' ||
    !userProfile ||
    userProfile.status !== 'active'

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Full screen loading indicator while checking auth & profile status on protected routes
  if (loading && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-md" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide">Verifying authorization...</p>
        </div>
      </div>
    )
  }

  // Block rendering protected dashboard content if user is missing, profile is missing, or status is pending/correction_required
  if (!loading && pathname !== '/login' && (!user || !userProfile || userProfile.status !== 'active')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-600 font-medium">Redirecting to status verification...</p>
        </div>
      </div>
    )
  }

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