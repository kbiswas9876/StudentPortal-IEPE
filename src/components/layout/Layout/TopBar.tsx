'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import HamburgerMenu from '../Navigation/HamburgerMenu'
import DueQuestionsCounter from '@/components/DueQuestionsCounter'
import NotificationBell from '@/components/NotificationBell'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import SrsSettingsModal from '@/components/SrsSettingsModal'
import { Menu, Transition } from '@headlessui/react'
import { Play, Settings, Sparkles } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

// Revision Hub Controls Component
function RevisionHubControls({ userId }: { userId: string }) {
  const router = useRouter()
  const [dueCount, setDueCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [isSrsSettingsOpen, setIsSrsSettingsOpen] = useState(false)

  useEffect(() => {
    fetchDueCount()
  }, [userId])

  const fetchDueCount = async () => {
    try {
      const response = await fetch(`/api/revision-hub/due-questions?userId=${userId}`)
      const result = await response.json()
      if (response.ok) {
        setDueCount(result.questions?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching due count:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartReview = async () => {
    try {
      const response = await fetch(`/api/revision-hub/due-questions?userId=${userId}`)
      const result = await response.json()
      
      if (!response.ok || !result.questions || result.questions.length === 0) {
        alert('No questions due for review')
        return
      }

      const questionIds = result.questions.map((q: any) => q.question_id)
      const params = new URLSearchParams({
        questions: questionIds.join(','),
        testMode: 'practice',
        srsMode: 'true',
        fresh: 'true'
      })

      router.push(`/practice?${params.toString()}`)
    } catch (error) {
      console.error('Error starting review:', error)
      alert('Failed to start review')
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-terra-light rounded-lg border border-warm-border">
      {/* Daily Review Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-charcoal shadow-sm">
          <Sparkles className="h-3 w-3 text-warm-surface" strokeWidth={2.5} />
          <span className="text-xs font-bold text-warm-surface tabular-nums">
            {loading ? '...' : dueCount}
          </span>
        </div>
        <span className="text-xs font-semibold text-charcoal-mid">
          Daily Review
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-warm-border"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartReview}
          disabled={loading || dueCount === 0}
          className="px-3 py-1 bg-terra hover:bg-[#A84F22] disabled:bg-charcoal-muted text-white font-semibold text-xs rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="h-3 w-3" strokeWidth={2.5} />
          Start
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSrsSettingsOpen(true)}
          className="px-3 py-1 bg-charcoal hover:bg-[#3E3E4A] text-warm-surface font-semibold text-xs rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1"
          title="SRS Settings"
        >
          <Settings className="h-3 w-3" strokeWidth={2.5} />
          Settings
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/revision-hub/analytics')}
          className="px-3 py-1 bg-terra-light border border-warm-border hover:bg-warm-hover text-terra font-semibold text-xs rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Analytics
        </motion.button>
      </div>

      {/* SRS Settings Modal */}
      <SrsSettingsModal
        isOpen={isSrsSettingsOpen}
        onClose={() => setIsSrsSettingsOpen(false)}
        userId={userId}
      />
    </div>
  )
}

const getPageTitle = (pathname: string) => {
  if (pathname === '/' || pathname === '/dashboard') return 'Practice Dashboard'
  if (pathname.startsWith('/revision-hub')) return 'Revision Hub'
  if (pathname.startsWith('/mock-tests')) return 'Mock Tests'
  if (pathname.startsWith('/my-content')) return 'My Content'
  if (pathname.startsWith('/my-plans')) return 'My Plans'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Student Portal'
}

const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) return []
  
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    return { href, label }
  })
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const pageTitle = getPageTitle(pathname || '')
  const breadcrumbs = getBreadcrumbs(pathname || '')
  
  // Safely get theme context
  let theme = 'light'
  let toggleTheme = () => {}
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    toggleTheme = themeContext.toggleTheme
  } catch (error) {
    console.warn('ThemeProvider not available, using default theme')
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-md border-b border-warm-border">
      <div className="flex items-center justify-between px-4 h-[69px]">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <HamburgerMenu isOpen={false} onClick={onMenuClick} />
          
          <div>
            <h1 className="text-lg font-serif font-semibold text-charcoal">
              {pageTitle}
            </h1>
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1 text-sm text-charcoal-muted">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <svg className="w-3 h-3 text-charcoal-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <span className={index === breadcrumbs.length - 1 ? 'text-charcoal-mid font-medium' : ''}>
                      {crumb.label}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center space-x-3">
          {/* Revision Hub Controls */}
          {user && pathname === '/revision-hub' && (
            <RevisionHubControls userId={user.id} />
          )}
          
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-warm-hover transition-colors duration-200"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <motion.div
              animate={{ rotate: theme === 'light' ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {theme === 'light' ? (
                <SunIcon className="h-5 w-5 text-charcoal-mid" />
              ) : (
                <MoonIcon className="h-5 w-5 text-charcoal-mid" />
              )}
            </motion.div>
          </motion.button>
          
          {/* Notification Bell */}
          {user && <NotificationBell userId={user.id} />}
          
          {/* User Profile */}
          {user && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center p-2 rounded-lg hover:bg-warm-hover transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-br from-terra to-terra-mid rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Menu.Button>

              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 top-full mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-warm-border focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={`${
                            active ? 'bg-warm-hover' : ''
                          } flex items-center px-4 py-2 text-sm text-charcoal-mid`}
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Profile Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-warm-hover' : ''
                          } flex items-center w-full text-left px-4 py-2 text-sm text-red-600`}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
    </div>
  )
}