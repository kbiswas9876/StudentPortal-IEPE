'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChapterConfiguration } from '@/types/practice'

interface DynamicConfigPanelProps {
  bookCode: string | null
  chapterName: string | null
  questionCount: number
  config: ChapterConfiguration | null
  onConfigChange: (config: ChapterConfiguration) => void
}

export default function DynamicConfigPanel({
  bookCode,
  chapterName,
  questionCount,
  config,
  onConfigChange
}: DynamicConfigPanelProps) {
  if (!bookCode || !chapterName || !config) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-lg"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Select a Chapter
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Choose a chapter from the left to configure your practice session
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-lg"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Chapter Configuration
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure how you want to practice <strong>{chapterName}</strong>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          {questionCount} questions available
        </p>
      </div>

        <div className="space-y-3">
        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Selection Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onConfigChange({ ...config, mode: 'quantity' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                config.mode === 'quantity'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Quantity
            </button>
            <button
              onClick={() => onConfigChange({ ...config, mode: 'range' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                config.mode === 'range'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Range
            </button>
          </div>
        </div>

        {/* Configuration Inputs */}
        <AnimatePresence mode="wait">
          {config.mode === 'quantity' ? (
            <motion.div
              key="quantity"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max={questionCount}
                value={config.values.count || 1}
                onChange={(e) => onConfigChange({
                  ...config,
                  values: { count: Math.min(parseInt(e.target.value) || 1, questionCount) }
                })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maximum: {questionCount} questions
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="range"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Question
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={questionCount}
                    value={config.values.start || 1}
                    onChange={(e) => onConfigChange({
                      ...config,
                      values: { 
                        start: Math.min(parseInt(e.target.value) || 1, questionCount),
                        end: config.values.end || 1
                      }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Question
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={questionCount}
                    value={config.values.end || 1}
                    onChange={(e) => onConfigChange({
                      ...config,
                      values: { 
                        start: config.values.start || 1,
                        end: Math.min(parseInt(e.target.value) || 1, questionCount)
                      }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Range: {Math.max(0, (config.values.end || 1) - (config.values.start || 1) + 1)} questions
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Summary */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Configuration Summary
          </h4>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {config.mode === 'quantity' ? (
              <p>You will practice <strong>{config.values.count || 1}</strong> questions from {chapterName}</p>
            ) : (
              <p>You will practice questions <strong>{config.values.start || 1}</strong> to <strong>{config.values.end || 1}</strong> from {chapterName}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
