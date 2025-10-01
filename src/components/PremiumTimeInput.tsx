'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TimeSegment } from './TimeSegment'

interface PremiumTimeInputProps {
  // Callback to parent with total time in seconds
  onChange: (totalSeconds: number) => void
  defaultValue?: number // in seconds
  className?: string
}

const padZero = (num: number) => String(num).padStart(2, '0')

export const PremiumTimeInput: React.FC<PremiumTimeInputProps> = ({
  onChange,
  defaultValue = 1800, // 30 minutes default
  className = ''
}) => {
  // Initialize from default value
  const initialHours = Math.floor(defaultValue / 3600)
  const initialMinutes = Math.floor((defaultValue % 3600) / 60)
  const initialSeconds = defaultValue % 60

  const [hours, setHours] = useState(padZero(initialHours))
  const [minutes, setMinutes] = useState(padZero(initialMinutes))
  const [seconds, setSeconds] = useState(padZero(initialSeconds))

  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)

  // Notify parent component of any change
  useEffect(() => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
    onChange(isNaN(totalSeconds) ? 0 : totalSeconds)
  }, [hours, minutes, seconds, onChange])
  
  // Smart Input Logic with auto-focus
  const handleSegmentChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => (value: string) => {
    setter(value)
    // Auto-focus next input when 2 digits are entered
    if (value.length === 2 && nextRef?.current) {
      setTimeout(() => {
        nextRef.current?.focus()
        nextRef.current?.select()
      }, 50)
    }
  }

  // Increment/Decrement Logic with proper wrapping
  const createHandler = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    max: number
  ) => {
    const numValue = parseInt(value, 10) || 0
    return {
      increment: () => {
        const newValue = (numValue + 1) % (max + 1)
        setter(padZero(newValue))
      },
      decrement: () => {
        const newValue = numValue === 0 ? max : numValue - 1
        setter(padZero(newValue))
      }
    }
  }

  const hoursHandler = createHandler(hours, setHours, 23)
  const minutesHandler = createHandler(minutes, setMinutes, 59)
  const secondsHandler = createHandler(seconds, setSeconds, 59)

  return (
    <motion.div 
      className={`flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hours Segment */}
      <TimeSegment
        value={hours}
        onChange={handleSegmentChange(setHours, minutesRef)}
        onIncrement={hoursHandler.increment}
        onDecrement={hoursHandler.decrement}
        label="Hours"
        inputRef={hoursRef}
        max={23}
      />

      {/* Separator */}
      <motion.div 
        className="text-3xl font-mono text-slate-400 dark:text-slate-500 mx-4 select-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
      >
        :
      </motion.div>

      {/* Minutes Segment */}
      <TimeSegment
        value={minutes}
        onChange={handleSegmentChange(setMinutes, secondsRef)}
        onIncrement={minutesHandler.increment}
        onDecrement={minutesHandler.decrement}
        label="Minutes"
        inputRef={minutesRef}
        max={59}
      />

      {/* Separator */}
      <motion.div 
        className="text-3xl font-mono text-slate-400 dark:text-slate-500 mx-4 select-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2, delay: 1 }}
      >
        :
      </motion.div>

      {/* Seconds Segment */}
      <TimeSegment
        value={seconds}
        onChange={handleSegmentChange(setSeconds)}
        onIncrement={secondsHandler.increment}
        onDecrement={secondsHandler.decrement}
        label="Seconds"
        inputRef={secondsRef}
        max={59}
      />
    </motion.div>
  )
}
