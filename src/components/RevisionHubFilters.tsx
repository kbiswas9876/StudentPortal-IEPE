'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FilterState {
  bookSource: string
  chapter: string
  customTags: string[]
}

interface RevisionHubFiltersProps {
  bookSources: string[]
  chapters: string[]
  customTags: string[]
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onStartRevision: () => void
  totalQuestions: number
}

export default function RevisionHubFilters({
  bookSources,
  chapters,
  customTags,
  filters,
  onFilterChange,
  onStartRevision,
  totalQuestions
}: RevisionHubFiltersProps) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (newTag.trim() && !filters.customTags.includes(newTag.trim())) {
      onFilterChange({
        customTags: [...filters.customTags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onFilterChange({
      customTags: filters.customTags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const clearAllFilters = () => {
    onFilterChange({
      bookSource: '',
      chapter: '',
      customTags: []
    })
  }

  const hasActiveFilters = filters.bookSource || filters.chapter || filters.customTags.length > 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Book Source Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Book Source
            </label>
            <select
              value={filters.bookSource}
              onChange={(e) => onFilterChange({ bookSource: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Books</option>
              {bookSources.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chapter
            </label>
            <select
              value={filters.chapter}
              onChange={(e) => onFilterChange({ chapter: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Chapters</option>
              {chapters.map(chapter => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Tags Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Custom Tags
            </label>
            <div className="space-y-2">
              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Selected Tags */}
              {filters.customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.customTags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Available Tags */}
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags
                    .filter(tag => !filters.customTags.includes(tag))
                    .slice(0, 5)
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => onFilterChange({
                          customTags: [...filters.customTags, tag]
                        })}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* Start Revision Session */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartRevision}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            Start Revision Session
          </motion.button>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            {totalQuestions} total questions
            {hasActiveFilters && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                (filtered)
              </span>
            )}
          </span>
          {hasActiveFilters && (
            <span className="text-xs">
              {filters.bookSource && `Book: ${filters.bookSource}`}
              {filters.chapter && ` • Chapter: ${filters.chapter}`}
              {filters.customTags.length > 0 && ` • Tags: ${filters.customTags.length}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}