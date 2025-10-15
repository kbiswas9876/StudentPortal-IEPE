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

  const hoursRef = useRef<HTMLInputElement | null>(null)
  const minutesRef = useRef<HTMLInputElement | null>(null)
  const secondsRef = useRef<HTMLInputElement | null>(null)

  // Notify parent component of any change
  useEffect(() => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
    onChange(isNaN(totalSeconds) ? 0 : totalSeconds)
  }, [hours, minutes, seconds, onChange])
  
  // Smart Input Logic with auto-focus
  const handleSegmentChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    nextRef?: React.RefObject<HTMLInputElement | null>
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
      className={`flex items-start justify-center p-2 bg-gray-50 rounded-lg border ${className}`}
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
        max={99}
      />

      {/* Separator */}
      <span className="text-2xl font-semibold text-gray-400 mx-2 mt-7">:</span>

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
      <span className="text-2xl font-semibold text-gray-400 mx-2 mt-7">:</span>

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
