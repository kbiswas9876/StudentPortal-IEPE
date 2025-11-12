'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SessionResult } from './PerformanceAnalysisDashboard'
import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']

interface PerformanceDifficultyBreakdownProps {
  sessionResult: SessionResult
  className?: string
}

interface DifficultyStats {
  name: 'Easy' | 'Medium' | 'Hard'
  correct: number
  incorrect: number
  skipped: number
  total: number
}

// --- Calculation Logic ---
function calculateDifficultyBreakdown(session: SessionResult): DifficultyStats[] {
  const { answerLog, questions } = session
  if (!answerLog || !questions) return []

  const questionById = new Map<number, Question>()
  questions.forEach(q => questionById.set(q.id, q))

  const stats: Record<'Easy' | 'Medium' | 'Hard', Omit<DifficultyStats, 'name'>> = {
    Easy: { correct: 0, incorrect: 0, skipped: 0, total: 0 },
    Medium: { correct: 0, incorrect: 0, skipped: 0, total: 0 },
    Hard: { correct: 0, incorrect: 0, skipped: 0, total: 0 },
  }

  answerLog.forEach(answer => {
    const question = questionById.get(answer.question_id)
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium' // Default to Medium if not specified
    
    // Map database difficulty values to our three categories
    if (question?.difficulty) {
      if (question.difficulty === 'Easy' || question.difficulty === 'Easy-Moderate') {
        difficulty = 'Easy'
      } else if (question.difficulty === 'Hard' || question.difficulty === 'Moderate-Hard') {
        difficulty = 'Hard'
      } else {
        difficulty = 'Medium'
      }
    }

    stats[difficulty].total++
    if (answer.status === 'correct') {
      stats[difficulty].correct++
    } else if (answer.status === 'incorrect') {
      stats[difficulty].incorrect++
    } else {
      stats[difficulty].skipped++
    }
  })

  return [
    { name: 'Easy', ...stats.Easy },
    { name: 'Medium', ...stats.Medium },
    { name: 'Hard', ...stats.Hard },
  ]
}

// --- Main Component ---
const PerformanceDifficultyBreakdown: React.FC<PerformanceDifficultyBreakdownProps> = ({ sessionResult, className }) => {
  const data = useMemo(() => calculateDifficultyBreakdown(sessionResult), [sessionResult])

  if (!data.some(d => d.total > 0)) {
    return null // Don't render if there's no data
  }

  return (
    <div className={className || ''}>
      <div className="flex items-center space-x-3 mb-5">
        <div className="h-8 w-1 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Difficulty-wise Performance</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="h-72 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip
                cursor={{ fill: 'rgba(240, 240, 240, 0.1)' }}
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(200, 200, 200, 0.5)',
                  borderRadius: '0.75rem',
                  color: '#333',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="correct" stackId="a" fill="#22c55e" name="Correct" radius={[0, 4, 4, 0]} />
              <Bar dataKey="incorrect" stackId="a" fill="#ef4444" name="Incorrect" radius={[0, 4, 4, 0]} />
              <Bar dataKey="skipped" stackId="a" fill="#64748b" name="Skipped" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Table */}
        <div>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-700/80">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Difficulty</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Correct</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Incorrect</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Skipped</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.map(item => {
                  const attempted = item.correct + item.incorrect
                  const accuracy = attempted > 0 ? (item.correct / attempted) * 100 : 0
                  const difficultyColors = {
                    Easy: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
                    Medium: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
                    Hard: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  }
                  return (
                    <tr key={item.name} className="group odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-all duration-200">
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${difficultyColors[item.name]}`}>
                          {item.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30">
                          {item.correct}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
                          {item.incorrect}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50">
                          {item.skipped}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30">
                          {accuracy.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDifficultyBreakdown
