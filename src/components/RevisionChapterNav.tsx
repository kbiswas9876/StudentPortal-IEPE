'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface ChapterData {
  name: string
  count: number
}

interface BookChapters {
  chapters: ChapterData[]
  totalBookmarks: number
}

interface RevisionChapterNavProps {
  chaptersData: Record<string, BookChapters>
  selectedBook: string | null
  selectedChapter: string | null
  onSelectChapter: (book: string, chapter: string) => void
  isLoading: boolean
}

export default function RevisionChapterNav({
  chaptersData,
  selectedBook,
  selectedChapter,
  onSelectChapter,
  isLoading
}: RevisionChapterNavProps) {
  const [expandedBooks, setExpandedBooks] = React.useState<Set<string>>(new Set())

  // Auto-expand the first book on mount
  React.useEffect(() => {
    const books = Object.keys(chaptersData)
    if (books.length > 0 && expandedBooks.size === 0) {
      setExpandedBooks(new Set([books[0]]))
    }
  }, [chaptersData, expandedBooks.size])

  const toggleBookExpansion = (book: string) => {
    const newExpanded = new Set(expandedBooks)
    if (newExpanded.has(book)) {
      newExpanded.delete(book)
    } else {
      newExpanded.add(book)
    }
    setExpandedBooks(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading chapters...</p>
        </div>
      </div>
    )
  }

  const books = Object.keys(chaptersData).sort()

  if (books.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No bookmarked chapters yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Bookmarked Chapters
        </h2>

        <div className="space-y-2">
          {books.map((book) => {
            const bookData = chaptersData[book]
            const isExpanded = expandedBooks.has(book)

            return (
              <div
                key={book}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Book Header */}
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  onClick={() => toggleBookExpansion(book)}
                  className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {book}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {bookData.totalBookmarks} bookmark{bookData.totalBookmarks !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  </motion.div>
                </motion.button>

                {/* Chapters List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-2 space-y-1">
                        {bookData.chapters.map((chapter) => {
                          const isSelected = selectedBook === book && selectedChapter === chapter.name

                          return (
                            <motion.button
                              key={chapter.name}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => onSelectChapter(book, chapter.name)}
                              className={`w-full px-3 py-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium line-clamp-1">
                                  {chapter.name}
                                </span>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isSelected
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {chapter.count}
                                </span>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

