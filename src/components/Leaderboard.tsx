'use client'

import React, { useEffect, useState } from 'react'
import { Award, Loader2 } from 'lucide-react'

// Updated structure for a leaderboard entry based on the new API output
interface LeaderboardEntry {
  rank: number
  name: string
  user_id: string
  score: number
  accuracy: number
  percentile: number
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
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Accuracy</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Percentile</th>
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
                      ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50'
                  }`}
                >
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center justify-center">
                      {entry.rank === 1 && <Award className="w-4 h-4 text-yellow-500 mr-1" />}
                      {entry.rank}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {isCurrentUser ? 'YOU' : entry.name}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                    {(entry.score || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                    {(entry.accuracy || 0).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {(entry.percentile || 0).toFixed(2)}
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