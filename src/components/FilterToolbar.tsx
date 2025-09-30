'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface FilterToolbarProps {
  filter: 'all' | 'correct' | 'incorrect' | 'skipped'
  onFilterChange: (filter: 'all' | 'correct' | 'incorrect' | 'skipped') => void
  timeFilter: 'all' | 'fast' | 'slow'
  onTimeFilterChange: (timeFilter: 'all' | 'fast' | 'slow') => void
  peerAverages: Record<number, number>
}

export default function FilterToolbar({ 
  filter, 
  onFilterChange, 
  timeFilter, 
  onTimeFilterChange, 
  peerAverages 
}: FilterToolbarProps) {
  const filters = [
    { key: 'all' as const, label: 'Show All', icon: '📋' },
    { key: 'correct' as const, label: 'Correct', icon: '✅' },
    { key: 'incorrect' as const, label: 'Incorrect', icon: '❌' },
    { key: 'skipped' as const, label: 'Skipped', icon: '⏭️' }
  ]

  const timeFilters = [
    { key: 'all' as const, label: 'All Times', icon: '⏱️' },
    { key: 'fast' as const, label: 'Fast', icon: '⚡' },
    { key: 'slow' as const, label: 'Slow', icon: '🐌' }
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
        
        {/* Status Filters */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Filter by Status</h3>
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

        {/* Time Filters */}
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Filter by Time Performance</h3>
          <div className="flex flex-wrap gap-3">
            {timeFilters.map((timeFilterOption) => (
              <motion.button
                key={timeFilterOption.key}
                onClick={() => onTimeFilterChange(timeFilterOption.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeFilter === timeFilterOption.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{timeFilterOption.icon}</span>
                <span>{timeFilterOption.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
