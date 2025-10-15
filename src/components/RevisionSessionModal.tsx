'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Clock, Shuffle, BookOpen, AlertTriangle, XCircle } from 'lucide-react'

interface ChapterData {
  name: string
  count: number
}

interface RevisionSessionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedChapters: string[]
  chapters: ChapterData[]
  onStartSession: (config: SessionConfig) => void
}

interface SessionConfig {
  questionScope: 'all' | 'random'
  questionCount?: number
  testMode: 'practice' | 'timed'
  timeLimit?: number
}

export default function RevisionSessionModal({
  isOpen,
  onClose,
  selectedChapters,
  chapters,
  onStartSession
}: RevisionSessionModalProps) {
  const [questionScope, setQuestionScope] = useState<'all' | 'random'>('all')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [testMode, setTestMode] = useState<'practice' | 'timed'>('practice')
  const [timeLimit, setTimeLimit] = useState<number>(60)
  
  // Enhanced error handling state
  const [modalError, setModalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate total questions from selected chapters
  const totalQuestions = selectedChapters.reduce((total, chapterName) => {
    const chapter = chapters.find(c => c.name === chapterName)
    return total + (chapter?.count || 0)
  }, 0)

  // Update question count when total changes
  useEffect(() => {
    if (questionCount > totalQuestions) {
      setQuestionCount(Math.min(10, totalQuestions))
    }
  }, [totalQuestions, questionCount])

  const handleStartSession = async () => {
    try {
      setIsLoading(true)
      setModalError(null) // Clear previous errors
      
      // Validate before proceeding
      if (totalQuestions === 0) {
        throw new Error('Please select at least one chapter with questions to start your revision session.')
      }
      
      if (questionScope === 'random' && questionCount <= 0) {
        throw new Error('Please select at least one question for random practice.')
      }
      
      if (testMode === 'timed' && timeLimit <= 0) {
        throw new Error('Please set a valid time limit for timed practice.')
      }
      
      const config: SessionConfig = {
        questionScope,
        testMode,
        ...(questionScope === 'random' && { questionCount }),
        ...(testMode === 'timed' && { timeLimit })
      }
      
      // Call the parent handler
      await onStartSession(config)
      
      // Success - close modal
      onClose()
    } catch (error) {
      setModalError(
        error instanceof Error 
          ? error.message 
          : 'Unable to start revision session. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectedChaptersData = selectedChapters.map(chapterName => 
    chapters.find(c => c.name === chapterName)
  ).filter(Boolean) as ChapterData[]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Start Revision Session
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure your practice session
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Error notification */}
              <AnimatePresence>
                {modalError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-4"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-800 text-sm font-medium">
                          {modalError}
                        </span>
                        <button
                          onClick={() => setModalError(null)}
                          className="ml-auto text-red-600 hover:text-red-800"
                          aria-label="Dismiss error"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Session Scope Confirmation */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" strokeWidth={2.5} />
                  Selected Chapters
                </h3>
                <div className="space-y-2">
                  {selectedChaptersData.map((chapter) => (
                    <div key={chapter.name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{chapter.name}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{chapter.count} questions</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Total Questions:</span>
                    <span className="text-blue-600 dark:text-blue-400">{totalQuestions}</span>
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Question Scope
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="questionScope"
                      value="all"
                      checked={questionScope === 'all'}
                      onChange={(e) => setQuestionScope(e.target.value as 'all')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Practice all {totalQuestions} questions
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="questionScope"
                      value="random"
                      checked={questionScope === 'random'}
                      onChange={(e) => setQuestionScope(e.target.value as 'random')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Practice</span>
                      <input
                        type="number"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Math.min(parseInt(e.target.value) || 1, totalQuestions))}
                        min="1"
                        max={totalQuestions}
                        disabled={questionScope !== 'random'}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">random questions</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Test Mode Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Test Mode
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="testMode"
                      value="practice"
                      checked={testMode === 'practice'}
                      onChange={(e) => setTestMode(e.target.value as 'practice')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Practice Mode (untimed)</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="testMode"
                      value="timed"
                      checked={testMode === 'timed'}
                      onChange={(e) => setTestMode(e.target.value as 'timed')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Timed Mode</span>
                        {testMode === 'timed' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={timeLimit}
                              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                              min="1"
                              max="300"
                              className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={!isLoading && !modalError && totalQuestions > 0 ? { scale: 1.02 } : {}}
                  whileTap={!isLoading && !modalError && totalQuestions > 0 ? { scale: 0.98 } : {}}
                  onClick={handleStartSession}
                  disabled={isLoading || !!modalError || totalQuestions === 0}
                  className={`
                    px-6 py-2 font-semibold text-sm rounded-lg transition-all flex items-center gap-2
                    ${isLoading || modalError || totalQuestions === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" strokeWidth={2.5} />
                      Begin Session
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
