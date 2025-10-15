'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Database } from '@/types/database'
import QuestionSummaryCard from './QuestionSummaryCard'

type BookmarkedQuestion = {
  id: number
  user_id: string
  question_id: string
  book_source: string
  chapter_name: string
  custom_tags: string[]
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
  question_number_in_book: number
  question_text: string
  options: any
  correct_option: string
  solution_text: string | null
  exam_metadata: any
  admin_tags: string[] | null
  difficulty: string | null
  personal_note: string | null
  bookmark_id: string
  performance: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

interface FilterState {
  bookSource: string
  chapter: string
  customTags: string[]
}

interface RevisionHubBookAccordionProps {
  bookmarkedQuestions: BookmarkedQuestion[]
  filters: FilterState
  onEditBookmark: (bookmark: BookmarkedQuestion) => void
  onDeleteBookmark: (bookmarkId: string) => void
}

export default function RevisionHubBookAccordion({
  bookmarkedQuestions,
  filters,
  onEditBookmark,
  onDeleteBookmark
}: RevisionHubBookAccordionProps) {
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  // Filter questions based on current filters
  const filteredQuestions = bookmarkedQuestions.filter(bookmark => {
    const question = bookmark.questions
    
    // Filter by book source
    if (filters.bookSource && question.book_source !== filters.bookSource) {
      return false
    }
    
    // Filter by chapter
    if (filters.chapter && question.chapter_name !== filters.chapter) {
      return false
    }
    
    // Filter by custom tags
    if (filters.customTags.length > 0) {
      const bookmarkTags = bookmark.custom_tags || []
      const hasMatchingTag = filters.customTags.some(tag => 
        bookmarkTags.includes(tag)
      )
      if (!hasMatchingTag) {
        return false
      }
    }
    
    return true
  })

  // Group questions by book source
  const groupedByBook = filteredQuestions.reduce((acc, bookmark) => {
    const bookSource = bookmark.questions.book_source
    if (!acc[bookSource]) {
      acc[bookSource] = []
    }
    acc[bookSource].push(bookmark)
    return acc
  }, {} as Record<string, BookmarkedQuestion[]>)

  // Group questions within each book by chapter
  const groupedByBookAndChapter = Object.entries(groupedByBook).reduce((acc, [bookSource, questions]) => {
    const chapterGroups = questions.reduce((chapterAcc, bookmark) => {
      const chapter = bookmark.questions.chapter_name
      if (!chapterAcc[chapter]) {
        chapterAcc[chapter] = []
      }
      chapterAcc[chapter].push(bookmark)
      return chapterAcc
    }, {} as Record<string, BookmarkedQuestion[]>)

    acc[bookSource] = chapterGroups
    return acc
  }, {} as Record<string, Record<string, BookmarkedQuestion[]>>)

  const toggleBook = (bookSource: string) => {
    const newExpanded = new Set(expandedBooks)
    if (newExpanded.has(bookSource)) {
      newExpanded.delete(bookSource)
    } else {
      newExpanded.add(bookSource)
    }
    setExpandedBooks(newExpanded)
  }

  const toggleChapter = (bookSource: string, chapter: string) => {
    const key = `${bookSource}-${chapter}`
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedChapters(newExpanded)
  }

  if (filteredQuestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12"
      >
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Questions Match Your Filters
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your filters to see more questions.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedByBookAndChapter).map(([bookSource, chapterGroups], bookIndex) => {
        const totalQuestionsInBook = Object.values(chapterGroups).flat().length
        const isBookExpanded = expandedBooks.has(bookSource)

        return (
          <motion.div
            key={bookSource}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: bookIndex * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Book Header */}
            <button
              onClick={() => toggleBook(bookSource)}
              className="w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isBookExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRightIcon className="h-5 w-5 text-slate-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {bookSource}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {totalQuestionsInBook} question{totalQuestionsInBook !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {Object.keys(chapterGroups).length} chapter{Object.keys(chapterGroups).length !== 1 ? 's' : ''}
                </div>
              </div>
            </button>

            {/* Book Content */}
            <AnimatePresence>
              {isBookExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="p-6 space-y-4">
                    {Object.entries(chapterGroups).map(([chapter, questions], chapterIndex) => {
                      const key = `${bookSource}-${chapter}`
                      const isChapterExpanded = expandedChapters.has(key)

                      return (
                        <div key={chapter} className="border border-slate-200 dark:border-slate-600 rounded-lg">
                          {/* Chapter Header */}
                          <button
                            onClick={() => toggleChapter(bookSource, chapter)}
                            className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  animate={{ rotate: isChapterExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRightIcon className="h-4 w-4 text-slate-500" />
                                </motion.div>
                                <div>
                                  <h4 className="text-md font-medium text-slate-900 dark:text-slate-100">
                                    {chapter}
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Chapter Content */}
                          <AnimatePresence>
                            {isChapterExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-slate-200 dark:border-slate-600"
                              >
                                <div className="p-4 space-y-3">
                                  {questions.map((bookmark, questionIndex) => (
                                    <motion.div
                                      key={bookmark.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: questionIndex * 0.05 }}
                                    >
                                      <QuestionSummaryCard
                                        question={bookmark}
                                        onEdit={() => onEditBookmark(bookmark)}
                                        onDelete={() => onDeleteBookmark(bookmark.id.toString())}
                                        onViewSolution={() => {}}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}