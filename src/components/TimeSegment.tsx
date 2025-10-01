'use client'

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface TimeSegmentProps {
  value: string
  onChange: (value: string) => void
  onIncrement: () => void
  onDecrement: () => void
  label: string
  inputRef: React.RefObject<HTMLInputElement>
  max?: number
}

export const TimeSegment: React.FC<TimeSegmentProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  label,
  inputRef,
  max = 59
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numeric input up to 2 digits
    const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    
    // Validate against max value
    const numValue = parseInt(newValue, 10)
    if (newValue === '' || (numValue >= 0 && numValue <= max)) {
      onChange(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow arrow keys, backspace, delete, tab, enter
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
      return
    }
    
    // Allow numeric keys
    if (e.key >= '0' && e.key <= '9') {
      return
    }
    
    // Prevent all other keys
    e.preventDefault()
  }

  const handleBlur = () => {
    // Pad with leading zero if necessary when focus is lost
    if (value.length === 1) {
      onChange(value.padStart(2, '0'))
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused for easy replacement
    e.target.select()
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Increment Button */}
      <motion.button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Increase ${label}`}
      >
        <ChevronUpIcon className="w-4 h-4" />
      </motion.button>

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-center text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          maxLength={2}
          placeholder="00"
        />
      </div>

      {/* Decrement Button */}
      <motion.button
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Decrease ${label}`}
      >
        <ChevronDownIcon className="w-4 h-4" />
      </motion.button>

      {/* Label */}
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}
