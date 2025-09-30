'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Database } from '@/types/database'

type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface QuestionData extends AnswerLog {
  question: Question
}

interface StrategicPerformanceMatrixProps {
  questions: QuestionData[]
  peerAverages: Record<number, number>
  onMatrixFilter: (category: 'strengths' | 'needs_speed' | 'careless_errors' | 'weaknesses' | 'all') => void
  activeCategory: 'strengths' | 'needs_speed' | 'careless_errors' | 'weaknesses' | 'all'
}

export default function StrategicPerformanceMatrix({ 
  questions, 
  peerAverages, 
  onMatrixFilter, 
  activeCategory 
}: StrategicPerformanceMatrixProps) {
  
  // Calculate matrix categories
  const calculateMatrix = () => {
    const matrix = {
      strengths: [] as QuestionData[],
      needs_speed: [] as QuestionData[],
      careless_errors: [] as QuestionData[],
      weaknesses: [] as QuestionData[]
    }

    questions.forEach(questionData => {
      const { status, time_taken } = questionData
      const peerAverage = peerAverages[questionData.question_id]
      
      // Only categorize if we have peer data
      if (peerAverage) {
        const isFast = time_taken <= peerAverage * 0.8 // 20% faster than peer average
        const isSlow = time_taken >= peerAverage * 1.2 // 20% slower than peer average
        const isCorrect = status === 'correct'
        const isIncorrect = status === 'incorrect'

        if (isCorrect && isFast) {
          matrix.strengths.push(questionData)
        } else if (isCorrect && isSlow) {
          matrix.needs_speed.push(questionData)
        } else if (isIncorrect && isFast) {
          matrix.careless_errors.push(questionData)
        } else if (isIncorrect && isSlow) {
          matrix.weaknesses.push(questionData)
        }
      }
    })

    return matrix
  }

  const matrix = calculateMatrix()

  const matrixCategories = [
    {
      key: 'strengths' as const,
      title: 'Strengths',
      description: 'Correct & Fast',
      count: matrix.strengths.length,
      color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
      icon: '💪'
    },
    {
      key: 'needs_speed' as const,
      title: 'Needs Speed',
      description: 'Correct but Slow',
      count: matrix.needs_speed.length,
      color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚡'
    },
    {
      key: 'careless_errors' as const,
      title: 'Careless Errors',
      description: 'Incorrect but Fast',
      count: matrix.careless_errors.length,
      color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
      textColor: 'text-orange-800 dark:text-orange-200',
      icon: '⚠️'
    },
    {
      key: 'weaknesses' as const,
      title: 'Weaknesses',
      description: 'Incorrect & Slow',
      count: matrix.weaknesses.length,
      color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
      textColor: 'text-red-800 dark:text-red-200',
      icon: '🎯'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Strategic Performance Matrix
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Click on any quadrant to filter questions by performance category
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {matrixCategories.map((category, index) => (
            <motion.button
              key={category.key}
              onClick={() => onMatrixFilter(category.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activeCategory === category.key
                  ? `${category.color} ring-2 ring-blue-500`
                  : `${category.color} hover:scale-105`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className={`font-bold text-lg ${category.textColor} mb-1`}>
                  {category.title}
                </h3>
                <p className={`text-sm ${category.textColor} mb-2`}>
                  {category.description}
                </p>
                <div className={`text-2xl font-bold ${category.textColor}`}>
                  {category.count}
                </div>
                <p className={`text-xs ${category.textColor} mt-1`}>
                  questions
                </p>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Show All Button */}
        <div className="mt-4 text-center">
          <motion.button
            onClick={() => onMatrixFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Show All Questions
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
