'use client'

import { motion } from 'framer-motion'
import StatusLegend from './StatusLegend'

interface SubmissionConfirmationModalProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => void
  timeRemaining?: string
  statusCounts: {
    answeredCount: number
    notAnsweredCount: number
    notVisitedCount: number
    markedCount: number
    markedAndAnsweredCount: number
    bookmarkedCount: number
  }
  isSubmitting?: boolean
}

export default function SubmissionConfirmationModal({ 
  isOpen, 
  onCancel, 
  onSubmit, 
  timeRemaining,
  statusCounts,
  isSubmitting = false
}: SubmissionConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Submit Test?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to submit your test? This action cannot be undone.
          </p>
          {timeRemaining && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-orange-800 dark:text-orange-300 font-medium">
                ⏰ You still have <span className="font-bold">{timeRemaining}</span> remaining
              </p>
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 text-center">
            Your Progress Summary
          </h3>
          <StatusLegend
            answeredCount={statusCounts.answeredCount}
            notAnsweredCount={statusCounts.notAnsweredCount}
            notVisitedCount={statusCounts.notVisitedCount}
            markedCount={statusCounts.markedCount}
            markedAndAnsweredCount={statusCounts.markedAndAnsweredCount}
            bookmarkedCount={statusCounts.bookmarkedCount}
            className="border-2 border-slate-200 dark:border-slate-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {/* Cancel Button - Secondary */}
          <motion.button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
            <span>Cancel</span>
          </motion.button>

          {/* Submit Button - Primary Destructive */}
          <motion.button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span>Submit Test</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Warning Text */}
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-300 text-center">
            <strong>Warning:</strong> Once you submit, you cannot make any changes to your answers. 
            Make sure you have reviewed all questions before proceeding.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
