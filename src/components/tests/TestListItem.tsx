'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, Clock, CheckCircle, XCircle, TrendingUp, Award, Eye, Play } from 'lucide-react'
import { getScoreColor, getPercentileColor } from '@/utils/colorUtils'

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
  userScore?: number
  resultId?: number
  results?: {
    marks_obtained: number
    total_marks: number
    percentile: number
    rank: number
    total_test_takers: number
  }
}

interface TestListItemProps {
  test: Test
  type: 'upcoming' | 'live' | 'completed'
  index: number
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
  onCountdownComplete?: (testId: number) => void
}

const TestListItem: React.FC<TestListItemProps> = ({ test, type, index, onStartTest, onViewResult, onCountdownComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const countdownCompleteCalledRef = useRef(false)

  useEffect(() => {
    if (type === 'upcoming' && test.start_time) {
      // Reset the ref when the test or type changes
      countdownCompleteCalledRef.current = false

      const updateTimeRemaining = () => {
        const now = new Date().getTime()
        const startTime = new Date(test.start_time).getTime()
        const diff = startTime - now

        if (diff <= 0) {
          setTimeRemaining('Starting now')
          
          // Trigger callback only once when countdown hits zero
          if (onCountdownComplete && !countdownCompleteCalledRef.current) {
            countdownCompleteCalledRef.current = true
            onCountdownComplete(test.id)
          }
          return
        }

        const totalHours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        // Format as HH:MM:SS
        const hours = totalHours % 24
        const formattedHours = hours.toString().padStart(2, '0')
        const formattedMinutes = minutes.toString().padStart(2, '0')
        const formattedSeconds = seconds.toString().padStart(2, '0')
        
        setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
      }

      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 1000) // Update every second
      return () => clearInterval(interval)
    }
  }, [test.start_time, test.id, type, onCountdownComplete])

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getStatusBadge = () => {
    switch (type) {
      case 'live':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </motion.div>
        )
      case 'upcoming':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Clock className="w-2.5 h-2.5" />
            UPCOMING
          </motion.div>
        )
      case 'completed':
        return (
          <div className="px-2 py-0.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-2.5 h-2.5" />
            COMPLETED
          </div>
        )
      default:
        return null
    }
  }

  const getActionButton = () => {
    switch (type) {
      case 'upcoming':
        return null
      case 'live':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartTest(test.id)}
            className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-sm py-2 px-4 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Test</span>
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-indigo-800"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Results</span>
          </motion.button>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between px-4 py-3 gap-4"
    >
      {/* Left Section: Test Name + Status Badge + Quick Stats */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1C1E] truncate">
              {test.name}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5F6368]">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{test.total_questions} Q</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(test.total_time_minutes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(test.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section: Metadata (Marking, Score, Countdown, Percentile/Rank) */}
      <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
        {/* Marking Scheme */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center bg-green-600 rounded-full px-2 py-0.5">
            <CheckCircle className="w-2.5 h-2.5 text-white mr-0.5" />
            <span className="text-white font-semibold text-xs">+{test.marks_per_correct}</span>
          </div>
          <div className="inline-flex items-center bg-red-600 rounded-full px-2 py-0.5">
            <XCircle className="w-2.5 h-2.5 text-white mr-0.5" />
            <span className="text-white font-semibold text-xs">{test.negative_marks_per_incorrect}</span>
          </div>
        </div>

        {/* Countdown Timer for Upcoming */}
        {type === 'upcoming' && timeRemaining && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg shadow-md">
            <p className="text-sm font-bold tracking-wider">{timeRemaining}</p>
          </div>
        )}

        {/* Score Display for Completed */}
        {type === 'completed' && test.results && (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs text-[#5F6368] mb-0.5">Score</p>
              <p className="text-sm font-bold" style={{ color: getScoreColor(test.results.marks_obtained, test.results.total_marks) }}>
                {test.results.marks_obtained === 0 ? '0' : (test.results.marks_obtained % 1 === 0 ? test.results.marks_obtained.toString() : test.results.marks_obtained.toFixed(2))}/{test.results.total_marks}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" style={{ color: getPercentileColor(test.results.percentile || 0) }} />
                <span className="font-semibold" style={{ color: getPercentileColor(test.results.percentile || 0) }}>
                  {test.results.percentile === 0 ? '0' : (test.results.percentile % 1 === 0 ? test.results.percentile.toString() : test.results.percentile?.toFixed(1) || '0')}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-[#3F51B5]" />
                <span className="font-semibold text-[#3F51B5]">#{test.results.rank || '0'}/{test.results.total_test_takers || '0'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Center Section: Compact metadata for smaller screens */}
      <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
        {type === 'upcoming' && timeRemaining && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
            {timeRemaining}
          </div>
        )}
        {type === 'completed' && test.results && (
          <div className="text-xs">
            <p className="font-bold" style={{ color: getScoreColor(test.results.marks_obtained, test.results.total_marks) }}>
              {test.results.marks_obtained === 0 ? '0' : (test.results.marks_obtained % 1 === 0 ? test.results.marks_obtained.toString() : test.results.marks_obtained.toFixed(2))}/{test.results.total_marks}
            </p>
          </div>
        )}
      </div>

      {/* Right Section: Action Button */}
      <div className="flex-shrink-0">
        {getActionButton()}
      </div>
    </motion.div>
  )
}

export default TestListItem

