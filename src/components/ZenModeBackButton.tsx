'use client'

import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface ZenModeBackButtonProps {
  onClick: () => void
  className?: string
}

export default function ZenModeBackButton({ onClick, className = '' }: ZenModeBackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ArrowLeftIcon className="w-5 h-5" />
    </motion.button>
  )
}
