'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Timer, AlertTriangle, ThumbsDown } from 'lucide-react'

export interface MatrixCounts {
  strengths: number
  needsSpeed: number
  carelessErrors: number
  weaknesses: number
}

export type QuadrantKey = 'strengths' | 'needsSpeed' | 'carelessErrors' | 'weaknesses'

export interface StrategicPerformanceMatrixProps {
  matrixCounts: MatrixCounts
  onQuadrantClick?: (quadrant: QuadrantKey) => void
  className?: string
}

const quadrantConfig = [
  {
    key: 'strengths' as QuadrantKey,
    title: 'Strengths',
    subtitle: 'Correct & Fast',
    icon: <ShieldCheck className="w-6 h-6" />,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    ring: 'ring-green-200 dark:ring-green-800'
  },
  {
    key: 'needsSpeed' as QuadrantKey,
    title: 'Needs Speed',
    subtitle: 'Correct & Slow',
    icon: <Timer className="w-6 h-6" />,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    ring: 'ring-yellow-200 dark:ring-yellow-800'
  },
  {
    key: 'carelessErrors' as QuadrantKey,
    title: 'Careless Errors',
    subtitle: 'Incorrect & Fast',
    icon: <AlertTriangle className="w-6 h-6" />,
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    ring: 'ring-orange-200 dark:ring-orange-800'
  },
  {
    key: 'weaknesses' as QuadrantKey,
    title: 'Weaknesses',
    subtitle: 'Incorrect & Slow',
    icon: <ThumbsDown className="w-6 h-6" />,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-200 dark:ring-red-800'
  }
] as const

export default function StrategicPerformanceMatrix({
  matrixCounts,
  onQuadrantClick,
  className = ''
}: StrategicPerformanceMatrixProps) {
  const getCountFor = (key: QuadrantKey) => {
    switch (key) {
      case 'strengths': return matrixCounts.strengths
      case 'needsSpeed': return matrixCounts.needsSpeed
      case 'carelessErrors': return matrixCounts.carelessErrors
      case 'weaknesses': return matrixCounts.weaknesses
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`mb-6 ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-bl from-slate-100 to-transparent dark:from-white/5 pointer-events-none" />
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Strategic Performance Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Click a quadrant to explore questions by performance category
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quadrantConfig.map((q, idx) => {
              const count = getCountFor(q.key)
              return (
                <motion.button
                  key={q.key}
                  type="button"
                  onClick={() => onQuadrantClick?.(q.key)}
                  className={`group relative w-full overflow-hidden rounded-lg border ${q.border} ${q.bg} transition-all duration-200 focus:outline-none focus-visible:ring-2 ${q.ring}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.06 }}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${q.ring} ${q.bg}`}>
                      <span className={q.text}>{q.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-semibold ${q.text}`}>{q.title}</div>
                      <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{q.subtitle}</div>
                      <div className={`mt-2 text-3xl font-bold tracking-tight ${q.text}`}>{count}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">questions</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
