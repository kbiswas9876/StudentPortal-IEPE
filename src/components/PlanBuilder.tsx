'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import BookAccordion from './BookAccordion'
import { Database } from '@/types/database'

type BookSource = Database['public']['Tables']['book_sources']['Row']

interface PlanBuilderProps {
  planType: 'daily' | 'weekly' | 'monthly'
  onContentChange: (content: any[]) => void
}

interface DayConfig {
  id: string
  name: string
  questionIds: string[]
  totalQuestions: number
}

export default function PlanBuilder({
  planType,
  onContentChange
}: PlanBuilderProps) {
  const [books, setBooks] = useState<BookSource[]>([])
  const [days, setDays] = useState<DayConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    // Notify parent of content changes
    onContentChange(days)
  }, [days, onContentChange])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/books')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch books')
      }

      setBooks(result.data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDay = () => {
    const dayNumber = days.length + 1
    const newDay: DayConfig = {
      id: `day-${Date.now()}`,
      name: `Day ${dayNumber}`,
      questionIds: [],
      totalQuestions: 0
    }
    setDays([...days, newDay])
  }

  const removeDay = (dayId: string) => {
    setDays(days.filter(day => day.id !== dayId))
  }

  const updateDayConfig = (dayId: string, questionIds: string[], totalQuestions: number) => {
    setDays(days.map(day => 
      day.id === dayId 
        ? { ...day, questionIds, totalQuestions }
        : day
    ))
  }

  const getTotalQuestions = () => {
    return days.reduce((total, day) => total + day.totalQuestions, 0)
  }

  const getPlanTypeLabel = () => {
    switch (planType) {
      case 'daily':
        return 'Daily sessions'
      case 'weekly':
        return 'Weekly sessions'
      case 'monthly':
        return 'Monthly sessions'
      default:
        return 'Sessions'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Plan Content Builder
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure the questions for each {getPlanTypeLabel().toLowerCase()}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addDay}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Day
        </motion.button>
      </div>

      {/* Days List */}
      <div className="space-y-4">
        <AnimatePresence>
          {days.map((day, index) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {day.name}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {day.totalQuestions} questions selected
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeDay(day.id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Day Content */}
              <div className="p-4">
                <PlanDayBuilder
                  dayId={day.id}
                  books={books}
                  loading={loading}
                  onConfigChange={(questionIds, totalQuestions) => 
                    updateDayConfig(day.id, questionIds, totalQuestions)
                  }
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {days.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Plan Summary
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {days.length} {getPlanTypeLabel().toLowerCase()} • {getTotalQuestions()} total questions
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                {getTotalQuestions()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                questions
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {days.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📅</div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Days Added Yet
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Click "Add Day" to start building your practice plan
          </p>
        </motion.div>
      )}
    </div>
  )
}

// Individual Day Builder Component
interface PlanDayBuilderProps {
  dayId: string
  books: BookSource[]
  loading: boolean
  onConfigChange: (questionIds: string[], totalQuestions: number) => void
}

function PlanDayBuilder({
  dayId,
  books,
  loading,
  onConfigChange
}: PlanDayBuilderProps) {
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)

  const handleSessionConfigChange = (config: any) => {
    // Extract question IDs from the session configuration
    const ids: string[] = []
    if (config && config.chapters) {
      Object.values(config.chapters).forEach((chapter: any) => {
        if (chapter.selected && chapter.questionIds) {
          ids.push(...chapter.questionIds)
        }
      })
    }
    setQuestionIds(ids)
    setTotalQuestions(ids.length)
    onConfigChange(ids, ids.length)
  }

  const handleTotalQuestionsChange = (total: number) => {
    setTotalQuestions(total)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading books...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BookAccordion
        books={books}
        onSessionStart={() => {}} // Not used in plan builder
        onTotalQuestionsChange={handleTotalQuestionsChange}
        onSessionConfigChange={handleSessionConfigChange}
      />
    </div>
  )
}
