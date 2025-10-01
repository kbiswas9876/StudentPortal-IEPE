'use client'

import { motion } from 'framer-motion'

interface PauseModalProps {
  isOpen: boolean
  onResume: () => void
  onExit: () => void
}

export default function PauseModal({ isOpen, onResume, onExit }: PauseModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full mx-4"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-orange-600 dark:text-orange-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Session Paused
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your practice session is currently paused. All timers have been stopped.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Resume Button - Primary */}
          <motion.button
            onClick={onResume}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Resume Session</span>
          </motion.button>

          {/* Exit Button - Secondary */}
          <motion.button
            onClick={onExit}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            <span>Exit Session</span>
          </motion.button>
        </div>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            <strong>Note:</strong> Your progress and answers are automatically saved. 
            You can safely pause and resume your session at any time.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
