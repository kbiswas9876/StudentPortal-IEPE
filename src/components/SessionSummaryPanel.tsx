'use client'

import { motion } from 'framer-motion'
import { PracticeSessionConfig } from '@/types/practice'

interface SessionSummaryPanelProps {
  selectedChaptersByBook: Record<string, Array<{ chapter: string; count: number }>>
  questionOrder: 'shuffle' | 'interleaved' | 'sequential'
  testMode: 'practice' | 'timed'
  timeLimitInMinutes: number
  estimatedDuration: string
}

export default function SessionSummaryPanel({
  selectedChaptersByBook,
  questionOrder,
  testMode,
  timeLimitInMinutes,
  estimatedDuration
}: SessionSummaryPanelProps) {
  const questionOrderLabels = {
    shuffle: 'Shuffle All',
    interleaved: 'Interleaved',
    sequential: 'Sequential'
  }

  const testModeLabels = {
    practice: 'Practice Mode',
    timed: 'Timed Mode'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-lg"
    >
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
        Session Summary
      </h3>

      {Object.keys(selectedChaptersByBook).length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Select chapters to see your session summary
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {/* Selected Chapters - Grouped by Book */}
          {Object.keys(selectedChaptersByBook).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected Chapters</h4>
              <div className="space-y-3">
                {Object.entries(selectedChaptersByBook).map(([bookCode, chapters]) => (
                  <div key={bookCode} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{bookCode}</span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {chapters.map(({ chapter, count }) => (
                        <div key={chapter} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">• {chapter}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {count} question{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Settings</h4>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Order:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{questionOrderLabels[questionOrder]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Mode:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{testModeLabels[testMode]}</span>
              </div>
              {testMode === 'timed' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Time Limit:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{timeLimitInMinutes} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Duration - Only show in Timed Mode */}
          {testMode === 'timed' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Time Configuration
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Time Limit:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-semibold">{timeLimitInMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Estimated Pace:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-semibold">{estimatedDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
