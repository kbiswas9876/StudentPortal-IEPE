'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { Database } from '@/types/database'
import PrimaryActionButton from './PrimaryActionButton'
import GlobalPerformanceHeader from './GlobalPerformanceHeader'
import ChapterWisePerformanceTable from './ChapterWisePerformanceTable'
import PerformanceDifficultyBreakdown from './PerformanceDifficultyBreakdown'
import TopperComparison from './TopperComparison'
import Leaderboard from './Leaderboard'
import ActionableInsights from './ActionableInsights'
import QuestionBreakdownChart from './QuestionBreakdownChart'

// --- Type Definitions based on the new Blueprint ---

type TestResultRow = Database['public']['Tables']['test_results']['Row'] & {
  rank?: number; // Added for consistency with TestCard logic
  total_test_takers?: number; // Added for consistency with TestCard logic
}
type AnswerLogRow = Database['public']['Tables']['answer_log']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']

// This is the new "source of truth" object, consistent with TestCard.tsx
export interface PerformanceMetrics {
  marks_obtained: number
  total_marks: number
  percentile: number
  rank: number
  total_test_takers: number
}

// The comprehensive data structure for the new dashboard
export interface SessionResult {
  testResult: TestResultRow & { results: PerformanceMetrics } // Enforce the results object
  answerLog: AnswerLogRow[]
  questions: QuestionRow[]
  topperResult?: { // Topper data is optional
    testResult: TestResultRow & { results: PerformanceMetrics }
    answerLog: AnswerLogRow[]
  }
  leaderboard?: any[] // Placeholder for leaderboard data (will be fetched by Leaderboard component)
}

export interface PerformanceAnalysisDashboardProps {
  sessionResult: SessionResult
  onNavigateToSolutions?: () => void
  className?: string
}

// --- Main Dashboard Component ---

export default function PerformanceAnalysisDashboard({
  sessionResult,
  onNavigateToSolutions,
  className = '',
}: PerformanceAnalysisDashboardProps) {
  const submittedAt = sessionResult?.testResult?.submitted_at
  const timestamp = useMemo(() => {
    const date = submittedAt ? new Date(submittedAt) : new Date()
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [submittedAt])

  const tabStyle = "relative px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 rounded-t-lg transition-all duration-200 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400"
  const tabContentStyle = "p-6 md:p-8 bg-white dark:bg-slate-800 rounded-b-lg rounded-tr-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`min-h-[60vh] relative ${className}`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Performance Analysis
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Submitted at: <span className="font-semibold text-slate-800 dark:text-slate-200">{timestamp}</span></span>
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Global Performance Header */}
          <GlobalPerformanceHeader sessionResult={sessionResult} />

          {/* Tabbed Interface for Detailed Analysis */}
          <Tabs.Root defaultValue="performance" className="w-full">
            <Tabs.List className="flex border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg p-1">
              <Tabs.Trigger value="performance" className={tabStyle}>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Performance Breakdown</span>
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger value="comparison" className={tabStyle}>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Topper Comparison</span>
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger value="leaderboard" className={tabStyle}>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Full Leaderboard</span>
                </span>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Performance Breakdown Tab */}
            <Tabs.Content value="performance" className={tabContentStyle}>
              <div className="space-y-8">
                <ChapterWisePerformanceTable sessionResult={sessionResult} />
                <PerformanceDifficultyBreakdown sessionResult={sessionResult} />
              </div>
            </Tabs.Content>

            {/* Topper Comparison Tab */}
            <Tabs.Content value="comparison" className={tabContentStyle}>
              <TopperComparison sessionResult={sessionResult} />
            </Tabs.Content>

            {/* Leaderboard Tab */}
            <Tabs.Content value="leaderboard" className={tabContentStyle}>
              <Leaderboard
                testId={sessionResult.testResult.mock_test_id}
                currentUserId={sessionResult.testResult.user_id}
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Question Breakdown Chart */}
          <QuestionBreakdownChart sessionResult={sessionResult} />

          {/* Actionable Insights */}
          <ActionableInsights sessionResult={sessionResult} />
        </div>
      </div>

      {/* Floating Action Button */}
      <PrimaryActionButton
        onClick={() => onNavigateToSolutions?.()}
        label="View Detailed Solutions"
      />
    </motion.div>
  )
}
