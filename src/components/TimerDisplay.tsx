'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerDisplayProps {
  startTime: number
  mode: 'stopwatch' | 'countdown'
  duration?: number // in minutes, required for countdown mode
  size?: 'small' | 'medium' | 'large' | 'ultra'
  onTimeUp?: () => void
  className?: string
  variant?: 'default' | 'premium' | 'ultra-premium'
}

export default function TimerDisplay({ 
  startTime, 
  mode, 
  duration, 
  size = 'medium',
  onTimeUp,
  className = '',
  variant = 'default'
}: TimerDisplayProps) {
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [previousTime, setPreviousTime] = useState<string>('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100) // Reduced to 10fps to minimize re-renders while maintaining smoothness

    return () => clearInterval(interval)
  }, [])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeWithTicks = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getDisplayTime = () => {
    if (mode === 'countdown' && duration) {
      const totalTimeMs = duration * 60 * 1000
      const elapsedMs = currentTime - startTime
      const remainingMs = Math.max(0, totalTimeMs - elapsedMs)
      
      // Check if time is up
      if (remainingMs === 0 && onTimeUp) {
        onTimeUp()
      }
      
      return {
        time: formatTimeWithTicks(remainingMs),
        isLowTime: remainingMs < 5 * 60 * 1000, // Less than 5 minutes
        isCritical: remainingMs < 60 * 1000 // Less than 1 minute
      }
    } else {
      // Stopwatch mode
      const elapsedMs = currentTime - startTime
      return {
        time: formatTimeWithTicks(elapsedMs),
        isLowTime: false,
        isCritical: false
      }
    }
  }

  const { time, isLowTime, isCritical } = getDisplayTime()

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm'
      case 'large':
        return 'text-xl'
      case 'ultra':
        return 'text-2xl'
      default:
        return 'text-base'
    }
  }

  const getColorClasses = () => {
    if (isCritical) {
      return 'text-red-600 dark:text-red-400'
    } else if (isLowTime) {
      return 'text-orange-600 dark:text-orange-400'
    } else {
      return 'text-slate-700 dark:text-slate-300'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow duration-300'
      case 'ultra-premium':
        return 'bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm'
      default:
        return ''
    }
  }

  const getPaddingClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5'
      case 'large':
        return 'px-6 py-3'
      case 'ultra':
        return 'px-8 py-4'
      default:
        return 'px-4 py-2'
    }
  }

  const getRoundedClasses = () => {
    switch (size) {
      case 'small':
        return 'rounded-lg'
      case 'large':
        return 'rounded-xl'
      case 'ultra':
        return 'rounded-2xl'
      default:
        return 'rounded-lg'
    }
  }

  // Track time changes for smooth animations
  useEffect(() => {
    if (time !== previousTime) {
      setPreviousTime(time)
    }
  }, [time, previousTime])

  if (variant === 'ultra-premium') {
    return (
      <motion.div
        className={`
          relative overflow-hidden
          ${getVariantClasses()}
          ${getPaddingClasses()}
          ${getRoundedClasses()}
          ${className}
        `}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Clean white background with subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95 rounded-2xl" />
        
        {/* Timer content */}
        <div className="relative z-10 flex items-center space-x-3">
          {/* Premium clock icon */}
          <motion.div
            className="flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg 
              className={`w-5 h-5 ${getColorClasses()}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </motion.div>
          
          {/* Timer display with modern premium typography - stable */}
          <div
            className={`font-black tracking-wider ${getSizeClasses()} ${getColorClasses()} relative`}
            style={{
              fontFamily: '"SF Pro Display", "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", "Roboto Mono", "Source Code Pro", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.15em',
              fontWeight: '900',
              fontFeatureSettings: '"tnum" 1, "ss01" 1, "ss02" 1',
              fontVariantNumeric: 'tabular-nums',
              textRendering: 'optimizeLegibility'
            }}
          >
            {time}
            {/* Subtle ticking indicator */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full opacity-60"
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Premium glow effect for critical time */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-red-500/10 shadow-red-500/20 shadow-lg"
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    )
  }

  if (variant === 'premium') {
    return (
      <motion.div
        className={`
          ${getVariantClasses()}
          ${getPaddingClasses()}
          ${getRoundedClasses()}
          ${className}
        `}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-2">
          <motion.svg 
            className={`w-4 h-4 ${getColorClasses()}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </motion.svg>
          <div 
            className={`font-bold tracking-wide ${getSizeClasses()} ${getColorClasses()} relative`}
            style={{
              fontFamily: '"SF Pro Text", "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", "Roboto Mono", "Source Code Pro", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.08)',
              letterSpacing: '0.08em',
              fontWeight: '700',
              fontFeatureSettings: '"tnum" 1, "ss01" 1',
              fontVariantNumeric: 'tabular-nums',
              textRendering: 'optimizeLegibility'
            }}
          >
            {time}
            {/* Subtle ticking dot */}
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-current rounded-full opacity-50"
              animate={{ 
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <div 
      className={`font-semibold tracking-wide transition-colors duration-300 ${getSizeClasses()} ${getColorClasses()} ${className}`}
      style={{
        fontFamily: '"SF Pro Text", "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", "Roboto Mono", "Source Code Pro", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
        letterSpacing: '0.06em',
        fontWeight: '600',
        fontFeatureSettings: '"tnum" 1',
        fontVariantNumeric: 'tabular-nums',
        textRendering: 'optimizeLegibility',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
      }}
    >
      {time}
    </div>
  )
}
