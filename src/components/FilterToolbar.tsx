'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface FilterToolbarProps {
  filter: 'all' | 'correct' | 'incorrect' | 'skipped'
  onFilterChange: (filter: 'all' | 'correct' | 'incorrect' | 'skipped') => void
}

export default function FilterToolbar({ filter, onFilterChange }: FilterToolbarProps) {
  const filters = [
    { key: 'all' as const, label: 'Show All', icon: '📋' },
    { key: 'correct' as const, label: 'Correct', icon: '✅' },
    { key: 'incorrect' as const, label: 'Incorrect', icon: '❌' },
    { key: 'skipped' as const, label: 'Skipped', icon: '⏭️' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Filter Questions
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {filters.map((filterOption) => (
            <motion.button
              key={filterOption.key}
              onClick={() => onFilterChange(filterOption.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">{filterOption.icon}</span>
              <span>{filterOption.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
