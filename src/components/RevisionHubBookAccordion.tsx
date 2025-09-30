'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import QuestionSummaryCard from './QuestionSummaryCard'

type BookmarkedQuestion = {
  id: number
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  questions: any
}

interface RevisionHubBookAccordionProps {
  bookmarkedQuestions: BookmarkedQuestion[]
  onEditBookmark: (bookmark: BookmarkedQuestion) => void
  onDeleteBookmark: (bookmarkId: number) => void
}

export default function RevisionHubBookAccordion({
  bookmarkedQuestions,
  onEditBookmark,
  onDeleteBookmark
}: RevisionHubBookAccordionProps) {
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  // Group questions by book source and then by chapter
  const groupedQuestions = bookmarkedQuestions.reduce((acc, bookmark) => {
    const bookSource = bookmark.questions.book_source
    const chapterName = bookmark.questions.chapter_name
    
    if (!acc[bookSource]) {
      acc[bookSource] = {}
    }
    
    if (!acc[bookSource][chapterName]) {
      acc[bookSource][chapterName] = []
    }
    
    acc[bookSource][chapterName].push(bookmark)
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

  const toggleChapter = (chapterKey: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterKey)) {
      newExpanded.delete(chapterKey)
    } else {
      newExpanded.add(chapterKey)
    }
    setExpandedChapters(newExpanded)
  }

  const getTotalQuestionsForBook = (bookSource: string) => {
    return Object.values(groupedQuestions[bookSource] || {}).reduce((total, questions) => total + questions.length, 0)
  }

  const getTotalQuestionsForChapter = (bookSource: string, chapterName: string) => {
    return groupedQuestions[bookSource]?.[chapterName]?.length || 0
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedQuestions).map(([bookSource, chapters]) => (
        <motion.div
          key={bookSource}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Book Header */}
          <button
            onClick={() => toggleBook(bookSource)}
            className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {bookSource}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getTotalQuestionsForBook(bookSource)} bookmarked questions
                </p>
              </div>
              <motion.div
                animate={{ rotate: expandedBooks.has(bookSource) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="h-5 w-5 text-slate-500" />
              </motion.div>
            </div>
          </button>

          {/* Book Content */}
          <AnimatePresence>
            {expandedBooks.has(bookSource) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                <div className="space-y-2">
                  {Object.entries(chapters).map(([chapterName, questions]) => {
                    const chapterKey = `${bookSource}-${chapterName}`
                    return (
                      <div key={chapterKey} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                        {/* Chapter Header */}
                        <button
                          onClick={() => toggleChapter(chapterKey)}
                          className="w-full px-6 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                                {chapterName}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {getTotalQuestionsForChapter(bookSource, chapterName)} questions
                              </p>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedChapters.has(chapterKey) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Chapter Content */}
                        <AnimatePresence>
                          {expandedChapters.has(chapterKey) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-slate-50 dark:bg-slate-900"
                            >
                              <div className="p-4 space-y-3">
                                {questions.map((bookmark) => (
                                  <QuestionSummaryCard
                                    key={bookmark.id}
                                    bookmark={bookmark}
                                    onEdit={() => onEditBookmark(bookmark)}
                                    onDelete={() => onDeleteBookmark(bookmark.id)}
                                  />
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
      ))}
    </div>
  )
}
