'use client'

import { motion } from 'framer-motion'
import { PracticeMode } from '@/types/practice'

interface ModeSelectorProps {
  mode: PracticeMode
  onChange: (mode: PracticeMode) => void
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex">
      <motion.button
        onClick={() => onChange('range')}
        className={`relative flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          mode === 'range'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {mode === 'range' && (
          <motion.div
            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-sm"
            layoutId="activeMode"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">Range</span>
      </motion.button>
      
      <motion.button
        onClick={() => onChange('quantity')}
        className={`relative flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          mode === 'quantity'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {mode === 'quantity' && (
          <motion.div
            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-sm"
            layoutId="activeMode"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">Quantity</span>
      </motion.button>
    </div>
  )
}
