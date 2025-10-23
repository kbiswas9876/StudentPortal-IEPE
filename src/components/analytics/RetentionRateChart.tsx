'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2 } from 'lucide-react'
import InformationalTooltip from './InformationalTooltip'

interface RetentionRateChartProps {
  retentionRate: number
  averageEaseFactor: number
}

export default function RetentionRateChart({ retentionRate, averageEaseFactor }: RetentionRateChartProps) {
  // Determine color based on retention rate
  const getColorClasses = (rate: number) => {
    if (rate >= 80) return {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      text: 'text-green-700 dark:text-green-300',
    }
    if (rate >= 60) return {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      text: 'text-blue-700 dark:text-blue-300',
    }
    if (rate >= 40) return {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
    }
    return {
      gradient: 'from-red-500 to-rose-500',
      bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
      text: 'text-red-700 dark:text-red-300',
    }
  }

  const colors = getColorClasses(retentionRate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Retention Rate
          </h3>
          <InformationalTooltip 
            content="This shows how well you remember your bookmarked questions over time. A high retention rate means you're successfully learning and retaining information. The percentage is calculated based on your review performance and ease factors. Aim for 80%+ for optimal learning!"
          />
        </div>
        <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-xl`}>
          <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center py-8">
        <div className="relative w-40 h-40">
          {/* Background Circle */}
          <svg className="transform -rotate-90 w-40 h-40">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * retentionRate) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: 440,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-color-${colors.gradient.split('-')[1]}-500`} />
                <stop offset="100%" className={`stop-color-${colors.gradient.split('-')[3]}-500`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className={`text-4xl font-black ${colors.text}`}
            >
              {retentionRate}%
            </motion.div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">retention</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className={`p-3 bg-gradient-to-r ${colors.bg} rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Avg. Ease Factor</span>
            </div>
            <span className={`font-bold text-sm ${colors.text}`}>{averageEaseFactor}</span>
          </div>
        </div>
        
        <p className="text-xs text-center text-slate-600 dark:text-slate-400 pt-2">
          {retentionRate >= 80 
            ? "Excellent! Your reviews are highly effective."
            : retentionRate >= 60
            ? "Good progress! Keep reviewing consistently."
            : retentionRate >= 40
            ? "You're learning! More practice will help."
            : "Focus on understanding before memorizing."}
        </p>
      </div>
    </motion.div>
  )
}

