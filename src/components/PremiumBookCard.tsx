'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { ChapterConfiguration } from '@/types/practice'
import CustomCheckbox from './CustomCheckbox'
import InlineChapterConfig from './InlineChapterConfig'

type BookSource = Database['public']['Tables']['book_sources']['Row']
type ChapterData = {
  chapter_name: string
  count: number
}

interface PremiumBookCardProps {
  book: BookSource
  isSelected: boolean
  chapters: ChapterData[]
  loadingChapters: boolean
  chapterConfigs: Record<string, ChapterConfiguration>
  onBookSelect: (bookCode: string) => void
  onChapterSelect: (bookCode: string, chapterName: string, selected: boolean) => void
  onChapterConfigChange: (bookCode: string, chapterName: string, config: ChapterConfiguration) => void
}

export default function PremiumBookCard({
  book,
  isSelected,
  chapters,
  loadingChapters,
  chapterConfigs,
  onBookSelect,
  onChapterSelect,
  onChapterConfigChange
}: PremiumBookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleBookClick = () => {
    onBookSelect(book.code)
    setIsExpanded(!isExpanded)
  }

  const handleChapterSelect = (chapterName: string, selected: boolean) => {
    onChapterSelect(book.code, chapterName, selected)
  }

  const handleChapterConfigChange = (chapterName: string, config: ChapterConfiguration) => {
    onChapterConfigChange(book.code, chapterName, config)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? 'border-blue-500 shadow-xl shadow-blue-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-lg hover:shadow-xl'
      }`}
    >
      {/* Book Card Header */}
      <motion.button
        onClick={handleBookClick}
        className="w-full p-4 text-left transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {book.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Code: {book.code}
            </p>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
              >
                Selected
              </motion.div>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Chapters List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-4">
              {loadingChapters ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
                  {chapters.map((chapter, index) => {
                    const config = chapterConfigs[chapter.chapter_name] || {
                      selected: false,
                      mode: 'quantity' as const,
                      values: { count: 1 }
                    }

                    return (
                      <motion.div
                        key={chapter.chapter_name}
                        className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center">
                          <CustomCheckbox
                            checked={config.selected}
                            onChange={(selected) => handleChapterSelect(chapter.chapter_name, selected)}
                          />
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {chapter.chapter_name}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {chapter.count} questions available
                            </p>
                          </div>
                          
                          <AnimatePresence>
                            {config.selected && (
                              <InlineChapterConfig
                                chapterName={chapter.chapter_name}
                                questionCount={chapter.count}
                                config={config}
                                onConfigChange={(newConfig) => 
                                  handleChapterConfigChange(chapter.chapter_name, newConfig)
                                }
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
