'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowLeftIcon, TrashIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import StatusLegend from './StatusLegend'

interface ExitSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onExitWithoutSaving: () => void
  onSaveAndExit: (sessionName: string) => void
  currentProgress?: {
    answered: number
    total: number
    timeSpent: string
  }
  statusCounts?: {
    answeredCount: number
    notAnsweredCount: number
    notVisitedCount: number
    markedCount: number
    markedAndAnsweredCount: number
    bookmarkedCount: number
  }
}

export default function ExitSessionModal({
  isOpen,
  onClose,
  onExitWithoutSaving,
  onSaveAndExit,
  currentProgress,
  statusCounts
}: ExitSessionModalProps) {
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAndExit = async () => {
    if (!sessionName.trim()) return
    
    setIsSaving(true)
    try {
      await onSaveAndExit(sessionName.trim())
    } finally {
      setIsSaving(false)
    }
  }

  const handleExitWithoutSaving = () => {
    onExitWithoutSaving()
  }

  const handleClose = () => {
    setShowSavePrompt(false)
    setSessionName('')
    onClose()
  }

  // Generate default session name
  const getDefaultSessionName = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    return `Practice Session - ${dateStr}`
  }


  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <ArrowLeftIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Exit Practice Session
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  What would you like to do with your current session?
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Exact Status Legend Component */}
          {statusCounts && (
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">
                Question Status Breakdown
              </h4>
              <StatusLegend
                answeredCount={statusCounts.answeredCount}
                notAnsweredCount={statusCounts.notAnsweredCount}
                notVisitedCount={statusCounts.notVisitedCount}
                markedCount={statusCounts.markedCount}
                markedAndAnsweredCount={statusCounts.markedAndAnsweredCount}
                bookmarkedCount={statusCounts.bookmarkedCount}
                className="mt-0"
              />
            </div>
          )}

          {/* Save Prompt */}
          {showSavePrompt ? (
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={getDefaultSessionName()}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSavePrompt(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndExit}
                  disabled={!sessionName.trim() || isSaving}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="w-4 h-4" />
                      <span>Save & Exit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Main Options */
            <div className="p-6">
              <div className="space-y-3">
                {/* Save & Exit Option - Premium Design */}
                <motion.button
                  onClick={() => {
                    setSessionName(getDefaultSessionName())
                    setShowSavePrompt(true)
                  }}
                  className="w-full flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookmarkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-white">
                      Save & Exit
                    </div>
                    <div className="text-sm text-blue-100">
                      Save your progress and resume later
                    </div>
                  </div>
                  <div className="text-white/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>

                {/* Exit Without Saving Option - Premium Design */}
                <motion.button
                  onClick={handleExitWithoutSaving}
                  className="w-full flex items-center space-x-4 p-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrashIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-white">
                      Exit without Saving
                    </div>
                    <div className="text-sm text-red-100">
                      Discard all progress and return to dashboard
                    </div>
                  </div>
                  <div className="text-white/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              </div>

              {/* Cancel Button */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
