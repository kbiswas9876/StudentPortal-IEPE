'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import ReviewStreakCard from '@/components/analytics/ReviewStreakCard'
import RetentionRateChart from '@/components/analytics/RetentionRateChart'
import DeckMasteryChart from '@/components/analytics/DeckMasteryChart'
import ReviewHeatmapCalendar from '@/components/analytics/ReviewHeatmapCalendar'
import StreakActivityCard from '@/components/analytics/StreakActivityCard'
import ActionableInsightsCard from '@/components/analytics/ActionableInsightsCard'
import { AnalyticsPageSkeleton } from '@/components/analytics/SkeletonLoader'

interface AnalyticsData {
  overview: {
    totalQuestions: number
    currentStreak: number
    retentionRate: number
    averageEaseFactor: number
  }
  retention: {
    rate: number
    averageEaseFactor: number
    breakdown: {
      young7Days: number | null
      mature7Days: number | null
      young30Days: number | null
      mature30Days: number | null
    }
  }
  deckMastery: {
    learning: { count: number; percentage: number }
    maturing: { count: number; percentage: number }
    mastered: { count: number; percentage: number }
  }
  monthlyData: Array<{
    date: string
    reviewsCompleted: number
    reviewsScheduled: number
  }>
  streakData?: {
    currentStreak: number
    longestStreak: number
    last90Days: Array<{
      date: string
      count: number
    }>
  }
  insights?: {
    hardestQuestions: Array<{
      bookmarkId: string
      questionId: string
      questionText: string
      chapter: string
      stat: string
      difficultyScore: number
    }>
    weakestChapters: Array<{
      chapter: string
      questionCount: number
      successRate: number
      totalAttempts: number
    }>
    hourlyPerformance?: {
      hasEnoughData: boolean
      performanceByTimeBlock: Array<{
        timeBlock: string
        label: string
        timeRange: string
        successRate: number
        totalReviews: number
      }>
    }
  }
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!dataFetchedRef.current) {
      fetchAnalytics()
      dataFetchedRef.current = true
    }
  }, [user, authLoading, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch analytics, streak data, and insights in parallel
      const [analyticsResponse, streakResponse, insightsResponse] = await Promise.all([
        fetch(`/api/revision-hub/analytics?userId=${user?.id}`),
        fetch(`/api/revision-hub/streak?userId=${user?.id}`),
        fetch(`/api/revision-hub/insights?userId=${user?.id}`)
      ])

      const analyticsResult = await analyticsResponse.json()
      const streakResult = await streakResponse.json()
      const insightsResult = await insightsResponse.json()

      if (!analyticsResponse.ok) {
        throw new Error(analyticsResult.error || 'Failed to fetch analytics')
      }

      // Combine the data
      const combinedData = {
        ...analyticsResult.data,
        streakData: streakResponse.ok ? streakResult.data : undefined,
        insights: insightsResponse.ok ? insightsResult.data : undefined
      }

      setAnalyticsData(combinedData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/revision-hub')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  SRS Analytics
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Track your learning progress and review patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Streak Activity Card - Full Width */}
          {analyticsData.streakData && (
            <StreakActivityCard
              currentStreak={analyticsData.streakData.currentStreak}
              longestStreak={analyticsData.streakData.longestStreak}
              last90Days={analyticsData.streakData.last90Days}
            />
          )}

          {/* Deck Mastery Chart */}
          <DeckMasteryChart data={analyticsData.deckMastery} />

          {/* Retention Rate Chart */}
          <RetentionRateChart
            retentionRate={analyticsData.retention.rate}
            averageEaseFactor={analyticsData.retention.averageEaseFactor}
            retentionData={analyticsData.retention.breakdown}
          />

          {/* Monthly Activity Calendar */}
          <ReviewHeatmapCalendar monthlyData={analyticsData.monthlyData} />

          {/* Actionable Insights Card */}
          {analyticsData.insights && (
            <ActionableInsightsCard
              hardestQuestions={analyticsData.insights.hardestQuestions}
              weakestChapters={analyticsData.insights.weakestChapters}
              hourlyPerformance={analyticsData.insights.hourlyPerformance}
            />
          )}
        </div>

        {/* Note about streak tracking */}
        {analyticsData.overview.currentStreak === 0 && analyticsData.overview.totalQuestions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                <strong>Pro Tip:</strong> Complete your daily reviews to build your streak and unlock advanced analytics!
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {analyticsData.overview.totalQuestions === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              No bookmarked questions yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
              Start bookmarking questions from your practice sessions to see analytics here.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              Start Practicing
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

