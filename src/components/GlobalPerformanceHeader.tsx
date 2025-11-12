'use client'

import React from 'react'
import { Award, TrendingUp, Target, CheckCircle, BarChart2, Hash, HelpCircle, X, Check } from 'lucide-react'
import { SessionResult } from './PerformanceAnalysisDashboard'

interface GlobalPerformanceHeaderProps {
  sessionResult: SessionResult
}

const GlobalPerformanceHeader: React.FC<GlobalPerformanceHeaderProps> = ({ sessionResult }) => {
  const { testResult, answerLog } = sessionResult
  const { results } = testResult

  // --- Calculations ---
  const correct = answerLog.filter(a => a.status === 'correct').length
  const incorrect = answerLog.filter(a => a.status === 'incorrect').length
  const skipped = answerLog.filter(a => a.status === 'skipped').length
  const attempted = correct + incorrect
  const totalQuestions = answerLog.length
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0
  const attemptRate = totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0



  // --- Reusable Card Components ---
  const PrimaryMetricCard = ({ icon, label, value, subValue, colorClass, bgGradient }: {
    icon: React.ReactNode
    label: string
    value: string
    subValue?: string
    colorClass: string
    bgGradient?: string
  }) => (
    <div className="group bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <div className={`flex-shrink-0 p-2 rounded-lg ${bgGradient || 'bg-slate-100 dark:bg-slate-700'} ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 flex-wrap">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 break-words">{value}</span>
          {subValue && <span className="text-base font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{subValue}</span>}
        </div>
      </div>
    </div>
  )

  // Combined Answer Status Card
  const AnswerStatusCard = () => (
    <div className="group bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md hover:shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Answer Status</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{correct}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Correct</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{incorrect}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Incorrect</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
            <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{skipped}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Skipped</div>
        </div>
      </div>
    </div>
  )

  const SecondaryMetricCard = ({ icon, label, value, iconColor }: {
    icon: React.ReactNode
    label: string
    value: string | number
    iconColor?: string
  }) => (
    <div className="group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg flex items-center space-x-3 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 border border-transparent">
      <div className={`flex-shrink-0 p-2 rounded-full bg-slate-100 dark:bg-slate-700 ${iconColor || 'text-slate-500 dark:text-slate-300'} transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{value}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tier 1: Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <PrimaryMetricCard
          icon={<BarChart2 className="w-6 h-6" />}
          label="Score"
          value={results.marks_obtained.toString()}
          subValue={`/ ${results.total_marks}`}
          colorClass="text-green-600 dark:text-green-400"
          bgGradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
        />
        <PrimaryMetricCard
          icon={<Award className="w-6 h-6" />}
          label="Rank"
          value={`#${results.rank}`}
          subValue={`/ ${results.total_test_takers}`}
          colorClass="text-blue-600 dark:text-blue-400"
          bgGradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
        />
        <PrimaryMetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Percentile"
          value={`${results.percentile}%`}
          colorClass="text-purple-600 dark:text-purple-400"
          bgGradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30"
        />
        <PrimaryMetricCard
          icon={<Target className="w-6 h-6" />}
          label="Accuracy"
          value={`${accuracy.toFixed(2)}%`}
          colorClass="text-amber-600 dark:text-amber-400"
          bgGradient="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
        />
      </div>

      {/* Tier 2: Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnswerStatusCard />
        <SecondaryMetricCard 
          icon={<CheckCircle className="w-5 h-5" />} 
          label="Attempt Rate" 
          value={`${attemptRate.toFixed(2)}%`}
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <SecondaryMetricCard 
          icon={<Hash className="w-5 h-5" />} 
          label="Total Questions" 
          value={totalQuestions}
          iconColor="text-slate-600 dark:text-slate-300"
        />
      </div>
    </div>
  )
}

export default GlobalPerformanceHeader
