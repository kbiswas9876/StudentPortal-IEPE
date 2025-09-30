'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModeSelector from './ModeSelector'
import { PracticeMode, ChapterConfiguration } from '@/types/practice'

interface ChapterConfigPanelProps {
  chapterName: string
  questionCount: number
  config: ChapterConfiguration
  onConfigChange: (config: ChapterConfiguration) => void
}

export default function ChapterConfigPanel({
  chapterName,
  questionCount,
  config,
  onConfigChange
}: ChapterConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<ChapterConfiguration>(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleModeChange = (mode: PracticeMode) => {
    const newConfig = { ...localConfig, mode, values: {} }
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleRangeChange = (field: 'start' | 'end', value: number) => {
    const newValues = {
      ...localConfig.values,
      [field]: Math.max(1, Math.min(questionCount, value))
    }
    const newConfig = { ...localConfig, values: newValues }
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleQuantityChange = (count: number) => {
    const newValues = {
      ...localConfig.values,
      count: Math.max(1, Math.min(questionCount, count))
    }
    const newConfig = { ...localConfig, values: newValues }
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  }

  const getSelectedCount = () => {
    if (localConfig.mode === 'range') {
      const start = localConfig.values.start || 1
      const end = localConfig.values.end || questionCount
      return Math.max(0, end - start + 1)
    } else {
      return localConfig.values.count || 1
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Configure Questions for {chapterName}
          </h4>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {getSelectedCount()} of {questionCount} questions selected
          </span>
        </div>

        <ModeSelector
          mode={localConfig.mode}
          onChange={handleModeChange}
        />

        <AnimatePresence mode="wait">
          {localConfig.mode === 'range' ? (
            <motion.div
              key="range"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Start Question
                </label>
                <input
                  type="number"
                  min="1"
                  max={questionCount}
                  value={localConfig.values.start || 1}
                  onChange={(e) => handleRangeChange('start', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  End Question
                </label>
                <input
                  type="number"
                  min="1"
                  max={questionCount}
                  value={localConfig.values.end || questionCount}
                  onChange={(e) => handleRangeChange('end', parseInt(e.target.value) || questionCount)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quantity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max={questionCount}
                value={localConfig.values.count || 1}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
