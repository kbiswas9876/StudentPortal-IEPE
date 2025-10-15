'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AnalysisData {
  testResult: any
  answerLog: any[]
  questions: any[]
  peerAverages: Record<number, number>
}

interface RevisionInsightsData {
  totalQuestions: number
  questionsWithHistory: number
  firstAttemptQuestions: number
  momentumBreakdown: {
    improved: number
    declined: number
    maintained: number
    firstAttempt: number
  }
  averageMasteryImprovement: number
  averageSpeedImprovement: number
  biggestImprovement?: {
    questionText: string
    chapter: string
    currentStatus: string
    previousStatus: string
    speedImprovement: number | null
  }
  persistentWeakness?: {
    questionText: string
    chapter: string
    currentStatus: string
    previousStatus: string
  }
  keyTakeaway: string
  hasHistoricalData: boolean
}

interface RevisionPerformanceInsightsProps {
  analysisData: AnalysisData
}

export default function RevisionPerformanceInsights({ analysisData }: RevisionPerformanceInsightsProps) {
  const [insightsData, setInsightsData] = useState<RevisionInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/analysis/revision-insights?resultId=${analysisData.testResult.id}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch insights')
        }
        
        setInsightsData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights')
      } finally {
        setLoading(false)
      }
    }

    if (analysisData?.testResult?.id) {
      fetchInsights()
    }
  }, [analysisData])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Analyzing your revision performance...</span>
        </div>
      </motion.div>
    )
  }

  if (error || !insightsData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
              Unable to Load Insights
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error || 'Failed to analyze your revision performance'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Don't show insights if no historical data
  if (!insightsData.hasHistoricalData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <StarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
              First Revision Session
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Great start! Complete another session to unlock detailed performance trends.
            </p>
          </div>
        </div>
        <div className="text-sm text-green-800 dark:text-green-200">
          <p>• This session: {insightsData.totalQuestions} questions</p>
          <p>• Complete another revision to see improvement trends</p>
          <p>• We&apos;ll track your mastery progress over time</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Revision Insights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your performance compared to previous attempts
          </p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Improvement */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Overall Improvement
            </h4>
            {insightsData.averageMasteryImprovement >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              insightsData.averageMasteryImprovement >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {insightsData.averageMasteryImprovement >= 0 ? '+' : ''}{insightsData.averageMasteryImprovement}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mastery Score Change
            </div>
          </div>
        </div>

        {/* Mastery Momentum */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mastery Momentum
            </h4>
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 dark:text-green-400">Improved:</span>
              <span className="font-semibold text-green-600">{insightsData.momentumBreakdown.improved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600 dark:text-red-400">Declined:</span>
              <span className="font-semibold text-red-600">{insightsData.momentumBreakdown.declined}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Maintained:</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">{insightsData.momentumBreakdown.maintained}</span>
            </div>
          </div>
        </div>

        {/* Speed vs Accuracy */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Speed Trend
            </h4>
            <ClockIcon className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              insightsData.averageSpeedImprovement >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {insightsData.averageSpeedImprovement >= 0 ? '+' : ''}{insightsData.averageSpeedImprovement}s
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Time Improvement
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biggest Improvement */}
        {insightsData.biggestImprovement && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Biggest Improvement
              </h4>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="font-medium mb-1">{insightsData.biggestImprovement.chapter}</div>
              <div className="text-xs mb-2">
                {insightsData.biggestImprovement.previousStatus} → {insightsData.biggestImprovement.currentStatus}
              </div>
              {insightsData.biggestImprovement.speedImprovement && (
                <div className="text-xs text-green-600">
                  +{insightsData.biggestImprovement.speedImprovement}s faster
                </div>
              )}
            </div>
          </div>
        )}

        {/* Persistent Weakness */}
        {insightsData.persistentWeakness && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Persistent Weakness
              </h4>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="font-medium mb-1">{insightsData.persistentWeakness.chapter}</div>
              <div className="text-xs text-orange-600">
                Still struggling after multiple attempts
              </div>
            </div>
          </div>
        )}

        {/* Key Takeaway */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-3">
            <LightBulbIcon className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Key Takeaway
            </h4>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {insightsData.keyTakeaway}
          </div>
        </div>
      </div>
    </motion.div>
  )
}