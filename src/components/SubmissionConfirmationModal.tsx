'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Submission Confirmation Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full mx-4">
              {/* Header */}
              <div className="p-6 text-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
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
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Submit Test?
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Are you sure you want to submit your test?
                </p>
                {timeRemaining && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    You still have {timeRemaining} remaining
                  </div>
                )}
              </div>

              {/* Status Legend */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Current Progress
                </h3>
                <StatusLegend
                  answeredCount={statusCounts.answeredCount}
                  notAnsweredCount={statusCounts.notAnsweredCount}
                  notVisitedCount={statusCounts.notVisitedCount}
                  markedCount={statusCounts.markedCount}
                  markedAndAnsweredCount={statusCounts.markedAndAnsweredCount}
                  bookmarkedCount={statusCounts.bookmarkedCount}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-3">
                <motion.button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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

                <motion.button
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
