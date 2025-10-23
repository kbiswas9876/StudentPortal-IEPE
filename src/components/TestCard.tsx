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
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20'
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
            className="px-6 py-2 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        )
      case 'live':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartTest(test.id)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Test
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            View Result & Leaderboard
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
      className={`p-6 rounded-xl shadow-lg border-2 ${getCardStyles()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {test.name}
            </h3>
            {test.description && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {test.description}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {type === 'upcoming' && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="font-medium">Starts in:</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {timeRemaining}
              </div>
            </div>
          )}
          {type === 'live' && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Test is now live!
            </div>
          )}
          {type === 'completed' && test.userScore !== undefined && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="font-medium">Your Score:</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {test.userScore.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {test.total_questions}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatTime(test.total_time_minutes)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Duration</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            +{test.marks_per_correct}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {test.negative_marks_per_incorrect || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Incorrect</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        {getActionButton()}
      </div>
    </motion.div>
  )
}
