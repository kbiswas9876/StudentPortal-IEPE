'use client'

import { motion } from 'framer-motion'
import '@/styles/TimerTypography.css'

interface TimerProps {
  sessionStartTime: number
  duration?: number // in minutes, optional for countdown mode
}

export default function Timer({ sessionStartTime, duration }: TimerProps) {
  return (
    <motion.div
      className="inline-flex items-center px-4 py-2 rounded-lg border transition-all duration-500 shadow-md bg-slate-100 dark:bg-slate-800"
    >
      <div className="flex items-center space-x-2">
        {/* Modern Stopwatch Icon */}
        <div className="relative">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex items-center">
          <span className="premium-timer medium primary">
            00:00
          </span>
          {duration && (
            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              /{duration}m
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}