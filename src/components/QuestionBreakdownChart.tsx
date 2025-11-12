'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { SessionResult } from './PerformanceAnalysisDashboard'

interface QuestionBreakdownChartProps {
  sessionResult: SessionResult
  className?: string
}

const QuestionBreakdownChart: React.FC<QuestionBreakdownChartProps> = ({ 
  sessionResult, 
  className = '' 
}) => {
  const { answerLog } = sessionResult

  // Calculate question status counts
  const correct = answerLog.filter(a => a.status === 'correct').length
  const incorrect = answerLog.filter(a => a.status === 'incorrect').length
  const skipped = answerLog.filter(a => a.status === 'skipped').length

  // Data for doughnut chart
  const data = [
    { name: 'Correct', value: correct },
    { name: 'Incorrect', value: incorrect },
    { name: 'Skipped', value: skipped },
  ]

  // Color scheme matching the design system
  const COLORS = ['#22c55e', '#ef4444', '#64748b']

  const total = correct + incorrect + skipped

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Question Breakdown
        </h3>
      </div>
      
      <div className="w-full h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]}
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend 
              iconSize={12} 
              wrapperStyle={{ 
                fontSize: '14px',
                fontWeight: '600'
              }}
              verticalAlign="bottom"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text showing total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -mt-8">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{total}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{correct}</div>
          <div className="text-xs font-medium text-green-600 dark:text-green-500 uppercase">Correct</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{incorrect}</div>
          <div className="text-xs font-medium text-red-600 dark:text-red-500 uppercase">Incorrect</div>
        </div>
        <div className="text-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{skipped}</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Skipped</div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBreakdownChart
