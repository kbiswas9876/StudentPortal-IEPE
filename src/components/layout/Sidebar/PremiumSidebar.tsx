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
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
  const color = '#4a5568'
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
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          shadow-xl
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    SP
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-bold text-lg tracking-tight">
                    Student Portal
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-4 mb-4" />

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
                    transition-all duration-300 cursor-pointer
                    ${isActive('/dashboard')
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/40 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
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
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${isPracticeMenuOpen ? 'rotate-180' : ''
                      }`}
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
                              ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 font-medium'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'practice' && isActive('/dashboard') ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                          Practice Setup
                        </div>
                        <div
                          onClick={() => handleSubMenuClick('saved')}
                          className={`
                            flex items-center gap-3 px-4 py-2 mx-2 ml-6 rounded-md
                            transition-all duration-200 cursor-pointer text-sm
                            ${activeTab === 'saved' && isActive('/dashboard')
                              ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 font-medium'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'saved' && isActive('/dashboard') ? 'bg-indigo-600' : 'bg-slate-400'}`} />
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
              />
              <MaterialNavItem
                icon={ClockIcon}
                label="Mock Tests"
                href="/mock-tests"
                isActive={isActive('/mock-tests')}
                onClick={isMobile ? onClose : undefined}
              />

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-4" />

              {/* Management Section */}
              <SectionHeader title="Management" />
              <MaterialNavItem
                icon={FolderOpenIcon}
                label="Content Library"
                href="/my-content"
                isActive={isActive('/my-content')}
                onClick={isMobile ? onClose : undefined}
              />
              <MaterialNavItem
                icon={CalendarIcon}
                label="Study Plans"
                href="/my-plans"
                isActive={isActive('/my-plans')}
                onClick={isMobile ? onClose : undefined}
              />

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-4" />

              {/* Settings Section */}
              <SectionHeader title="Settings" />
              <MaterialNavItem
                icon={CogIcon}
                label="Preferences"
                href="/settings"
                isActive={isActive('/settings')}
                onClick={isMobile ? onClose : undefined}
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-xs text-slate-400 dark:text-slate-500">Student Portal v2.0</span>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}