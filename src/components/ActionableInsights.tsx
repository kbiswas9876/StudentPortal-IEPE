'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  LightBulbIcon, 
  BookOpenIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface AnswerLog {
  question_id: number
  status: string
  time_taken: number
}

interface SectionalStats {
  total: number
  correct: number
  incorrect: number
  skipped: number
  accuracy: number
  avgTime: number
}

interface Insight {
  type: 'weakness' | 'speed' | 'accuracy' | 'strength'
  title: string
  message: string
  action: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

interface ActionableInsightsProps {
  answerLog: AnswerLog[]
  sectionalPerformance: Record<string, SectionalStats>
  peerAverages: Record<number, number>
  onGenerateRevisionPack: () => void
}

export default function ActionableInsights({
  answerLog,
  sectionalPerformance,
  peerAverages,
  onGenerateRevisionPack
}: ActionableInsightsProps) {
  
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Find weakest topics (accuracy < 50%)
    const weakTopics = Object.entries(sectionalPerformance)
      .filter(([_, stats]) => stats.accuracy < 50 && stats.total >= 3) // At least 3 questions
      .sort((a, b) => a[1].accuracy - b[1].accuracy) // Sort by accuracy
      .slice(0, 3) // Top 3 weakest
      .map(([topic, _]) => topic)

    if (weakTopics.length > 0) {
      const incorrectCount = answerLog.filter(a => a.status === 'incorrect').length
      insights.push({
        type: 'weakness',
        title: 'Focus Areas Identified',
        message: `You struggled with ${weakTopics.length} topic${weakTopics.length > 1 ? 's' : ''}: ${weakTopics.join(', ')}. ${incorrectCount} questions need review.`,
        action: 'Generate Revision Pack',
        icon: <ExclamationTriangleIcon className="h-6 w-6" />,
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      })
    }

    // Find questions where user was slower than peers (>150% of average)
    const slowQuestions = answerLog.filter(answer => {
      const peerAvg = peerAverages[answer.question_id]
      return peerAvg && answer.time_taken > (peerAvg * 1.5)
    })

    if (slowQuestions.length >= 5) {
      insights.push({
        type: 'speed',
        title: 'Time Management',
        message: `You took longer than average on ${slowQuestions.length} questions. Practice timed sessions to improve speed without sacrificing accuracy.`,
        action: 'Practice Timed Mode',
        icon: <ClockIcon className="h-6 w-6" />,
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      })
    }

    // Identify careless errors (fast but wrong - <70% of average time)
    const carelessErrors = answerLog.filter(answer => {
      const peerAvg = peerAverages[answer.question_id]
      return answer.status === 'incorrect' && peerAvg && answer.time_taken < (peerAvg * 0.7)
    })

    if (carelessErrors.length >= 3) {
      insights.push({
        type: 'accuracy',
        title: 'Careless Mistakes Detected',
        message: `${carelessErrors.length} questions were answered quickly but incorrectly. Slow down and double-check your work before submitting.`,
        action: 'Review Solutions',
        icon: <LightBulbIcon className="h-6 w-6" />,
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800'
      })
    }

    // Find strong areas (accuracy > 80%)
    const strongTopics = Object.entries(sectionalPerformance)
      .filter(([_, stats]) => stats.accuracy >= 80 && stats.total >= 3)
      .sort((a, b) => b[1].accuracy - a[1].accuracy)
      .slice(0, 2)
      .map(([topic, _]) => topic)

    if (strongTopics.length > 0) {
      insights.push({
        type: 'strength',
        title: 'Strong Performance',
        message: `Excellent work in ${strongTopics.join(' and ')}! Maintain this momentum by practicing regularly.`,
        action: 'Keep Practicing',
        icon: <BookOpenIcon className="h-6 w-6" />,
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      })
    }

    return insights
  }

  const insights = generateInsights()

  if (insights.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
          Great Performance!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          No major issues detected. Keep up the excellent work and continue practicing regularly!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Actionable Insights & Recommendations
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Based on your performance, here are specific areas to focus on for improvement
        </p>
      </div>

      {insights.map((insight, index) => (
        <motion.div
          key={insight.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`${insight.bgColor} border ${insight.borderColor} rounded-xl p-5 shadow-sm`}
        >
          <div className="flex items-start gap-4">
            <div className={`${insight.color} mt-1`}>
              {insight.icon}
            </div>
            
            <div className="flex-1">
              <h4 className={`text-base font-semibold ${insight.color} mb-2`}>
                {insight.title}
              </h4>
              <p className={`text-sm ${insight.color} mb-4 opacity-90`}>
                {insight.message}
              </p>
              
              {insight.type === 'weakness' ? (
                <button
                  onClick={onGenerateRevisionPack}
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 ${insight.color} border ${insight.borderColor} rounded-lg font-medium text-sm transition-all hover:shadow-md`}
                >
                  <span>{insight.action}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 ${insight.color} border ${insight.borderColor} rounded-lg font-medium text-sm`}>
                  <span>{insight.action}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: insights.length * 0.1 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800"
      >
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <span>💪</span>
          <span>Your Action Plan</span>
        </h4>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
          <li>Focus on your weak topics by using the revision pack feature</li>
          <li>Practice regularly to improve speed and accuracy</li>
          <li>Review solutions to understand concepts better</li>
          <li>Take more mock tests to track improvement</li>
        </ol>
      </motion.div>
    </div>
  )
}

