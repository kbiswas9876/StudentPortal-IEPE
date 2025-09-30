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
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center space-x-3 ml-4"
    >
      {/* Mode Selection */}
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-md p-0.5">
        <button
          onClick={() => onConfigChange({ ...config, mode: 'quantity' })}
          className={`px-2 py-1 text-xs font-medium rounded-sm transition-all ${
            config.mode === 'quantity'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Qty
        </button>
        <button
          onClick={() => onConfigChange({ ...config, mode: 'range' })}
          className={`px-2 py-1 text-xs font-medium rounded-sm transition-all ${
            config.mode === 'range'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Range
        </button>
      </div>

      {/* Input Field */}
      <div className="flex items-center space-x-2">
        {config.mode === 'quantity' ? (
          <motion.div
            key="quantity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center space-x-2"
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
              className="w-16 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              of {questionCount}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="range"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
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
              className="w-12 px-1 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">-</span>
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
              className="w-12 px-1 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
