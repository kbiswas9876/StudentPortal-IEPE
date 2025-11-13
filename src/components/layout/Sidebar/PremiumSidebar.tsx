'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/lib/sidebar-context'
import {
  HomeIcon,
  BookOpenIcon,
  ClockIcon,
  FolderOpenIcon,
  CalendarIcon,
  CogIcon,
  ChevronLeftIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

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
          flex items-center gap-3 px-4 py-3 mx-3 rounded-xl
          transition-all duration-300 cursor-pointer
          ${isActive 
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 text-indigo-900 shadow-md shadow-indigo-100' 
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

export default function PremiumSidebar({ isOpen, onClose, isMobile = false }: PremiumSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname?.startsWith(path) || false
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
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              {/* Logo */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Bars3Icon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md opacity-30 -z-10" />
              </div>

              {/* Title */}
              <Link href="/" className="flex flex-col">
                <span className="text-slate-900 font-bold text-lg tracking-tight">
                  Student Portal
                </span>
                <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              </Link>
            </motion.div>
          )}

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isMobile ? onClose : () => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {isMobile ? (
              <XMarkIcon className="w-5 h-5 text-slate-600" />
            ) : (
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        {(!isCollapsed || isMobile) && (
          <div className="flex-1 overflow-y-auto py-2">
            {/* Learning Section */}
            <SectionHeader title="Learning" color="#6366f1" />
            <div className="space-y-1">
              <NavItem
                icon={HomeIcon}
                label="Practice Dashboard"
                href="/dashboard"
                isActive={isActive('/dashboard')}
                onClick={isMobile ? onClose : undefined}
              />
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
