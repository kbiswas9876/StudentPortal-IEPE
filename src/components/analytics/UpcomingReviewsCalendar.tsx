'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import InformationalTooltip from './InformationalTooltip'

interface ForecastDay {
  date: string
  count: number
}

interface UpcomingReviewsCalendarProps {
  forecast: ForecastDay[]
}

export default function UpcomingReviewsCalendar({ forecast }: UpcomingReviewsCalendarProps) {
  // Format date to display (e.g., "Mon, Jan 1")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    const isTomorrow = date.toISOString().split('T')[0] === tomorrow.toISOString().split('T')[0]

    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const maxCount = Math.max(...forecast.map(day => day.count), 1)
  const totalReviews = forecast.reduce((sum, day) => sum + day.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Empty State */}
      {totalReviews === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Your week is clear!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Start a new <strong>Practice</strong> session to learn more questions and fill up your review schedule.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Reviews
                </h3>
                <InformationalTooltip content="This is your 7-day forecast. Our smart system schedules questions for you on the exact day you're about to forget them. Completing your daily reviews is the best way to build a strong, lasting memory." />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Next 7 days forecast
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </div>

      {/* Forecast Bars */}
      <div className="space-y-3">
        {forecast.map((day, index) => {
          const heightPercentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const isToday = index === 0

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isToday 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700' 
                  : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {/* Date Label */}
              <div className="w-28 flex-shrink-0">
                <p className={`text-sm font-semibold ${
                  isToday 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {formatDate(day.date)}
                </p>
              </div>

              {/* Bar */}
              <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${heightPercentage}%` }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05, ease: 'easeOut' }}
                  className={`h-full ${
                    isToday
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : day.count > 0
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              </div>

              {/* Count */}
              <div className="w-12 text-right flex-shrink-0">
                <p className={`text-lg font-bold ${
                  isToday
                    ? 'text-blue-700 dark:text-blue-300'
                    : day.count > 0
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {day.count}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
            <p className="text-xs text-center text-slate-700 dark:text-slate-300">
              {forecast[0]?.count > 0
                ? `${forecast[0].count} question${forecast[0].count !== 1 ? 's' : ''} due today! Time to review.`
                : "No reviews due today. You're all caught up! 🎉"}
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

