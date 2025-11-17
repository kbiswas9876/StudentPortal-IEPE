'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/lib/sidebar-context'
import { useDashboard } from '@/lib/dashboard-context'
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

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  isActive: boolean
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, isActive, onClick }) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`
          flex items-center gap-3 px-4 py-3
          transition-all duration-300 cursor-pointer
          ${isActive 
            ? 'bg-slate-100 text-indigo-900' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
        <span className="font-medium text-sm">{label}</span>
      </motion.div>
    </Link>
  )
}

interface SectionHeaderProps {
  title: string
  color: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, color }) => {
  return (
    <div className="px-6 py-3 mt-4">
      <div className="flex items-center gap-2">
        <div 
          className="w-1 h-4 rounded-full"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
      </div>
      <div 
        className="h-px mt-1.5"
        style={{ background: `linear-gradient(90deg, ${color}66, transparent)` }}
      />
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
  const strokeWidth = 3
  const color = '#4a5568'
  const transition = { type: 'spring', stiffness: 400, damping: 30 }

  const topLineVariants = {
    open: { rotate: 45, y: 8.5 },
    closed: { rotate: 0, y: 0 },
  }

  const middleLineVariants = {
    open: { opacity: 0 },
    closed: { opacity: 1 },
  }

  const bottomLineVariants = {
    open: { rotate: -45, y: -8.5 },
    closed: { rotate: 0, y: 0 },
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <motion.div
        className="w-5 h-5 flex flex-col justify-between"
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
    // Open the submenu if the user is on the dashboard page
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

  const sidebarWidth = isCollapsed && !isMobile ? '80px' : '280px'

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
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
          bg-white
          border-r border-slate-200
          shadow-2xl shadow-slate-200/50
          ${isMobile ? 'lg:hidden' : 'hidden lg:block'}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 h-[69px]">
          <div className="flex items-center gap-3">
            <HamburgerMenu
              isOpen={isMobile ? isOpen : !isCollapsed}
              onClick={isMobile ? onClose : () => setIsCollapsed(!isCollapsed)}
              isMobile={isMobile}
            />
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Link href="/" className="flex flex-col">
                  <span className="text-slate-900 font-bold text-lg tracking-tight">
                    Student Portal
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {(!isCollapsed || isMobile) && (
          <div className="flex-1 overflow-y-auto py-2">
            {/* Learning Section */}
            <SectionHeader title="Learning" color="#6366f1" />
            <div className="space-y-1">
              {/* Practice Dashboard with Sub-menu */}
              <div>
                <div
                  className={`
                    flex items-center justify-between gap-3 px-4 py-3
                    transition-all duration-300 cursor-pointer
                    ${isActive('/dashboard') 
                      ? 'bg-slate-100 text-indigo-900' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                  onClick={() => setIsPracticeMenuOpen(!isPracticeMenuOpen)}
                >
                  <div className="flex items-center gap-3">
                    <HomeIcon className={`w-5 h-5 ${isActive('/dashboard') ? 'text-indigo-600' : ''}`} />
                    <span className="font-medium text-sm">Practice Dashboard</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isPracticeMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {isPracticeMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pr-4 py-1 space-y-1">
                        <div
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg
                            transition-all duration-200 cursor-pointer text-sm
                            ${activeTab === 'practice'
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-500 hover:bg-slate-100'
                            }
                          `}
                          onClick={() => handleSubMenuClick('practice')}
                        >
                          Practice Setup
                        </div>
                        <div
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg
                            transition-all duration-200 cursor-pointer text-sm
                            ${activeTab === 'saved'
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-500 hover:bg-slate-100'
                            }
                          `}
                          onClick={() => handleSubMenuClick('saved')}
                        >
                          Saved Sessions
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavItem
                icon={BookOpenIcon}
                label="Revision Hub"
                href="/revision-hub"
                isActive={isActive('/revision-hub')}
                onClick={isMobile ? onClose : undefined}
              />
              <NavItem
                icon={ClockIcon}
                label="Mock Tests"
                href="/mock-tests"
                isActive={isActive('/mock-tests')}
                onClick={isMobile ? onClose : undefined}
              />
            </div>

            {/* Management Section */}
            <SectionHeader title="Management" color="#10b981" />
            <div className="space-y-1">
              <NavItem
                icon={FolderOpenIcon}
                label="Content Library"
                href="/my-content"
                isActive={isActive('/my-content')}
                onClick={isMobile ? onClose : undefined}
              />
              <NavItem
                icon={CalendarIcon}
                label="Study Plans"
                href="/my-plans"
                isActive={isActive('/my-plans')}
                onClick={isMobile ? onClose : undefined}
              />
            </div>

            {/* Settings Section */}
            <SectionHeader title="Settings" color="#f59e0b" />
            <div className="space-y-1">
              <NavItem
                icon={CogIcon}
                label="Preferences"
                href="/settings"
                isActive={isActive('/settings')}
                onClick={isMobile ? onClose : undefined}
              />
            </div>
          </div>
        )}

        {/* Collapsed Icons Only */}
        {isCollapsed && !isMobile && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col items-center gap-2">
              {[
                { icon: HomeIcon, href: '/dashboard', active: isActive('/dashboard') },
                { icon: BookOpenIcon, href: '/revision-hub', active: isActive('/revision-hub') },
                { icon: ClockIcon, href: '/mock-tests', active: isActive('/mock-tests') },
                { icon: FolderOpenIcon, href: '/my-content', active: isActive('/my-content') },
                { icon: CalendarIcon, href: '/my-plans', active: isActive('/my-plans') },
                { icon: CogIcon, href: '/settings', active: isActive('/settings') },
              ].map((item, index) => (
                <Link key={index} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      p-3 rounded-xl transition-all duration-300
                      ${item.active 
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-md shadow-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-slate-200">
            <div className="text-center">
              <span className="text-xs text-slate-400">Student Portal v2.0</span>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}