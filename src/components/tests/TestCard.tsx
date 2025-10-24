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
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-medium cursor-not-allowed text-sm"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
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
      className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-700 h-full flex flex-col overflow-hidden"
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

      {/* Premium Title Container - Layered Design */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-700">
        <div className="p-6 pb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {test.name}
          </h3>
          {test.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {test.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex flex-col flex-1">
        {/* Primary Stats Row - Questions & Duration */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{test.total_questions}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Questions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatTime(test.total_time_minutes)}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Duration</div>
            </div>
          </div>
        </div>

        {/* Marking Pills - Premium Design */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">+{test.marks_per_correct}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">{test.negative_marks_per_incorrect || 0}</span>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="border-t border-slate-100 dark:border-slate-700 mb-6"></div>

        {/* Clean Status Footer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              type === 'upcoming' ? 'text-blue-600 dark:text-blue-400' :
              type === 'live' ? 'text-green-600 dark:text-green-400' :
              'text-slate-600 dark:text-slate-400'
            }`}>
              {type === 'upcoming' ? 'Upcoming' : type === 'live' ? 'Available' : 'Completed'}
            </span>
            {type === 'completed' && test.userScore !== undefined && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Score: {test.userScore.toFixed(1)}%
                </span>
              </>
            )}
            {type === 'upcoming' && timeRemaining && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {timeRemaining}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button - Pushed to bottom */}
        <div className="mt-auto">
          {getActionButton()}
        </div>
      </div>
    </motion.div>
  )
}
