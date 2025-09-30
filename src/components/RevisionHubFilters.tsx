'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, PlayIcon } from '@heroicons/react/24/outline'

interface FilterState {
  bookSource: string
  chapter: string
  customTags: string[]
}

interface RevisionHubFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  bookSources: string[]
  chapters: string[]
  customTags: string[]
  onStartRevisionSession: () => void
  totalQuestions: number
}

export default function RevisionHubFilters({
  filters,
  onFiltersChange,
  bookSources,
  chapters,
  customTags,
  onStartRevisionSession,
  totalQuestions
}: RevisionHubFiltersProps) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleBookSourceChange = (bookSource: string) => {
    onFiltersChange({
      ...filters,
      bookSource,
      chapter: '' // Reset chapter when book source changes
    })
  }

  const handleChapterChange = (chapter: string) => {
    onFiltersChange({
      ...filters,
      chapter
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.customTags.includes(tag)
      ? filters.customTags.filter(t => t !== tag)
      : [...filters.customTags, tag]
    
    onFiltersChange({
      ...filters,
      customTags: newTags
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !filters.customTags.includes(newTag.trim())) {
      onFiltersChange({
        ...filters,
        customTags: [...filters.customTags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const clearFilters = () => {
    onFiltersChange({
      bookSource: '',
      chapter: '',
      customTags: []
    })
  }

  const hasActiveFilters = filters.bookSource || filters.chapter || filters.customTags.length > 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Book Source Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Book Source
            </label>
            <Listbox value={filters.bookSource} onChange={handleBookSourceChange}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-left shadow-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                  <span className="block truncate">
                    {filters.bookSource || 'All Books'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={React.Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                        }`
                      }
                    >
                      All Books
                    </Listbox.Option>
                    {bookSources.map((source) => (
                      <Listbox.Option
                        key={source}
                        value={source}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                          }`
                        }
                      >
                        {source}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Chapter Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chapter
            </label>
            <Listbox value={filters.chapter} onChange={handleChapterChange}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-left shadow-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                  <span className="block truncate">
                    {filters.chapter || 'All Chapters'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={React.Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                        }`
                      }
                    >
                      All Chapters
                    </Listbox.Option>
                    {chapters.map((chapter) => (
                      <Listbox.Option
                        key={chapter}
                        value={chapter}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                          }`
                        }
                      >
                        {chapter}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>

        {/* Custom Tags */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Custom Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {customTags.map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.customTags.includes(tag)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
          
          {/* Add New Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add custom tag..."
              className="flex-1 px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartRevisionSession}
            disabled={totalQuestions === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            Start Revision Session ({totalQuestions})
          </motion.button>
        </div>
      </div>
    </div>
  )
}
