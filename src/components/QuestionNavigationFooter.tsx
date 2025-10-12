'use client'

import { motion } from 'framer-motion'

interface QuestionNavigationFooterProps {
  currentIndex: number
  totalQuestions: number
  filteredPosition?: number
  filteredTotal?: number
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}

export default function QuestionNavigationFooter({
  currentIndex,
  totalQuestions,
  filteredPosition,
  filteredTotal,
  onPrev,
  onNext,
  canPrev,
  canNext
}: QuestionNavigationFooterProps) {
  
  const displayPosition = filteredPosition !== undefined ? filteredPosition : currentIndex + 1
  const displayTotal = filteredTotal !== undefined ? filteredTotal : totalQuestions
  const progressPercentage = (displayPosition / displayTotal) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onPrev}
              disabled={!canPrev}
              className={`px-4 sm:px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 font-medium text-sm sm:text-base
                ${!canPrev
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                }
              `}
              whileHover={canPrev ? { scale: 1.02 } : {}}
              whileTap={canPrev ? { scale: 0.98 } : {}}
              aria-label="Previous question"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </motion.button>

            <motion.button
              onClick={onNext}
              disabled={!canNext}
              className={`px-4 sm:px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 font-medium text-sm sm:text-base
                ${!canNext
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                }
              `}
              whileHover={canNext ? { scale: 1.02 } : {}}
              whileTap={canNext ? { scale: 0.98 } : {}}
              aria-label="Next question"
              title="Next"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              {displayPosition} of {displayTotal}
            </span>
            <div className="w-24 sm:w-40 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
