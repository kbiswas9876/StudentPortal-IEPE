'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface AutoSubmissionOverlayProps {
  isVisible: boolean
}

export default function AutoSubmissionOverlay({ isVisible }: AutoSubmissionOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md mx-4 text-center"
          >
            {/* Time's up icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Time's up!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Submitting your test...
            </p>

            {/* Loading spinner */}
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
