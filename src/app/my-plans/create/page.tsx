'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import { ChevronLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

type Book = Database['public']['Tables']['books']['Row']
type Chapter = Database['public']['Tables']['chapters']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface PlanDay {
  id: string
  name: string
  selectedBooks: string[]
  selectedChapters: string[]
  selectedQuestions: string[]
  questionCount: number
}

interface PlanBuilderData {
  name: string
  planType: 'daily' | 'weekly' | 'monthly'
  days: PlanDay[]
}

export default function CreatePlanPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [books, setBooks] = useState<Book[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  
  const [planData, setPlanData] = useState<PlanBuilderData>({
    name: '',
    planType: 'daily',
    days: []
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchData()
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching books for plan builder')

      // Fetch books (including custom books if user is logged in)
      const booksUrl = user ? `/api/books?userId=${user.id}&includeCustom=true` : '/api/books'
      const booksResponse = await fetch(booksUrl)
      const booksResult = await booksResponse.json()
      if (!booksResponse.ok) {
        throw new Error(booksResult.error || 'Failed to fetch books')
      }

      console.log('Books fetched successfully for plan builder')
      setBooks(booksResult.data || [])
    } catch (error) {
      console.error('Error fetching data for plan builder:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchChaptersForBook = async (bookId: string) => {
    try {
      console.log('Fetching chapters for book:', bookId)
      
      // Check if it's a custom book
      if (bookId.startsWith('custom-')) {
        // For custom books, we don't have chapters, so return empty array
        setChapters([])
        return
      }

      const chaptersResponse = await fetch(`/api/chapters?bookCode=${bookId}`)
      const chaptersResult = await chaptersResponse.json()
      if (!chaptersResponse.ok) {
        throw new Error(chaptersResult.error || 'Failed to fetch chapters')
      }

      console.log('Chapters fetched successfully:', chaptersResult.data)
      setChapters(chaptersResult.data || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setChapters([])
    }
  }

  const fetchQuestionsForBook = async (bookId: string) => {
    try {
      console.log('Fetching questions for book:', bookId)
      
      // Check if it's a custom book
      if (bookId.startsWith('custom-')) {
        const bookName = bookId.replace('custom-', '')
        const questionsResponse = await fetch(`/api/user-content/questions?userId=${user?.id}&bookName=${encodeURIComponent(bookName)}`)
        const questionsResult = await questionsResponse.json()
        if (!questionsResponse.ok) {
          throw new Error(questionsResult.error || 'Failed to fetch custom book questions')
        }
        setQuestions(questionsResult.data || [])
      } else {
        const questionsResponse = await fetch(`/api/questions?bookCode=${bookId}`)
        const questionsResult = await questionsResponse.json()
        if (!questionsResponse.ok) {
          throw new Error(questionsResult.error || 'Failed to fetch questions')
        }
        setQuestions(questionsResult.data || [])
      }

      console.log('Questions fetched successfully')
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    }
  }

  const addDay = () => {
    const newDay: PlanDay = {
      id: `day-${Date.now()}`,
      name: `Day ${planData.days.length + 1}`,
      selectedBooks: [],
      selectedChapters: [],
      selectedQuestions: [],
      questionCount: 0
    }
    
    setPlanData(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }))
  }

  const removeDay = (dayId: string) => {
    setPlanData(prev => ({
      ...prev,
      days: prev.days.filter(day => day.id !== dayId)
    }))
  }

  const updateDay = (dayId: string, updates: Partial<PlanDay>) => {
    setPlanData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, ...updates } : day
      )
    }))
  }

  const handleSavePlan = async () => {
    if (!user) return

    try {
      setSaving(true)
      console.log('Saving practice plan:', planData.name)

      const response = await fetch('/api/practice-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          name: planData.name,
          plan_type: planData.planType,
          content: {
            days: planData.days.map(day => ({
              id: day.id,
              name: day.name,
              selectedBooks: day.selectedBooks,
              selectedChapters: day.selectedChapters,
              selectedQuestions: day.selectedQuestions,
              questionCount: day.questionCount
            }))
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save practice plan')
      }

      console.log('Practice plan saved successfully:', result.data.id)
      router.push('/my-plans')
    } catch (error) {
      console.error('Error saving practice plan:', error)
      setError(error instanceof Error ? error.message : 'Failed to save practice plan')
    } finally {
      setSaving(false)
    }
  }

  const getFilteredQuestions = (day: PlanDay) => {
    if (!selectedBookId) return []
    
    // For custom books, return all questions
    if (selectedBookId.startsWith('custom-')) {
      return questions
    }
    
    // For official books, filter by selected chapters
    return questions.filter(question => {
      const chapterMatch = day.selectedChapters.length === 0 || day.selectedChapters.includes(question.chapter_id)
      return chapterMatch
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading plan builder...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Plan Builder</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/my-plans')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to My Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/my-plans')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Create Practice Plan
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Build a structured study plan with multiple practice sessions
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Plan Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Plan Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={planData.name}
                  onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Week 1 - Arithmetic Focus"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plan Type
                </label>
                <select
                  value={planData.planType}
                  onChange={(e) => setPlanData(prev => ({ ...prev, planType: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Plan Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Plan Days ({planData.days.length})
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addDay}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Day</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {planData.days.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={day.name}
                        onChange={(e) => updateDay(day.id, { name: e.target.value })}
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => removeDay(day.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Books Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Select Book
                        </label>
                        <select
                          value={selectedBookId || ''}
                          onChange={(e) => {
                            const bookId = e.target.value
                            setSelectedBookId(bookId)
                            if (bookId) {
                              fetchChaptersForBook(bookId)
                              fetchQuestionsForBook(bookId)
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a book...</option>
                          {books.map(book => (
                            <option key={book.id} value={book.id}>
                              {book.type === 'custom' ? '📚 ' : '📖 '}{book.name}
                              {book.type === 'custom' && book.question_count && ` (${book.question_count} questions)`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chapters Selection (only for official books) */}
                      {selectedBookId && !selectedBookId.startsWith('custom-') && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Chapters
                          </label>
                          <select
                            multiple
                            value={day.selectedChapters}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value)
                              updateDay(day.id, { selectedChapters: selected })
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            size={3}
                          >
                            {chapters.map(chapter => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Questions Preview */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Available Questions
                        </label>
                        <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                          {selectedBookId ? getFilteredQuestions(day).length : 0} questions available
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSavePlan}
              disabled={!planData.name || planData.days.length === 0 || saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Plan'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
