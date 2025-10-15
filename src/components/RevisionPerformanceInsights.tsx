'use client'

import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface AnalysisData {
  testResult: any
  answerLog: any[]
  questions: any[]
  peerAverages: Record<number, number>
}

interface RevisionPerformanceInsightsProps {
  analysisData: AnalysisData
}

export default function RevisionPerformanceInsights({ analysisData }: RevisionPerformanceInsightsProps) {
  if (!analysisData) return null

  // Calculate revision-specific metrics
  const totalQuestions = analysisData.questions.length
  const correctAnswers = analysisData.answerLog.filter(log => log.status === 'correct').length
  const incorrectAnswers = analysisData.answerLog.filter(log => log.status === 'incorrect').length
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  
  // Calculate average time per question
  const totalTime = analysisData.answerLog.reduce((sum, log) => sum + log.time_taken, 0)
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0
  
  // Calculate time improvement (mock data for now - would need historical data)
  const previousAvgTime = 45 // This would come from historical data
  const timeImprovement = previousAvgTime > 0 ? Math.round(((previousAvgTime - avgTimePerQuestion) / previousAvgTime) * 100) : 0
  
  // Calculate accuracy improvement (mock data for now)
  const previousAccuracy = 75 // This would come from historical data
  const accuracyImprovement = accuracy - previousAccuracy

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-xl shadow-lg p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Revision Performance Insights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
              Your progress compared to previous attempts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Session Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Current Session
            </h4>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Accuracy:</span>
              <span className="font-semibold text-green-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Time:</span>
              <span className="font-semibold text-blue-600">{avgTimePerQuestion}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Questions:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Accuracy Improvement */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Accuracy Trend
            </h4>
            {accuracyImprovement >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Previous:</span>
              <span className="text-sm font-medium">{previousAccuracy}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current:</span>
              <span className="text-sm font-medium">{accuracy}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Change:</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${
                accuracyImprovement >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {accuracyImprovement >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {Math.abs(accuracyImprovement)}%
              </span>
            </div>
          </div>
        </div>

        {/* Time Improvement */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Speed Trend
            </h4>
            {timeImprovement >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Previous:</span>
              <span className="text-sm font-medium">{previousAvgTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current:</span>
              <span className="text-sm font-medium">{avgTimePerQuestion}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Improvement:</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${
                timeImprovement >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {timeImprovement >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {Math.abs(timeImprovement)}%
              </span>
            </div>
          </div>
        </div>

        {/* Revision Insights */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Revision Insights
            </h4>
            <ClockIcon className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {accuracy >= 80 ? (
                <span className="text-green-600 font-medium">Excellent mastery!</span>
              ) : accuracy >= 60 ? (
                <span className="text-yellow-600 font-medium">Good progress</span>
              ) : (
                <span className="text-red-600 font-medium">Needs more practice</span>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {avgTimePerQuestion <= 30 ? (
                <span className="text-green-600 font-medium">Fast solving speed</span>
              ) : avgTimePerQuestion <= 60 ? (
                <span className="text-yellow-600 font-medium">Moderate speed</span>
              ) : (
                <span className="text-red-600 font-medium">Consider time management</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Recommended Actions
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          {accuracy < 70 && (
            <div>• Focus on understanding concepts you got wrong</div>
          )}
          {avgTimePerQuestion > 60 && (
            <div>• Practice similar questions to improve speed</div>
          )}
          {accuracy >= 80 && avgTimePerQuestion <= 30 && (
            <div>• Great job! Consider moving to more challenging topics</div>
          )}
          <div>• Review the detailed solutions to reinforce learning</div>
        </div>
      </div>
    </motion.div>
  )
}
