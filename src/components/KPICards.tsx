'use client'

import React from 'react'
import { ListChecks, CheckCircle, Target, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export interface KPIMetrics {
  score: number
  attempted: number
  accuracy: number // percentage
  percentage: number // percentage
  timeTaken: string // MM:SS
}

export interface KPICardsProps {
  metrics: KPIMetrics
  className?: string
}

const formatPercent = (value: number) => `${Math.round(value)}%`

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  accent: 'amber' | 'cyan' | 'emerald' | 'violet' | 'blue'
}

const StatCard = ({ icon, value, label, accent }: StatCardProps) => {
  const accentMap: Record<StatCardProps['accent'], { bg: string; text: string; ring: string }> = {
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-800' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-200 dark:ring-cyan-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-800' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-tr from-slate-100 to-transparent dark:from-white/5 pointer-events-none" />

      <div className="p-6 md:p-7">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${accentMap[accent].ring} ${accentMap[accent].bg}`}>
          <span className={`w-5 h-5 ${accentMap[accent].text}`}>{icon}</span>
        </div>
        <div className="mt-4">
          <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
          <div className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function KPICards({ metrics, className }: KPICardsProps) {
  const items: StatCardProps[] = [
    { icon: <ListChecks className="w-6 h-6" />, value: metrics.attempted, label: 'Attempted', accent: 'cyan' },
    { icon: <CheckCircle className="w-6 h-6" />, value: formatPercent(metrics.accuracy), label: 'Accuracy', accent: 'emerald' },
    { icon: <Target className="w-6 h-6" />, value: formatPercent(metrics.percentage), label: 'Percentage', accent: 'violet' },
    { icon: <Clock className="w-6 h-6" />, value: metrics.timeTaken, label: 'Time Taken', accent: 'blue' },
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-5 ${className || ''}`}>
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  )
}