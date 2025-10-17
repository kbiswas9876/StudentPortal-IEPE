'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SolutionNavigationFooterProps {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
  currentIndex: number
  totalQuestions: number
  filteredPosition?: number
  filteredTotal?: number
}

const SolutionNavigationFooter: React.FC<SolutionNavigationFooterProps> = ({
  onPrev,
  onNext,
  canPrev,
  canNext,
  currentIndex,
  totalQuestions,
  filteredPosition,
  filteredTotal
}) => {
  const displayPosition = filteredPosition ?? (currentIndex + 1)
  const displayTotal = filteredTotal ?? totalQuestions
  const progressPercentage = (displayPosition / displayTotal) * 100

  return (
    <div className="actions-footer-wrapper">
      <div className="actions-footer-content">
        <div className="footer-left-zone">
          <motion.button 
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
              ${!canPrev 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 cursor-not-allowed' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
              }
            `}
            onClick={onPrev}
            disabled={!canPrev}
            whileHover={canPrev ? { scale: 1.02, y: -1 } : {}}
            whileTap={canPrev ? { scale: 0.98 } : {}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </motion.button>
        </div>
        
        <div className="footer-center-zone">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {displayPosition} of {displayTotal}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        
        <div className="footer-right-zone">
          <motion.button 
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
              ${!canNext 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl border border-blue-500'
              }
            `}
            onClick={onNext}
            disabled={!canNext}
            whileHover={canNext ? { scale: 1.02, y: -1 } : {}}
            whileTap={canNext ? { scale: 0.98 } : {}}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default SolutionNavigationFooter
