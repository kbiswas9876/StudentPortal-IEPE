'use client'

import React from 'react'
import { Award, TrendingUp, Target, CheckCircle, BarChart2, Hash, HelpCircle, X, Check } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
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

  // --- Data for Doughnut Chart ---
  const doughnutData = [
    { name: 'Correct', value: correct },
    { name: 'Incorrect', value: incorrect },
    { name: 'Skipped', value: skipped },
  ]
  const COLORS = ['#22c55e', '#ef4444', '#64748b']

  // --- Reusable Card Components ---
  const PrimaryMetricCard = ({ icon, label, value, subValue, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 border border-slate-200/50 dark:border-slate-700/50">
      <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-700 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-base text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
          {subValue && <span className="text-lg font-medium text-slate-500 dark:text-slate-400">{subValue}</span>}
        </div>
      </div>
    </div>
  )

  const SecondaryMetricCard = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex items-center space-x-3">
      <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">{value}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tier 1: Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PrimaryMetricCard
          icon={<BarChart2 className="w-7 h-7" />}
          label="Score"
          value={results.marks_obtained.toFixed(2)}
          subValue={`/ ${results.total_marks}`}
          colorClass="text-green-500"
        />
        <PrimaryMetricCard
          icon={<Award className="w-7 h-7" />}
          label="Rank"
          value={`#${results.rank}`}
          subValue={`/ ${results.total_test_takers}`}
          colorClass="text-blue-500"
        />
        <PrimaryMetricCard
          icon={<TrendingUp className="w-7 h-7" />}
          label="Percentile"
          value={`${results.percentile.toFixed(2)}%`}
          colorClass="text-purple-500"
        />
        <PrimaryMetricCard
          icon={<Target className="w-7 h-7" />}
          label="Accuracy"
          value={`${accuracy.toFixed(2)}%`}
          colorClass="text-yellow-500"
        />
      </div>

      {/* Tier 2: Secondary Metrics & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <SecondaryMetricCard icon={<Check className="w-5 h-5" />} label="Correct" value={correct} />
            <SecondaryMetricCard icon={<X className="w-5 h-5" />} label="Incorrect" value={incorrect} />
            <SecondaryMetricCard icon={<HelpCircle className="w-5 h-5" />} label="Skipped" value={skipped} />
            <SecondaryMetricCard icon={<CheckCircle className="w-5 h-5" />} label="Attempt Rate" value={`${attemptRate.toFixed(1)}%`} />
            <SecondaryMetricCard icon={<Hash className="w-5 h-5" />} label="Total Questions" value={totalQuestions} />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-700/50 min-h-[200px]">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">Question Breakdown</h3>
          <div className="w-full h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalPerformanceHeader
