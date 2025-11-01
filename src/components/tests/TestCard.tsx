'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, Clock, CheckCircle, XCircle, TrendingUp, Award, Eye, Play, AlertCircle } from 'lucide-react'
import { getScoreColor, getPercentileColor, getPerformanceStyles } from '@/utils/colorUtils'

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

interface TestCardProps {
  test: Test
  type: 'upcoming' | 'live' | 'completed'
  index: number
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
  onCountdownComplete?: (testId: number) => void
}

const TestCard: React.FC<TestCardProps> = ({ test, type, index, onStartTest, onViewResult, onCountdownComplete }) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getStatusIcon = () => {
    switch (type) {
      case 'upcoming':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'live':
        return <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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
            className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:scale-105 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm py-3.5 px-4 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Test</span>
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="w-full bg-gradient-to-r from-violet-premium via-violet-600 to-violet-700 hover:from-violet-600 hover:via-violet-700 hover:to-violet-800 hover:scale-105 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Results</span>
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
      className="group relative bg-white border border-slate-light rounded-2xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-out h-full flex flex-col"
    >
      {/* Live Status Badge */}
      {type === 'live' && (
        <div className="absolute -top-2 -right-2" style={{ zIndex: 9999 }}>
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="px-3 py-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white"
            style={{ zIndex: 9999 }}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </motion.div>
        </div>
      )}

      {/* Upcoming Status Badge */}
      {type === 'upcoming' && (
        <div className="absolute -top-2 -right-2" style={{ zIndex: 9999 }}>
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl border-2 border-white"
            style={{ zIndex: 9999 }}
          >
            <Clock className="w-3 h-3" />
            UPCOMING
          </motion.div>
        </div>
      )}

      {/* Header Section */}
      <div className="p-4">
        <h3 className="text-indigo-deep text-lg font-semibold mb-2 leading-tight">
          {test.name}
        </h3>
        <div className="flex items-center text-slate-600 text-sm">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-cool" />
          <span>Taken on: {formatDate(test.start_time)}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1 space-y-2">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-start bg-gradient-to-br from-ghost-white to-slate-100 p-1.5 rounded-lg shadow-sm">
            <FileText className="w-4 h-4 text-electric-blue mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-slate-600">Questions</p>
              <p className="text-sm font-semibold text-indigo-deep">{test.total_questions}</p>
            </div>
          </div>
          <div className="flex items-start bg-gradient-to-br from-ghost-white to-slate-100 p-1.5 rounded-lg shadow-sm">
            <Clock className="w-4 h-4 text-electric-blue mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-slate-600">Duration</p>
              <p className="text-sm font-semibold text-indigo-deep">{formatTime(test.total_time_minutes)}</p>
            </div>
          </div>
        </div>

        {/* Marking Scheme Pills */}
        <div className="mb-2">
                   <p className="text-xs text-slate-600 mb-2">Marking</p>
                   <div className="flex gap-2">
                     <div className="inline-flex items-center bg-green-600 rounded-full px-2.5 py-1">
                       <CheckCircle className="w-3 h-3 text-white mr-1" />
                       <span className="text-white font-semibold text-xs">+{test.marks_per_correct}</span>
                     </div>
                     <div className="inline-flex items-center bg-red-600 rounded-full px-2.5 py-1">
                       <XCircle className="w-3 h-3 text-white mr-1" />
                       <span className="text-white font-semibold text-xs">{test.negative_marks_per_incorrect}</span>
                     </div>
                   </div>
                 </div>

        {/* Score Display - Only for completed tests */}
        {type === 'completed' && test.results && (() => {
          const scorePercent = (test.results.marks_obtained / test.results.total_marks) * 100
          const performanceStyles = getPerformanceStyles(scorePercent)
          
          return (
            <div className="rounded-lg p-2.5 mb-2 shadow-lg text-center" style={{ background: performanceStyles.backgroundGradient }}>
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Final Score</p>
              <div className="font-bold tracking-tight">
                <span 
                  className="text-4xl"
                  style={{ color: performanceStyles.textColor }}
                >
                  {test.results.marks_obtained === 0 ? '0' : (test.results.marks_obtained % 1 === 0 ? test.results.marks_obtained.toString() : test.results.marks_obtained.toFixed(2))}
                </span>
                <span className="text-4xl text-slate-600 mx-1.5">/</span>
                <span className="text-4xl text-slate-600">{test.results.total_marks}</span>
              </div>
            </div>
          )
        })()}

        {/* Status Display for upcoming tests only */}
        {type === 'upcoming' && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg p-3 mb-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon()}
              <p className="text-xs text-[#5F6368] font-medium uppercase tracking-wide">
                Upcoming
              </p>
            </div>
            {timeRemaining && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md">
                <p 
                  className="text-xl font-bold tracking-wider"
                  style={{ 
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.05em'
                  }}
                >
                  {timeRemaining}
                </p>
                <p className="text-xs opacity-90 mt-1">until test starts</p>
              </div>
            )}
          </div>
        )}

        {/* Percentile and Rank - Only for completed tests */}
        {type === 'completed' && test.results && (() => {
          const percentile = test.results.percentile || 0
          const performanceStyles = getPerformanceStyles(percentile)
          
          return (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg p-2.5 shadow-lg text-center" style={{ background: performanceStyles.backgroundGradient }}>
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" style={{ color: performanceStyles.textColor }} />
                  <p className="text-xs text-slate-600 font-medium">Percentile</p>
                </div>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: performanceStyles.textColor }}
                >
                  {percentile === 0 ? '0' : (percentile % 1 === 0 ? percentile.toString() : percentile?.toFixed(1) || '0')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-ghost-white to-slate-100 rounded-lg p-2.5 shadow-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-3.5 h-3.5 text-electric-blue mr-1" />
                  <p className="text-xs text-slate-600 font-medium">Rank</p>
                </div>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-2xl font-bold text-electric-blue">#{test.results.rank || '0'}</span>
                  <span className="text-2xl font-medium text-slate-600">/ {test.results.total_test_takers || '0'}</span>
                </div>
              </div>
            </div>
          )
        })()}

      </div>

      {/* Action Button - Fixed at Bottom */}
      <div className="px-3 pb-3">
        {getActionButton()}
      </div>
    </motion.div>
  )
}

export default TestCard