'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, Clock, CheckCircle, XCircle, TrendingUp, Award, Eye, Play, AlertCircle } from 'lucide-react'

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
}

interface TestCardProps {
  test: Test
  type: 'upcoming' | 'live' | 'completed'
  index: number
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
}

const TestCard: React.FC<TestCardProps> = ({ test, type, index, onStartTest, onViewResult }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    if (type === 'upcoming' && test.start_time) {
      const updateTimeRemaining = () => {
        const now = new Date().getTime()
        const startTime = new Date(test.start_time).getTime()
        const diff = startTime - now

        if (diff <= 0) {
          setTimeRemaining('Starting now')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`)
        } else {
          setTimeRemaining(`${minutes}m`)
        }
      }

      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 60000)
      return () => clearInterval(interval)
    }
  }, [test.start_time, type])

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
        return (
          <button
            disabled
            className="w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-semibold cursor-not-allowed text-sm py-3.5 px-4"
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
            className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white rounded-xl font-bold transition-all duration-300 hover:shadow-xl text-sm py-3.5 px-4 flex items-center justify-center gap-2"
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
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-indigo-800"
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
      className="group relative bg-[#F7F8FA] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col"
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

      {/* Header Section */}
      <div className="bg-white p-4 shadow-sm">
        <h3 className="text-[#1A1C1E] text-lg font-bold mb-2 leading-tight">
          {test.name}
        </h3>
        <div className="flex items-center text-[#5F6368] text-xs">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          <span>Taken on: {formatDate(test.start_time)}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-start">
            <FileText className="w-4 h-4 text-[#5F6368] mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-[#5F6368]">Questions</p>
              <p className="text-sm font-semibold text-[#1A1C1E]">{test.total_questions}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="w-4 h-4 text-[#5F6368] mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-[#5F6368]">Duration</p>
              <p className="text-sm font-semibold text-[#1A1C1E]">{formatTime(test.total_time_minutes)}</p>
            </div>
          </div>
        </div>

        {/* Marking Scheme Pills */}
        <div className="mb-4">
          <p className="text-xs text-[#5F6368] mb-2">Marking</p>
          <div className="flex gap-2">
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <CheckCircle className="w-3 h-3 text-[#1E8E3E] mr-1" />
              <span className="text-[#1E8E3E] font-semibold text-xs">+{test.marks_per_correct}</span>
            </div>
            <div className="inline-flex items-center bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
              <XCircle className="w-3 h-3 text-[#D93025] mr-1" />
              <span className="text-[#D93025] font-semibold text-xs">{test.negative_marks_per_incorrect}</span>
            </div>
          </div>
        </div>

        {/* Score Display - Only for completed tests */}
        {type === 'completed' && test.userScore !== undefined && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm text-center">
            <p className="text-xs text-[#5F6368] mb-2 uppercase tracking-wide">Final Score</p>
            <div className="font-bold text-[#1A1C1E] tracking-tight">
              <span className="text-4xl">{test.userScore.toFixed(1)}</span>
              <span className="text-2xl text-[#5F6368] mx-1.5">%</span>
            </div>
          </div>
        )}

        {/* Status Display for non-completed tests */}
        {type !== 'completed' && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon()}
              <p className="text-xs text-[#5F6368] font-medium uppercase tracking-wide">
                {type === 'upcoming' ? 'Upcoming' : 'Live'}
              </p>
            </div>
            {type === 'upcoming' && timeRemaining && (
              <p className="text-sm font-semibold text-[#1A1C1E]">{timeRemaining}</p>
            )}
            {type === 'live' && (
              <p className="text-sm font-semibold text-green-600">Available Now</p>
            )}
          </div>
        )}

        {/* Percentile and Rank - Only for completed tests */}
        {type === 'completed' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#1E8E3E] mr-1" />
                <p className="text-xs text-[#5F6368] font-medium">Percentile</p>
              </div>
              <p className="text-2xl font-bold text-[#1E8E3E]">{test.userScore?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="w-3.5 h-3.5 text-[#3F51B5] mr-1" />
                <p className="text-xs text-[#5F6368] font-medium">Rank</p>
              </div>
              <p className="text-2xl font-bold text-[#3F51B5]">#{Math.floor(Math.random() * 100) + 1}</p>
            </div>
          </div>
        )}

      </div>

      {/* Action Button - Fixed at Bottom */}
      <div className="px-4 pb-4">
        {getActionButton()}
      </div>
    </motion.div>
  )
}

export default TestCard