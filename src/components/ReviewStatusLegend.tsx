'use client'

import { motion } from 'framer-motion'

interface ReviewStatusLegendProps {
  correctCount: number
  incorrectCount: number
  skippedCount: number
  className?: string
}

export default function ReviewStatusLegend({
  correctCount,
  incorrectCount,
  skippedCount,
  className = ""
}: ReviewStatusLegendProps) {
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
          <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm bg-green-500">
            <span className="text-sm font-extrabold text-white">{correctCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Correct</span>
        </div>

        {/* Incorrect */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm bg-red-500">
            <span className="text-sm font-extrabold text-white">{incorrectCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Incorrect</span>
        </div>

        {/* Skipped */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm bg-slate-400">
            <span className="text-sm font-extrabold text-white">{skippedCount}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">Skipped</span>
        </div>
      </div>
    </motion.div>
  )
}
