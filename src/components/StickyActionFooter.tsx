'use client'

import { motion } from 'framer-motion'

interface StickyActionFooterProps {
  totalQuestions: number
  onStartSession: () => void
  disabled?: boolean
  loading?: boolean
}

export default function StickyActionFooter({
  totalQuestions,
  onStartSession,
  disabled = false,
  loading = false
}: StickyActionFooterProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-3 sm:hidden">
          {/* Total Questions Count - Mobile */}
          <div className="flex items-center justify-center space-x-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Questions:
            </div>
            <motion.div
              key={totalQuestions}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {totalQuestions}
            </motion.div>
          </div>

          {/* Start Session Button - Mobile */}
          <motion.button
            onClick={onStartSession}
            disabled={disabled || loading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              disabled || loading
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95'
            }`}
            whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Starting Session...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V6a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
                <span>Start Practice Session</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Total Questions Count - Desktop */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Questions Selected:
            </div>
            <motion.div
              key={totalQuestions}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-2xl font-bold text-slate-900 dark:text-slate-100"
            >
              {totalQuestions}
            </motion.div>
          </div>

          {/* Start Session Button - Desktop */}
          <motion.button
            onClick={onStartSession}
            disabled={disabled || loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
              disabled || loading
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Starting Session...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V6a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
                <span>Start Practice Session</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
