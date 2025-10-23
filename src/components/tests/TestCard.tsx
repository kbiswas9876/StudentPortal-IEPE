'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type Test = {
  id: number
  name: string
  description: string | null
  start_time: string
  end_time: string | null
  status: 'scheduled' | 'live' | 'completed'
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  total_questions: number
}

interface TestCardProps {
  test: Test & { userScore?: number; resultId?: number }
  type: 'upcoming' | 'live' | 'completed'
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
  index: number
}

export default function TestCard({ test, type, onStartTest, onViewResult, index }: TestCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    if (type === 'upcoming') {
      const updateCountdown = () => {
        const now = new Date().getTime()
        const startTime = new Date(test.start_time).getTime()
        const difference = startTime - now

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m`)
          } else {
            setTimeRemaining(`${minutes}m`)
          }
        } else {
          setTimeRemaining('Starting now')
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [test.start_time, type])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = () => {
    switch (type) {
      case 'upcoming':
        return 'text-blue-600 dark:text-blue-400'
      case 'live':
        return 'text-green-600 dark:text-green-400'
      case 'completed':
        return 'text-slate-600 dark:text-slate-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getStatusIcon = () => {
    switch (type) {
      case 'upcoming':
        return <ClockIcon className="h-5 w-5" />
      case 'live':
        return <PlayIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return null
    }
  }

  const getActionButton = () => {
    switch (type) {
      case 'upcoming':
        return (
          <button
            disabled
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed text-sm"
          >
            {timeRemaining === 'Starting now' ? 'Starting Soon' : 'Coming Soon'}
          </button>
        )
      case 'live':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartTest(test.id)}
            className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold transition-all duration-200 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm"
          >
            Start Test
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm"
          >
            View Results
          </motion.button>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
    >
      {/* Live Status Badge */}
      {type === 'live' && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </motion.div>
        </div>
      )}

      <div className="p-6">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {test.name}
            </h3>
            {test.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {test.description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              type === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
              type === 'live' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {type === 'upcoming' && timeRemaining}
              {type === 'live' && 'Available'}
              {type === 'completed' && test.userScore !== undefined && `${test.userScore.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Key Metrics - Admin Panel Style */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{test.total_questions}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Questions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatTime(test.total_time_minutes)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l-2.83 2.83M6 7l2.83 2.83m6-2.83a5.002 5.002 0 01-9.002 0" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">+{test.marks_per_correct} / {test.negative_marks_per_incorrect || 0}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Marking</div>
            </div>
          </div>
        </div>

        {/* Time Information - Admin Panel Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-slate-500 dark:text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 01-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {type === 'upcoming' ? 'Starts' : type === 'live' ? 'Started' : 'Completed'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'upcoming' ? new Date(test.start_time).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true 
                }) : 
                type === 'live' ? 'Now' :
                'Finished'}
              </div>
            </div>
          </div>
          
          {/* Only render "Ends" section if end_time is not null (not perpetual) */}
          {test.end_time && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-slate-500 dark:text-slate-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Ends</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {type === 'upcoming' ? new Date(test.end_time).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  }) : 
                  type === 'live' ? 'Ongoing' :
                  'Completed'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {getActionButton()}
      </div>
    </motion.div>
  )
}
