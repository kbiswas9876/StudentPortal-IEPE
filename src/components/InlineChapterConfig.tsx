'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChapterConfiguration } from '@/types/practice'

interface InlineChapterConfigProps {
  chapterName: string
  questionCount: number
  config: ChapterConfiguration
  onConfigChange: (config: ChapterConfiguration) => void
}

export default function InlineChapterConfig({
  chapterName,
  questionCount,
  config,
  onConfigChange
}: InlineChapterConfigProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-300 dark:border-slate-600 ml-8"
    >
      {/* Professional Two-Line Configuration Layout */}
      <div className="space-y-2.5">
        {/* Line 1: Label and Mode Selection */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Select Questions:
          </label>
          <div className="flex bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => onConfigChange({ ...config, mode: 'quantity' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                config.mode === 'quantity'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Quantity
            </button>
            <button
              onClick={() => onConfigChange({ ...config, mode: 'range' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                config.mode === 'range'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Range
            </button>
          </div>
        </div>

        {/* Line 2: Input Fields */}
        <div className="flex items-center">
          {config.mode === 'quantity' ? (
            <motion.div
              key="quantity"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg flex-1"
            >
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Number of Questions:
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
                className="w-16 px-2 py-1.5 text-sm text-center font-semibold border-2 border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                of {questionCount}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="range"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg flex-1"
            >
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Question Range:
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
                className="w-14 px-2 py-1.5 text-sm text-center font-semibold border-2 border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">to</span>
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
                className="w-14 px-2 py-1.5 text-sm text-center font-semibold border-2 border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
