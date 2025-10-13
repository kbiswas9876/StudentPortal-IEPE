'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookmarkIcon } from '@heroicons/react/24/outline'

interface ChapterData {
  name: string
  count: number
}

interface RevisionChapterNavProps {
  chapters: ChapterData[]
  selectedChapter: string | null
  onSelectChapter: (chapter: string) => void
  isLoading: boolean
}

export default function RevisionChapterNav({
  chapters,
  selectedChapter,
  onSelectChapter,
  isLoading
}: RevisionChapterNavProps) {
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

  if (chapters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <BookmarkIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Chapters
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} with bookmarks
        </p>

        <div className="space-y-2">
          {chapters.map((chapter, index) => {
            const isSelected = selectedChapter === chapter.name

            return (
              <motion.button
                key={chapter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectChapter(chapter.name)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium line-clamp-2 flex-1">
                    {chapter.name}
                  </span>
                  <span
                    className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {chapter.count}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
