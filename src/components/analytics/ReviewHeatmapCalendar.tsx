'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import InformationalTooltip from './InformationalTooltip'

interface DayData {
  date: string
  reviewsCompleted: number
  reviewsScheduled: number
}

interface ReviewHeatmapCalendarProps {
  monthlyData: DayData[]
}

export default function ReviewHeatmapCalendar({ monthlyData }: ReviewHeatmapCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Format month/year for display
  const monthYearDisplay = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Create calendar grid data
  const calendarDays: (DayData | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayData = monthlyData.find(d => d.date === dateStr)
    
    calendarDays.push(dayData || { date: dateStr, reviewsCompleted: 0, reviewsScheduled: 0 })
  }

  // Get color intensity based on reviews completed (0-10+ scale)
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800'
    if (count <= 2) return 'bg-green-200 dark:bg-green-900/40'
    if (count <= 5) return 'bg-green-300 dark:bg-green-800/60'
    if (count <= 10) return 'bg-green-400 dark:bg-green-700/80'
    return 'bg-green-500 dark:bg-green-600'
  }

  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  // Check if date is in the past
  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  // Get selected day details
  const selectedDayData = selectedDate ? monthlyData.find(d => d.date === selectedDate) : null

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Monthly Activity
          </h3>
          <InformationalTooltip 
            content="View your review activity for the month. Past days show completed reviews with color intensity, while future days display scheduled reviews. Click on any date to see details."
          />
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
          <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
        
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {monthYearDisplay}
        </h4>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const day = new Date(dayData.date).getDate()
            const isSelected = selectedDate === dayData.date
            const todayFlag = isToday(dayData.date)
            const pastFlag = isPast(dayData.date)
            const hasScheduled = dayData.reviewsScheduled > 0

            return (
              <motion.button
                key={dayData.date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(dayData.date)}
                className={`
                  aspect-square rounded-lg relative transition-all duration-200
                  ${getHeatmapColor(dayData.reviewsCompleted)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800' : ''}
                  ${todayFlag ? 'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-slate-800' : ''}
                  hover:shadow-md
                `}
              >
                {/* Day number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`
                    text-sm font-semibold
                    ${dayData.reviewsCompleted > 5 ? 'text-white' : 'text-slate-700 dark:text-slate-300'}
                  `}>
                    {day}
                  </span>
                  
                  {/* Scheduled reviews indicator (future dates) */}
                  {!pastFlag && hasScheduled && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40" />
          <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-800/60" />
          <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700/80" />
          <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600" />
        </div>
        <span>More</span>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence mode="wait">
        {selectedDate && selectedDayData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h5>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-2">
                {isPast(selectedDate) ? (
                  <>
                    {selectedDayData.reviewsCompleted > 0 ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        ✅ <strong>{selectedDayData.reviewsCompleted}</strong> review{selectedDayData.reviewsCompleted !== 1 ? 's' : ''} completed
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No reviews completed on this day
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {selectedDayData.reviewsScheduled > 0 ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        📅 <strong>{selectedDayData.reviewsScheduled}</strong> review{selectedDayData.reviewsScheduled !== 1 ? 's' : ''} scheduled
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No reviews scheduled for this day
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">This Month</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {monthlyData.reduce((sum, day) => sum + day.reviewsCompleted, 0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">reviews completed</p>
        </div>
        
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Upcoming</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {monthlyData.filter(d => !isPast(d.date)).reduce((sum, day) => sum + day.reviewsScheduled, 0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">reviews scheduled</p>
        </div>
      </div>
    </motion.div>
  )
}

