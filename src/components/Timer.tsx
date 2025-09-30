'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimerProps {
  sessionStartTime: number
  duration?: number // in minutes, optional for countdown mode
}

export default function Timer({ sessionStartTime, duration }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - sessionStartTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStartTime])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (!duration) return 'text-slate-700 dark:text-slate-300'

    const elapsedMinutes = elapsedTime / (1000 * 60)
    const remainingMinutes = duration - elapsedMinutes

    if (remainingMinutes <= 0) return 'text-red-600 dark:text-red-400'
    if (remainingMinutes <= 5) return 'text-red-500 dark:text-red-400'
    if (remainingMinutes <= 10) return 'text-amber-500 dark:text-amber-400'
    return 'text-slate-700 dark:text-slate-300'
  }

  const getTimerBgColor = () => {
    if (!duration) return 'bg-slate-100 dark:bg-slate-800'

    const elapsedMinutes = elapsedTime / (1000 * 60)
    const remainingMinutes = duration - elapsedMinutes

    if (remainingMinutes <= 0) return 'bg-red-100 dark:bg-red-900'
    if (remainingMinutes <= 5) return 'bg-red-50 dark:bg-red-900'
    if (remainingMinutes <= 10) return 'bg-amber-50 dark:bg-amber-900'
    return 'bg-slate-100 dark:bg-slate-800'
  }

  const displayTime = duration 
    ? formatTime(Math.max(0, duration * 60 * 1000 - elapsedTime))
    : formatTime(elapsedTime)

  return (
    <motion.div
      className={`inline-flex items-center px-6 py-3 rounded-xl border-2 transition-all duration-500 shadow-lg ${getTimerBgColor()}`}
      animate={{
        scale: duration && (duration * 60 * 1000 - elapsedTime) <= 5 * 60 * 1000 ? [1, 1.05, 1] : 1
      }}
      transition={{
        duration: 1,
        repeat: duration && (duration * 60 * 1000 - elapsedTime) <= 5 * 60 * 1000 ? Infinity : 0
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration && (
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <circle cx="12" cy="12" r="10" strokeDasharray="62.83" strokeDashoffset="0" />
              </svg>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className={`font-mono text-lg font-bold transition-colors duration-500 ${getTimerColor()}`}>
            {displayTime}
          </span>
          {duration && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              of {duration} minutes
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
