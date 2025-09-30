'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SegmentedControl from './SegmentedControl'

interface FinalConfigurationPanelProps {
  questionOrder: 'shuffle' | 'interleaved' | 'sequential'
  testMode: 'practice' | 'timed'
  timeLimitInMinutes: number
  onQuestionOrderChange: (order: 'shuffle' | 'interleaved' | 'sequential') => void
  onTestModeChange: (mode: 'practice' | 'timed') => void
  onTimeLimitChange: (minutes: number) => void
}

export default function FinalConfigurationPanel({
  questionOrder,
  testMode,
  timeLimitInMinutes,
  onQuestionOrderChange,
  onTestModeChange,
  onTimeLimitChange
}: FinalConfigurationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const questionOrderOptions = [
    { value: 'shuffle', label: 'Shuffle All' },
    { value: 'interleaved', label: 'Interleaved' },
    { value: 'sequential', label: 'Sequential' }
  ]

  const testModeOptions = [
    { value: 'practice', label: 'Practice Mode' },
    { value: 'timed', label: 'Timed Mode' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Final Configuration
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <motion.svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Question Order Configuration */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Question Order
              </label>
              <SegmentedControl
                options={questionOrderOptions}
                value={questionOrder}
                onChange={(value) => onQuestionOrderChange(value as 'shuffle' | 'interleaved' | 'sequential')}
                className="w-full"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {questionOrder === 'shuffle' && 'Questions will be presented in random order'}
                {questionOrder === 'interleaved' && 'Questions will be mixed from different chapters'}
                {questionOrder === 'sequential' && 'Questions will be presented in book order'}
              </div>
            </div>

            {/* Test Mode Configuration */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Test Mode
              </label>
              <SegmentedControl
                options={testModeOptions}
                value={testMode}
                onChange={(value) => onTestModeChange(value as 'practice' | 'timed')}
                className="w-full"
              />
              
              {/* Conditional Time Input */}
              <AnimatePresence>
                {testMode === 'timed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={timeLimitInMinutes}
                      onChange={(e) => onTimeLimitChange(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="30"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Set the time limit for your practice session (1-300 minutes)
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Configuration Summary */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Session Summary
              </h4>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <div>• Question Order: {questionOrderOptions.find(opt => opt.value === questionOrder)?.label}</div>
                <div>• Test Mode: {testModeOptions.find(opt => opt.value === testMode)?.label}</div>
                {testMode === 'timed' && (
                  <div>• Time Limit: {timeLimitInMinutes} minutes</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
