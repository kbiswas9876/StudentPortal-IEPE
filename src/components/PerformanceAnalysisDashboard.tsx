'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { Database } from '@/types/database'
import PrimaryActionButton from './PrimaryActionButton'
import GlobalPerformanceHeader from './GlobalPerformanceHeader'
import ChapterWisePerformanceTable, { ChapterPerformance } from './ChapterWisePerformanceTable'
import DifficultyBreakdown from './DifficultyBreakdown'
import TopperComparison from './TopperComparison'
import Leaderboard from './Leaderboard'
import ActionableInsights from './ActionableInsights'
import { Eye } from 'lucide-react'

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

  const tabStyle = "px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-t-lg transition-colors duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
  const tabContentStyle = "p-4 md:p-6 bg-white dark:bg-slate-800 rounded-b-lg rounded-tr-lg shadow-md"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`min-h-[60vh] relative pb-24 ${className}`} // Added padding-bottom for the sticky footer
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Performance Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Submitted at: <span className="font-medium text-slate-800 dark:text-slate-200">{timestamp}</span>
        </p>
      </div>

      {/* Global Performance Header (New Component) */}
      <div className="mb-8">
        <GlobalPerformanceHeader sessionResult={sessionResult} />
      </div>

      {/* Tabbed Interface for Detailed Analysis */}
      <Tabs.Root defaultValue="performance" className="w-full">
        <Tabs.List className="flex border-b border-slate-200 dark:border-slate-700">
          <Tabs.Trigger value="performance" className={tabStyle}>Performance Breakdown</Tabs.Trigger>
          <Tabs.Trigger value="comparison" className={tabStyle}>Topper Comparison</Tabs.Trigger>
          <Tabs.Trigger value="leaderboard" className={tabStyle}>Full Leaderboard</Tabs.Trigger>
        </Tabs.List>

        {/* Performance Breakdown Tab */}
        <Tabs.Content value="performance" className={tabContentStyle}>
            <div className="space-y-8">
                <ChapterWisePerformanceTable sessionResult={sessionResult} />
                <DifficultyBreakdown sessionResult={sessionResult} />
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

      {/* Actionable Insights (New Component) */}
      <div className="mt-8">
        <ActionableInsights sessionResult={sessionResult} />
      </div>

      {/* Sticky Footer for "View Solutions" Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50 flex justify-center">
        <PrimaryActionButton
          onClick={() => onNavigateToSolutions?.()}
          label="View Detailed Solutions"
          icon={<Eye className="w-4 h-4" />}
          className="w-full max-w-md"
        />
      </div>
    </motion.div>
  )
}
