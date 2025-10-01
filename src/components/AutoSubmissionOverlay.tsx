'use client'

import { motion } from 'framer-motion'

interface AutoSubmissionOverlayProps {
  isVisible: boolean
}

export default function AutoSubmissionOverlay({ isVisible }: AutoSubmissionOverlayProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full mx-4 text-center"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Time's Up Icon */}
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
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
          </motion.div>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Time's Up!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your test time has expired. Submitting your test automatically...
        </p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Processing your submission...
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Please wait:</strong> Do not close this window or navigate away. 
            Your test is being submitted and you will be redirected to your results shortly.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
