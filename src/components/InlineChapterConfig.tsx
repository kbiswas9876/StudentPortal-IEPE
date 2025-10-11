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
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center space-x-2 ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-600"
    >
      {/* Mode Selection - Professional Compact Design */}
      <div className="flex bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-600">
        <button
          onClick={() => onConfigChange({ ...config, mode: 'quantity' })}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            config.mode === 'quantity'
              ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          Quantity
        </button>
        <button
          onClick={() => onConfigChange({ ...config, mode: 'range' })}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            config.mode === 'range'
              ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          Range
        </button>
      </div>

      {/* Input Field - Enhanced Professional Design */}
      <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
        {config.mode === 'quantity' ? (
          <motion.div
            key="quantity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center space-x-1.5"
          >
            <input
              type="number"
              min="1"
              max={questionCount}
              value={config.values.count || 1}
              onChange={(e) => onConfigChange({
                ...config,
                values: { count: Math.min(parseInt(e.target.value) || 1, questionCount) }
              })}
              className="w-12 px-1.5 py-1 text-xs text-center font-semibold border border-slate-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              / {questionCount}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="range"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center space-x-1"
          >
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
              className="w-10 px-1 py-1 text-xs text-center font-semibold border border-slate-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">-</span>
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
              className="w-10 px-1 py-1 text-xs text-center font-semibold border border-slate-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
