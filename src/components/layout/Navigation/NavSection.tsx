'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface NavSectionProps {
  title: string
  children: React.ReactNode
  isCollapsed: boolean
}

export default function NavSection({ title, children, isCollapsed }: NavSectionProps) {
  return (
    <div>
      {!isCollapsed && (
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {title}
        </motion.h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}