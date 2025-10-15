'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrophyIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'

interface LeaderboardEntry {
  user_id: string
  score_percentage: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  submitted_at: string
  rank: number
  percentile: number
  user_name?: string
}

interface LeaderboardProps {
  testId: number
  currentUserId: string
}

export default function Leaderboard({ testId, currentUserId }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [testId])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching leaderboard data for test:', testId)

      const response = await fetch(`/api/mock-tests/${testId}/leaderboard?userId=${currentUserId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard data')
      }

      console.log('Leaderboard data fetched successfully:', result.data)
      setLeaderboardData(result.data.leaderboard)
      setUserRank(result.data.userRank)
      setTotalParticipants(result.data.totalParticipants)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <TrophyIcon className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <TrophyIcon className="h-5 w-5 text-amber-600" />
    return <span className="text-slate-400 font-bold">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Leaderboard</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Results Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Be the first to complete this test and appear on the leaderboard!
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalParticipants}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200">Total Participants</div>
        </div>
        {userRank && (
          <>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                #{userRank.rank}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">Your Rank</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userRank.percentile}%
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Percentile</div>
            </div>
          </>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Leaderboard
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {leaderboardData.map((entry, index) => (
                <motion.tr
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${
                    entry.user_id === currentUserId 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  } transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          entry.user_id === currentUserId 
                            ? 'text-blue-900 dark:text-blue-100 font-bold' 
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {entry.user_id === currentUserId ? 'You' : `Participant ${entry.rank}`}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {entry.percentile}th percentile
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${
                      entry.user_id === currentUserId 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {entry.score_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <div>{entry.total_correct} correct</div>
                      <div>{entry.total_incorrect} incorrect</div>
                      <div>{entry.total_skipped} skipped</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDate(entry.submitted_at)}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
