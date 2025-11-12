'use client'

import React, { useEffect, useState } from 'react'
import { Award, Loader2 } from 'lucide-react'

// PerformanceChip component for displaying correct, incorrect, and skipped counts
interface PerformanceChipProps {
  type: 'correct' | 'incorrect' | 'skipped'
  count: number
}

const PerformanceChip: React.FC<PerformanceChipProps> = ({ type, count }) => {
  const config = {
    correct: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: '✓'
    },
    incorrect: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: '✗'
    },
    skipped: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      icon: '→'
    }
  }

  const { bg, text, icon } = config[type]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span>{icon}</span>
      <span>{count}</span>
    </span>
  )
}

// Updated structure for a leaderboard entry based on the new API output
interface LeaderboardEntry {
  rank: number
  name: string
  user_id: string
  marks_obtained: number
  total_marks: number
  correct: number
  incorrect: number
  skipped: number
}

interface LeaderboardProps {
  testId: number | null | undefined
  currentUserId: string | null | undefined
  className?: string
}

const Leaderboard: React.FC<LeaderboardProps> = ({ testId, currentUserId, className }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (testId) {
      fetchLeaderboardData()
    } else {
      setLoading(false)
      setLeaderboardData([])
    }
  }, [testId])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/mock-tests/${testId}/leaderboard?userId=${currentUserId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard data')
      }
      setLeaderboardData(result.data?.leaderboard || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="ml-3 text-slate-600 dark:text-slate-400">Loading Leaderboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 py-8">
        Error: {error}
      </div>
    )
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-8">
        Leaderboard data is not available for this test.
      </div>
    )
  }

  return (
    <div className={className || ''}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Leaderboard</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700/80">
        <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-700/80">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Score</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Performance Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {leaderboardData.map(entry => {
              const isCurrentUser = entry.user_id === currentUserId
              return (
                <tr 
                  key={entry.rank} 
                  className={`transition-colors duration-200 ${
                    isCurrentUser 
                      ? 'bg-indigo-100 dark:bg-indigo-900/40' 
                      : 'odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50'
                  }`}
                >
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center justify-center">
                      {entry.rank === 1 && <span className="mr-2">🥇</span>}
                      {entry.rank === 2 && <span className="mr-2">🥈</span>}
                      {entry.rank === 3 && <span className="mr-2">🥉</span>}
                      {entry.rank}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-slate-800 dark:text-slate-100 ${isCurrentUser ? 'font-bold' : 'font-medium'}`}>
                    {isCurrentUser ? 'YOU' : entry.name}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                    {entry.marks_obtained.toFixed(2)} / {entry.total_marks}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <PerformanceChip type="correct" count={entry.correct} />
                      <PerformanceChip type="incorrect" count={entry.incorrect} />
                      <PerformanceChip type="skipped" count={entry.skipped} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Leaderboard