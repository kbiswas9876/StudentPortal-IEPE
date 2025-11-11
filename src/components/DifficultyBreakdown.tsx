'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SessionResult } from './PerformanceAnalysisDashboard'
import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row'] & { difficulty?: 'Easy' | 'Medium' | 'Hard' }

interface DifficultyBreakdownProps {
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
    const difficulty = question?.difficulty || 'Medium' // Default to Medium if not specified

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
const DifficultyBreakdown: React.FC<DifficultyBreakdownProps> = ({ sessionResult, className }) => {
  const data = useMemo(() => calculateDifficultyBreakdown(sessionResult), [sessionResult])

  if (!data.some(d => d.total > 0)) {
    return null // Don't render if there's no data
  }

  return (
    <div className={className || ''}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Difficulty-wise Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip
                cursor={{ fill: 'rgba(240, 240, 240, 0.1)' }}
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(200, 200, 200, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#333'
                }}
              />
              <Legend />
              <Bar dataKey="correct" stackId="a" fill="#22c55e" name="Correct" />
              <Bar dataKey="incorrect" stackId="a" fill="#ef4444" name="Incorrect" />
              <Bar dataKey="skipped" stackId="a" fill="#64748b" name="Skipped" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Table */}
        <div>
          <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-700/80">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Difficulty</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Correct</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Incorrect</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Skipped</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.map(item => {
                  const attempted = item.correct + item.incorrect
                  const accuracy = attempted > 0 ? (item.correct / attempted) * 100 : 0
                  return (
                    <tr key={item.name} className="odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{item.correct}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{item.incorrect}</td>
                      <td className="px-4 py-3 text-center text-slate-500 font-medium">{item.skipped}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{accuracy.toFixed(1)}%</td>
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

export default DifficultyBreakdown
