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
      className={`p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Column 1: Answered, Marked, Marked and Answered */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-green-500 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-white">{answeredCount}</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Answered</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-purple-500 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-white">{markedCount}</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Marked</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-purple-500 rounded flex items-center justify-center relative">
              <span className="text-sm font-bold text-white">{markedAndAnsweredCount}</span>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Marked and Answered</span>
          </div>
        </div>
        
        {/* Column 2: Not Visited, Not Answered */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-slate-400 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-white">{notVisitedCount}</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Not Visited</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-red-500 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-white">{notAnsweredCount}</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Not Answered</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
