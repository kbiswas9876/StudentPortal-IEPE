'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FunnelIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  BookOpenIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'

interface FilterOptions {
  bookSource: string
  chapter: string
  customTags: string[]
  searchQuery: string
}

interface RevisionHubFiltersProps {
  bookmarkedQuestions: any[]
  onFiltersChange: (filters: FilterOptions) => void
  onStartRevisionSession: () => void
  isLoading: boolean
}

export default function RevisionHubFilters({
  bookmarkedQuestions,
  onFiltersChange,
  onStartRevisionSession,
  isLoading
}: RevisionHubFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    bookSource: '',
    chapter: '',
    customTags: [],
    searchQuery: ''
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Extract unique values for filter options
  const bookSources = Array.from(new Set(bookmarkedQuestions.map(q => q.book_source))).sort()
  const chapters = Array.from(new Set(bookmarkedQuestions.map(q => q.chapter_name))).sort()
  const allCustomTags = Array.from(new Set(
    bookmarkedQuestions
      .filter(q => q.custom_tags && q.custom_tags.length > 0)
      .flatMap(q => q.custom_tags)
  )).sort()

  // Filter chapters based on selected book source
  const filteredChapters = filters.bookSource 
    ? chapters.filter(chapter => 
        bookmarkedQuestions.some(q => 
          q.book_source === filters.bookSource && q.chapter_name === chapter
        )
      )
    : chapters

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.customTags.includes(tag)
      ? filters.customTags.filter(t => t !== tag)
      : [...filters.customTags, tag]
    handleFilterChange('customTags', newTags)
  }

  const clearFilters = () => {
    const clearedFilters = {
      bookSource: '',
      chapter: '',
      customTags: [],
      searchQuery: ''
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.bookSource || filters.chapter || filters.customTags.length > 0 || filters.searchQuery

  // Calculate filtered questions count
  const filteredQuestions = bookmarkedQuestions.filter(question => {
    if (filters.searchQuery && !question.question_text.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false
    }
    if (filters.bookSource && question.book_source !== filters.bookSource) {
      return false
    }
    if (filters.chapter && question.chapter_name !== filters.chapter) {
      return false
    }
    if (filters.customTags.length > 0) {
      const questionTags = question.custom_tags || []
      const hasMatchingTag = filters.customTags.some(tag => questionTags.includes(tag))
      if (!hasMatchingTag) return false
    }
    return true
  })

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filter & Search
            </h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                {filteredQuestions.length} of {bookmarkedQuestions.length} questions
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Clear Filters
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronUpDownIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Expandable Filters */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 space-y-4">
          {/* Book Source Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <BookOpenIcon className="inline h-4 w-4 mr-1" />
              Book Source
            </label>
            <Listbox value={filters.bookSource} onChange={(value) => handleFilterChange('bookSource', value)}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-left shadow-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="block truncate text-slate-900 dark:text-slate-100">
                    {filters.bookSource || 'All Book Sources'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  leave="transition duration-100 ease-in"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            All Book Sources
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
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
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {source}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Chapter Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <DocumentTextIcon className="inline h-4 w-4 mr-1" />
              Chapter
            </label>
            <Listbox 
              value={filters.chapter} 
              onChange={(value) => handleFilterChange('chapter', value)}
              disabled={!filters.bookSource}
            >
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-left shadow-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="block truncate text-slate-900 dark:text-slate-100">
                    {filters.chapter || 'All Chapters'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  leave="transition duration-100 ease-in"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            All Chapters
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                    {filteredChapters.map((chapter) => (
                      <Listbox.Option
                        key={chapter}
                        value={chapter}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {chapter}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Custom Tags Filter */}
          {allCustomTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <TagIcon className="inline h-4 w-4 mr-1" />
                Custom Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allCustomTags.map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.customTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} selected
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartRevisionSession}
            disabled={filteredQuestions.length === 0 || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Start Revision Session'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}