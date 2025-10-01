'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface TimeSegmentProps {
  value: string
  onChange: (value: string) => void
  onIncrement: () => void
  onDecrement: () => void
  label: string
  inputRef: React.RefObject<HTMLInputElement | null>
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
    <div className="flex flex-col items-center">
      {/* Container for the input and arrows */}
      <div className="flex flex-col items-center bg-white rounded-md border border-gray-200 px-3 py-1 shadow-sm">
        <motion.button
          onClick={onIncrement}
          className="text-gray-400 hover:text-blue-500 transition-colors"
          whileTap={{ scale: 0.9 }}
          aria-label={`Increase ${label}`}
        >
          <ChevronUpIcon className="w-4 h-4" />
        </motion.button>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="w-10 bg-transparent text-2xl font-semibold text-center text-gray-800 focus:outline-none"
          maxLength={2}
          placeholder="00"
        />

        <motion.button
          onClick={onDecrement}
          className="text-gray-400 hover:text-blue-500 transition-colors"
          whileTap={{ scale: 0.9 }}
          aria-label={`Decrease ${label}`}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </motion.button>
      </div>
      {/* Label below the input box */}
      <p className="mt-1 text-xs font-medium text-gray-500 tracking-wider uppercase">{label}</p>
    </div>
  )
}
