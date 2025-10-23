'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {  ChartBarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline'

interface SectionalStats {
  total: number
  correct: number
  incorrect: number
  skipped: number
  accuracy: number
  avgTime: number
}

interface SectionalPerformanceProps {
  sectionalPerformance: Record<string, SectionalStats>
}

export default function SectionalPerformance({ sectionalPerformance }: SectionalPerformanceProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 dark:text-green-400'
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (accuracy >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500'
    if (accuracy >= 60) return 'bg-yellow-500'
    if (accuracy >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Sort chapters by accuracy (lowest first - need most attention)
  const sortedChapters = Object.entries(sectionalPerformance).sort((a, b) => a[1].accuracy - b[1].accuracy)

  if (sortedChapters.length === 0) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          No sectional data available for this test.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Performance by Chapter
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Chapters are sorted by accuracy (lowest first) - focus on the topics at the top for maximum improvement
        </p>
      </div>

      {sortedChapters.map(([chapter, stats], index) => (
        <motion.div
          key={chapter}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
        >
          {/* Chapter Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {chapter}
              </h4>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span>{stats.total} questions</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatTime(stats.avgTime)} avg
                </span>
              </div>
            </div>
            
            {/* Accuracy Badge */}
            <div className={`text-right ${getAccuracyColor(stats.accuracy)}`}>
              <div className="text-2xl font-bold">
                {stats.accuracy.toFixed(1)}%
              </div>
              <div className="text-xs opacity-75">Accuracy</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-lg font-bold">{stats.correct}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Correct</div>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
                <XCircleIcon className="h-4 w-4" />
                <span className="text-lg font-bold">{stats.incorrect}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Incorrect</div>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 mb-1">
                <MinusCircleIcon className="h-4 w-4" />
                <span className="text-lg font-bold">{stats.skipped}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Skipped</div>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div className="relative">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Progress</span>
              <span>{stats.correct} / {stats.total}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.accuracy}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                className={`h-full ${getAccuracyBgColor(stats.accuracy)} rounded-full`}
              />
            </div>
          </div>

          {/* Performance Indicator */}
          {stats.accuracy < 50 && (
            <div className="mt-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ This topic needs more attention
              </p>
            </div>
          )}
        </motion.div>
      ))}

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: sortedChapters.length * 0.05 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          💡 Pro Tip
        </h4>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Focus your revision on chapters with accuracy below 60%. Regular practice in weak areas can improve your overall score by 15-20%!
        </p>
      </motion.div>
    </div>
  )
}

