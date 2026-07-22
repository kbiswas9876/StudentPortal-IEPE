'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/lib/sidebar-context'
import { useDashboard } from '@/lib/dashboard-context'
import MaterialNavItem from './MaterialNavItem'
import {
  HomeIcon,
  BookOpenIcon,
  ClockIcon,
  FolderOpenIcon,
  CalendarIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

interface PremiumSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

interface SectionHeaderProps {
  title: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <div className="px-6 py-3 mt-2 mb-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-charcoal-muted">
        {title}
      </span>
    </div>
  )
}

const HamburgerMenu = ({
  isOpen,
  onClick,
  isMobile = false,
}: {
  isOpen: boolean
  onClick: () => void
  isMobile?: boolean
}) => {
  const strokeWidth = 2
  const color = '#52525E'
  const transition = { type: 'spring', stiffness: 400, damping: 30 }

  const topLineVariants = {
    open: { rotate: 45, y: 6 },
    closed: { rotate: 0, y: 0 },
  }

  const middleLineVariants = {
    open: { opacity: 0 },
    closed: { opacity: 1 },
  }

  const bottomLineVariants = {
    open: { rotate: -45, y: -6 },
    closed: { rotate: 0, y: 0 },
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-warm-hover transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <motion.div
        className="w-5 h-4 flex flex-col justify-between"
        animate={isOpen ? 'open' : 'closed'}
        initial={false}
      >
        <motion.div
          variants={topLineVariants}
          transition={transition}
          style={{
            width: '100%',
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            originX: 'center',
          }}
        />
        <motion.div
          variants={middleLineVariants}
          transition={transition}
          style={{
            width: '100%',
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        <motion.div
          variants={bottomLineVariants}
          transition={transition}
          style={{
            width: '100%',
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            originX: 'center',
          }}
        />
      </motion.div>
    </motion.button>
  )
}

export default function PremiumSidebar({ isOpen, onClose, isMobile = false }: PremiumSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { activeTab, setActiveTab } = useDashboard()
  const [isPracticeMenuOpen, setIsPracticeMenuOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/') {
      setIsPracticeMenuOpen(true)
    } else {
      setIsPracticeMenuOpen(false)
    }
  }, [pathname])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname?.startsWith(path) || false
  }

  const handleSubMenuClick = (tab: 'practice' | 'saved') => {
    if (pathname !== '/dashboard' && pathname !== '/') {
      router.push('/dashboard');
    }
    setActiveTab(tab)
    if (isMobile) {
      onClose()
    }
  }

  const sidebarWidth = isCollapsed && !isMobile ? '80px' : '260px'

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        initial={isMobile ? { x: '-100%' } : false}
        animate={{
          x: isMobile && !isOpen ? '-100%' : 0,
          width: sidebarWidth
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-0 h-screen z-50
          bg-warm-surface
          border-r border-warm-border
          shadow-sm
          ${isMobile ? 'lg:hidden' : 'hidden lg:block'}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-[70px]">
          <div className="flex items-center gap-3 w-full">
            <HamburgerMenu
              isOpen={isMobile ? isOpen : !isCollapsed}
              onClick={isMobile ? onClose : () => setIsCollapsed(!isCollapsed)}
              isMobile={isMobile}
            />
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
              >
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center text-warm-surface font-bold text-sm shadow-sm">
                    SP
                  </div>
                  <span className="text-charcoal font-serif font-semibold text-lg tracking-tight">
                    Student Portal
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-warm-border to-transparent mx-4 mb-4" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {(!isCollapsed || isMobile) ? (
            <>
              {/* Learning Section */}
              <SectionHeader title="Learning" />

              {/* Dashboard Item with Submenu */}
              <div className="mb-1">
                <div
                  className={`
                    relative flex items-center justify-between px-4 py-3 mx-2 rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${isActive('/dashboard')
                      ? 'bg-terra text-white shadow-sm'
                      : 'text-charcoal-mid hover:bg-warm-hover hover:text-charcoal'
                    }
                  `}
                  onClick={() => {
                    if (pathname !== '/dashboard' && pathname !== '/') {
                      router.push('/dashboard');
                    }
                    setActiveTab('practice');
                    setIsPracticeMenuOpen(!isPracticeMenuOpen);
                    if (isMobile && !isActive('/dashboard')) {
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <HomeIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isPracticeMenuOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Submenu */}
                <AnimatePresence>
                  {isPracticeMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-1">
                        <div
                          onClick={() => handleSubMenuClick('practice')}
                          className={`
                            flex items-center gap-3 px-4 py-2 mx-2 ml-6 rounded-md
                            transition-all duration-200 cursor-pointer text-sm
                            ${activeTab === 'practice' && isActive('/dashboard')
                              ? 'text-terra bg-terra-light font-medium'
                              : 'text-charcoal-muted hover:text-charcoal-mid hover:bg-warm-hover'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeTab === 'practice' && isActive('/dashboard') ? 'bg-terra' : 'bg-charcoal-muted'}`} />
                          Practice Setup
                        </div>
                        <div
                          onClick={() => handleSubMenuClick('saved')}
                          className={`
                            flex items-center gap-3 px-4 py-2 mx-2 ml-6 rounded-md
                            transition-all duration-200 cursor-pointer text-sm
                            ${activeTab === 'saved' && isActive('/dashboard')
                              ? 'text-terra bg-terra-light font-medium'
                              : 'text-charcoal-muted hover:text-charcoal-mid hover:bg-warm-hover'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeTab === 'saved' && isActive('/dashboard') ? 'bg-terra' : 'bg-charcoal-muted'}`} />
                          Saved Sessions
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <MaterialNavItem
                icon={BookOpenIcon}
                label="Revision Hub"
                href="/revision-hub"
                isActive={isActive('/revision-hub')}
                onClick={isMobile ? onClose : undefined}
                activeClassName="bg-terra text-white"
                inactiveClassName="text-charcoal-mid hover:bg-warm-hover hover:text-charcoal"
              />
              <MaterialNavItem
                icon={ClockIcon}
                label="Mock Tests"
                href="/mock-tests"
                isActive={isActive('/mock-tests')}
                onClick={isMobile ? onClose : undefined}
                activeClassName="bg-terra text-white"
                inactiveClassName="text-charcoal-mid hover:bg-warm-hover hover:text-charcoal"
              />

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent mx-4" />

              {/* Management Section */}
              <SectionHeader title="Management" />
              <MaterialNavItem
                icon={FolderOpenIcon}
                label="Content Library"
                href="/my-content"
                isActive={isActive('/my-content')}
                onClick={isMobile ? onClose : undefined}
                activeClassName="bg-terra text-white"
                inactiveClassName="text-charcoal-mid hover:bg-warm-hover hover:text-charcoal"
              />
              <MaterialNavItem
                icon={CalendarIcon}
                label="Study Plans"
                href="/my-plans"
                isActive={isActive('/my-plans')}
                onClick={isMobile ? onClose : undefined}
                activeClassName="bg-terra text-white"
                inactiveClassName="text-charcoal-mid hover:bg-warm-hover hover:text-charcoal"
              />

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent mx-4" />

              {/* Settings Section */}
              <SectionHeader title="Settings" />
              <MaterialNavItem
                icon={CogIcon}
                label="Preferences"
                href="/settings"
                isActive={isActive('/settings')}
                onClick={isMobile ? onClose : undefined}
                activeClassName="bg-terra text-white"
                inactiveClassName="text-charcoal-mid hover:bg-warm-hover hover:text-charcoal"
              />
            </>
          ) : (
            /* Collapsed State */
            <div className="flex flex-col items-center gap-2 mt-4">
              <MaterialNavItem
                icon={HomeIcon}
                label="Dashboard"
                href="/dashboard"
                isActive={isActive('/dashboard')}
                isCollapsed={true}
              />
              <MaterialNavItem
                icon={BookOpenIcon}
                label="Revision"
                href="/revision-hub"
                isActive={isActive('/revision-hub')}
                isCollapsed={true}
              />
              <MaterialNavItem
                icon={ClockIcon}
                label="Tests"
                href="/mock-tests"
                isActive={isActive('/mock-tests')}
                isCollapsed={true}
              />
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2" />
              <MaterialNavItem
                icon={FolderOpenIcon}
                label="Content"
                href="/my-content"
                isActive={isActive('/my-content')}
                isCollapsed={true}
              />
              <MaterialNavItem
                icon={CalendarIcon}
                label="Plans"
                href="/my-plans"
                isActive={isActive('/my-plans')}
                isCollapsed={true}
              />
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2" />
              <MaterialNavItem
                icon={CogIcon}
                label="Settings"
                href="/settings"
                isActive={isActive('/settings')}
                isCollapsed={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-warm-border">
            <div className="text-center">
              <span className="text-xs text-charcoal-muted">Student Portal v2.0</span>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}