'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
}

export default function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  isMobile = false
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      {/* Logo/Toggle Combined */}
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleCollapse}
          className="w-10 h-10 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 group/icon"
          title={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.svg 
            className="w-5 h-5" 
            viewBox="0 0 20 20" 
            fill="none"
            animate={{ rotate: isCollapsed ? 90 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <rect x="2" y="4" width="16" height="2" fill="currentColor" rx="1" className="text-slate-800 group-hover/icon:text-slate-900 transition-colors duration-200"/>
            <rect x="2" y="9" width="16" height="2" fill="currentColor" rx="1" className="text-slate-800 group-hover/icon:text-slate-900 transition-colors duration-200"/>
            <rect x="2" y="14" width="16" height="2" fill="currentColor" rx="1" className="text-slate-800 group-hover/icon:text-slate-900 transition-colors duration-200"/>
          </motion.svg>
        </motion.button>

        {/* Logo Text */}
        <Link 
          href="/" 
          className="group"
        >
          <motion.span
            animate={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto'
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent overflow-hidden whitespace-nowrap"
          >
            Student Portal
          </motion.span>
        </Link>
      </div>
    </div>
  )
}