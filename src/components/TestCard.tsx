'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, CheckCircleIcon, PlayIcon, EyeIcon } from '@heroicons/react/24/outline'

type Test = {
  id: number
  name: string
  description: string | null
  start_time: string
  end_time: string
  status: 'scheduled' | 'live' | 'completed'
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  total_questions: number
  userScore?: number
  resultId?: number
}

interface TestCardProps {
  test: Test
  type: 'upcoming' | 'live' | 'completed'
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
  index: number
}

export default function TestCard({ test, type, onStartTest, onViewResult, index }: TestCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isLive, setIsLive] = useState(false)

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
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
          } else {
            setTimeRemaining(`${minutes}m ${seconds}s`)
          }
        } else {
          setTimeRemaining('Starting now!')
          setIsLive(true)
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [test.start_time, type])

  const formatTime = (minutes: number) => {
    const totalSeconds = minutes * 60
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    // Always show HH:MM:SS format
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCardStyles = () => {
    switch (type) {
      case 'upcoming':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20'
      case 'live':
        return 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20 shadow-green-500/20 shadow-2xl'
      case 'completed':
        return 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
      default:
        return 'border-slate-200 dark:border-slate-700'
    }
  }

  const getStatusIcon = () => {
    switch (type) {
      case 'upcoming':
        return <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      case 'live':
        return <PlayIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
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
            className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-semibold cursor-not-allowed opacity-70 border border-slate-300 dark:border-slate-600"
          >
            {timeRemaining === 'Starting now!' ? 'Starting Soon...' : 'Coming Soon'}
          </button>
        )
      case 'live':
        return (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartTest(test.id)}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-green-400"
          >
            <PlayIcon className="h-5 w-5" />
            Start Test Now
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 border border-slate-600"
          >
            <EyeIcon className="h-5 w-5" />
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
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative p-6 rounded-xl shadow-lg border-2 ${getCardStyles()} hover:shadow-xl transition-all duration-300`}
    >
      {/* Live Status Badge */}
      {type === 'live' && (
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0px rgba(34, 197, 94, 0.4)',
              '0 0 20px rgba(34, 197, 94, 0.6)',
              '0 0 0px rgba(34, 197, 94, 0.4)'
            ]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </motion.div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {test.name}
              </h3>
            </div>
            {test.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {test.description}
              </p>
            )}
            {/* Syllabus/Topics placeholder - can be enhanced with actual data */}
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Mock Test
              </span>
            </div>
          </div>
        </div>
        
        {/* Status Display */}
        <div className="text-right flex-shrink-0 ml-4">
          {type === 'upcoming' && (
            <div className="text-sm">
              <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">Starts in:</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {timeRemaining}
              </div>
            </div>
          )}
          {type === 'live' && (
            <div className="text-sm text-green-600 dark:text-green-400">
              <div className="text-xs opacity-75 mb-1">Available now</div>
              <div className="text-base font-bold">Ready to Start!</div>
            </div>
          )}
          {type === 'completed' && test.userScore !== undefined && (
            <div className="text-sm">
              <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">Your Score:</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {test.userScore.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Test Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-white/60 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {test.total_questions}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Questions</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-white/60 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatTime(test.total_time_minutes)}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Duration</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            +{test.marks_per_correct}
          </div>
          <div className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Correct</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            {test.negative_marks_per_incorrect || 0}
          </div>
          <div className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">Incorrect</div>
        </div>
      </div>

      {/* Enhanced Action Button */}
      <div className="flex justify-end">
        {getActionButton()}
      </div>
    </motion.div>
  )
}
