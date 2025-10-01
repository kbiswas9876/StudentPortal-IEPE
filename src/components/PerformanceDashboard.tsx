'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Database } from '@/types/database'

type TestResult = Database['public']['Tables']['test_results']['Row']

interface PerformanceDashboardProps {
  testResult: TestResult
}

export default function PerformanceDashboard({ testResult }: PerformanceDashboardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Session Analysis Report
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`p-6 rounded-xl shadow-lg ${getScoreBgColor(testResult.score_percentage || 0)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Overall Score
              </p>
              <p className={`text-3xl font-bold ${getScoreColor(testResult.score_percentage || 0)}`}>
                {testResult.score_percentage || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-6 rounded-xl shadow-lg bg-blue-100 dark:bg-blue-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Time
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {testResult.total_time_taken ? formatTime(testResult.total_time_taken) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Correct Answers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="p-6 rounded-xl shadow-lg bg-green-100 dark:bg-green-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Correct
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {testResult.total_correct || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Incorrect Answers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="p-6 rounded-xl shadow-lg bg-red-100 dark:bg-red-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Incorrect
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {testResult.total_incorrect || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
