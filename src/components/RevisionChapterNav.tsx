'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { Play, Rocket, Archive } from 'lucide-react'

interface ChapterData {
  name: string
  count: number
}

interface RevisionChapterNavProps {
  chapters: ChapterData[]
  selectedChapter: string | null
  onSelectChapter: (chapter: string) => void
  isLoading: boolean
  selectedChapters: string[]
  onChapterSelectionChange: (chapter: string, selected: boolean) => void
  onSelectAllChapters: () => void
  onDeselectAllChapters: () => void
  onStartRevisionSession: () => void
}

export default function RevisionChapterNav({
  chapters,
  selectedChapter,
  onSelectChapter,
  isLoading,
  selectedChapters,
  onChapterSelectionChange,
  onSelectAllChapters,
  onDeselectAllChapters,
  onStartRevisionSession
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

  // Defensive programming: ensure chapters is always an array
  const safeChapters = Array.isArray(chapters) ? chapters : []

  if (safeChapters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Archive className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No Chapters Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bookmark questions to see your chapters appear here.
          </p>
        </div>
      </div>
    )
  }

  const isAllSelected = selectedChapters.length === safeChapters.length
  const isAnySelected = selectedChapters.length > 0

  return (
    <div className="flex flex-col force-scrollbar" style={{ height: '100%' }}>
      <div className="p-4" style={{ minHeight: '500px' }}>
        {/* Start Revision Session Button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartRevisionSession}
          disabled={!isAnySelected}
          className={`w-full mb-6 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            isAnySelected
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <Rocket className="h-4 w-4" strokeWidth={2.5} />
          Start Revision Session
        </motion.button>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Chapters
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {safeChapters.length} chapter{safeChapters.length !== 1 ? 's' : ''} with bookmarks
        </p>

        {/* Select All / Deselect All */}
        <div className="mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isAllSelected ? onDeselectAllChapters : onSelectAllChapters}
            className="w-full px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </motion.button>
        </div>

        <div className="space-y-2">
          {safeChapters.map((chapter, index) => {
            const isSelected = selectedChapter === chapter.name
            const isChecked = selectedChapters.includes(chapter.name)

            return (
              <motion.div
                key={chapter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                {/* Checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChapterSelectionChange(chapter.name, !isChecked)
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                  }`}
                >
                  {isChecked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Play className="h-3 w-3" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>

                {/* Chapter Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectChapter(chapter.name)}
                  className={`flex-1 px-4 py-3 rounded-lg text-left transition-all ${
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
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
