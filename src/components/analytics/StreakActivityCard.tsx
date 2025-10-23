'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

interface DayActivity {
  date: string
  count: number
}

interface StreakActivityCardProps {
  currentStreak: number
  longestStreak: number
  last90Days: DayActivity[]
}

export default function StreakActivityCard({ 
  currentStreak, 
  longestStreak, 
  last90Days 
}: StreakActivityCardProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Determine color level based on review count
  const getColorLevel = (count: number): number => {
    if (count === 0) return 0
    if (count <= 5) return 1
    if (count <= 15) return 2
    return 3
  }

  // Get color classes for each level
  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-slate-200 dark:bg-slate-700' // No activity
      case 1: return 'bg-purple-300 dark:bg-purple-600' // Light
      case 2: return 'bg-purple-500 dark:bg-purple-500' // Medium
      case 3: return 'bg-purple-700 dark:bg-purple-400' // Dark
      default: return 'bg-slate-200 dark:bg-slate-700'
    }
  }

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle hover with position tracking
  const handleMouseEnter = (day: DayActivity, event: React.MouseEvent) => {
    setHoveredDay(day)
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  // Organize days into weeks (7 days per row)
  const weeks: DayActivity[][] = []
  for (let i = 0; i < last90Days.length; i += 7) {
    weeks.push(last90Days.slice(i, i + 7))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg col-span-full"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Streak Counters */}
        <div className="lg:w-64 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Review Activity
          </h3>
          
          {/* Current Streak */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Flame className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {currentStreak}
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Day Streak
                </p>
              </div>
            </div>
            {currentStreak > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                {currentStreak === 1 
                  ? "Great start! Keep it up tomorrow."
                  : currentStreak < 7
                  ? "Building momentum! Keep going."
                  : currentStreak < 30
                  ? "Amazing consistency! 🔥"
                  : "Legendary dedication! 🏆"}
              </p>
            )}
          </motion.div>

          {/* Longest Streak */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg">
                <Trophy className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {longestStreak}
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Longest Streak
                </p>
              </div>
            </div>
          </motion.div>

          {currentStreak === 0 && longestStreak === 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 Complete a review today to start your streak!
              </p>
            </div>
          )}
        </div>

        {/* Right: 90-Day Heatmap */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Last 90 Days
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hover over squares to see details
            </p>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-2 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-2">
                {week.map((day, dayIndex) => {
                  const level = getColorLevel(day.count)
                  const colorClass = getColorClass(level)
                  
                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: (weekIndex * 7 + dayIndex) * 0.005,
                        duration: 0.2 
                      }}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-sm ${colorClass} transition-all duration-200 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 dark:hover:ring-offset-slate-800 cursor-pointer`}
                      title={`${day.count} reviews on ${formatDate(day.date)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed z-50 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="font-semibold">
                {hoveredDay.count} review{hoveredDay.count !== 1 ? 's' : ''}
              </p>
              <p className="text-slate-300 dark:text-slate-400">
                {formatDate(hoveredDay.date)}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

