'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowLeftIcon, TrashIcon, BookmarkIcon } from '@heroicons/react/24/outline'

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
}

export default function ExitSessionModal({
  isOpen,
  onClose,
  onExitWithoutSaving,
  onSaveAndExit,
  currentProgress
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

          {/* Progress Summary */}
          {currentProgress && (
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentProgress.answered}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Answered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {currentProgress.total}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentProgress.timeSpent}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Time Spent</div>
                </div>
              </div>
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
                {/* Save & Exit Option */}
                <motion.button
                  onClick={() => {
                    setSessionName(getDefaultSessionName())
                    setShowSavePrompt(true)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <BookmarkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      Save & Exit
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Save your progress and resume later
                    </div>
                  </div>
                </motion.button>

                {/* Exit Without Saving Option */}
                <motion.button
                  onClick={handleExitWithoutSaving}
                  className="w-full flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      Exit without Saving
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Discard all progress and return to dashboard
                    </div>
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
