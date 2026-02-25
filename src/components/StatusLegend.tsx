'use client'

import { motion } from 'framer-motion'

interface StatusLegendProps {
  answeredCount: number
  notAnsweredCount: number
  notVisitedCount: number
  markedCount: number
  markedAndAnsweredCount: number
  bookmarkedCount?: number
  className?: string
}

export default function StatusLegend({
  answeredCount,
  notAnsweredCount,
  notVisitedCount,
  // keep unused to match existing prop signature
  markedCount,
  markedAndAnsweredCount,
  bookmarkedCount = 0,
  className = ""
}: StatusLegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-5 bg-slate-50/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 ${className}`}
    >
      <div className="grid grid-cols-3 gap-3">
        {/* Correct */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-sm font-extrabold text-white">{answeredCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Correct</span>
        </div>

        {/* Incorrect */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-sm font-extrabold text-white">{notAnsweredCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Incorrect</span>
        </div>

        {/* Skipped */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-400 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-sm font-extrabold text-white">{notVisitedCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Skipped</span>
        </div>
      </div>
    </motion.div>
  )
}
