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
      <div className="grid grid-cols-2 gap-4">
        {/* Row 1, Col 1: Answered */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{answeredCount}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Answered</span>
        </div>

        {/* Row 1, Col 2: Not Answered */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{notAnsweredCount}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Not Answered</span>
        </div>

        {/* Row 2, Col 1: Marked */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{markedCount}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Marked</span>
        </div>

        {/* Row 2, Col 2: Not Visited */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-400 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{notVisitedCount}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Not Visited</span>
        </div>

        {/* Row 3, Col 1: Marked and Answered (spans full width if needed) */}
        <div className="flex items-center space-x-3 col-span-2">
          <div className="relative w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{markedAndAnsweredCount}</span>
            {/* Green dot indicator - larger and no border */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Marked and Answered</span>
        </div>
      </div>
    </motion.div>
  )
}
