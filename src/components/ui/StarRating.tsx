'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showTooltip?: boolean
  readonly?: boolean
  className?: string
}

interface StarRatingDisplayProps {
  value: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

interface TooltipPosition {
  tooltipX: number      // Tooltip left position (absolute viewport)
  tooltipY: number      // Tooltip top position (absolute viewport)
  starCenterX: number   // Star center X (absolute viewport)
  starCenterY: number   // Star center Y (absolute viewport)
  rating: number
  placement: 'top' | 'bottom'
}

// Difficulty level mappings - Standardized 5-star rating system
const difficultyLabels = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard'
}

// Color schemes for each difficulty level
const difficultyColors = {
  1: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600', hex: '#10b981' },
  2: { bg: 'bg-lime-500', gradient: 'from-lime-500 to-yellow-500', hex: '#84cc16' },
  3: { bg: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500', hex: '#f59e0b' },
  4: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-red-500', hex: '#f97316' },
  5: { bg: 'bg-red-500', gradient: 'from-red-500 to-rose-600', hex: '#ef4444' }
}

// Size configurations
const sizeConfig = {
  sm: {
    star: 'h-4 w-4',
    gap: 'gap-0.5',
    tooltipText: 'text-xs',
    tooltipPadding: 'px-2.5 py-1.5',
    arrowSize: 6
  },
  md: {
    star: 'h-5 w-5',
    gap: 'gap-1',
    tooltipText: 'text-sm',
    tooltipPadding: 'px-3.5 py-2',
    arrowSize: 7
  },
  lg: {
    star: 'h-6 w-6',
    gap: 'gap-1.5',
    tooltipText: 'text-base',
    tooltipPadding: 'px-4 py-2.5',
    arrowSize: 8
  }
}

export function StarRating({ 
  value = 0, 
  onChange, 
  maxRating = 5, 
  size = 'md',
  disabled = false,
  showTooltip = true,
  readonly = false,
  className = ''
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const starRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tooltipRef = useRef<HTMLDivElement>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const config = sizeConfig[size]
  const displayRating = hoveredRating > 0 ? hoveredRating : value

  /**
   * Calculate tooltip position with pixel-perfect alignment
   * Strategy:
   * 1. Get star's absolute center position in viewport
   * 2. Use actual tooltip ref dimensions if available, otherwise estimate
   * 3. Position tooltip centered on star, then apply boundary constraints
   * 4. Calculate tooltip left edge, keeping star center for arrow
   */
  const calculateTooltipPosition = useCallback((starElement: HTMLElement, rating: number): TooltipPosition => {
    const starRect = starElement.getBoundingClientRect()
    
    // Get exact star center in viewport coordinates
    const starCenterX = starRect.left + (starRect.width / 2)
    const starCenterY = starRect.top + (starRect.height / 2)
    
    // Get actual tooltip dimensions if already rendered, otherwise use estimates
    let tooltipWidth: number
    let tooltipHeight: number
    
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      tooltipWidth = tooltipRect.width || 120
      tooltipHeight = tooltipRect.height || 38
    } else {
      // Accurate width estimates based on actual text and font-bold rendering
      const label = difficultyLabels[rating as keyof typeof difficultyLabels]
      // Bold fonts are wider - calculate based on font size
      // text-xs (12px bold) ≈ 8.5px/char, text-sm (14px bold) ≈ 9.5px/char, text-base (16px bold) ≈ 11px/char
      const charWidth = size === 'sm' ? 8.5 : size === 'md' ? 9.5 : 11
      const paddingH = size === 'sm' ? 20 : size === 'md' ? 28 : 32
      const borderWidth = 2 // border width on both sides
      tooltipWidth = Math.ceil(label.length * charWidth + paddingH + borderWidth)
      tooltipHeight = size === 'sm' ? 30 : size === 'md' ? 38 : 44
    }
    
    const arrowHeight = config.arrowSize
    const gap = 8 // Gap between star and tooltip
    
    // Calculate tooltip center X (initially aligned with star)
    let tooltipCenterX = starCenterX
    
    // Apply viewport boundary constraints
    const viewportWidth = window.innerWidth
    const padding = 12
    const halfWidth = tooltipWidth / 2
    
    // Keep tooltip within viewport bounds
    const minCenterX = padding + halfWidth
    const maxCenterX = viewportWidth - padding - halfWidth
    
    if (tooltipCenterX < minCenterX) {
      tooltipCenterX = minCenterX
    } else if (tooltipCenterX > maxCenterX) {
      tooltipCenterX = maxCenterX
    }
    
    // Calculate tooltip's left edge (top-left corner X)
    const tooltipX = tooltipCenterX - halfWidth
    
    // Calculate vertical position
    let tooltipY: number
    let placement: 'top' | 'bottom'
    
    // Try placing above star
    const spaceAbove = starRect.top
    const spaceNeeded = tooltipHeight + arrowHeight + gap
    
    if (spaceAbove >= spaceNeeded + padding) {
      // Enough space above
      tooltipY = starRect.top - tooltipHeight - arrowHeight - gap
      placement = 'top'
    } else {
      // Not enough space above, place below
      tooltipY = starRect.bottom + arrowHeight + gap
      placement = 'bottom'
    }
    
    return {
      tooltipX,
      tooltipY,
      starCenterX,
      starCenterY,
      rating,
      placement
    }
  }, [config.arrowSize, size])

  /**
   * Handle mouse enter with debouncing for smooth transitions
   */
  const handleMouseEnter = useCallback((rating: number, starElement: HTMLButtonElement) => {
    if (disabled) return
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    setHoveredRating(rating)
    
    if (showTooltip) {
      // Small delay to ensure DOM is settled
      updateTimeoutRef.current = setTimeout(() => {
        const position = calculateTooltipPosition(starElement, rating)
        setTooltipPosition(position)
      }, 10)
    }
  }, [disabled, showTooltip, calculateTooltipPosition])

  /**
   * Handle mouse leave with cleanup
   */
  const handleMouseLeave = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    setHoveredRating(0)
    setTooltipPosition(null)
  }, [])

  /**
   * Handle scroll and resize events to update tooltip position
   */
  useEffect(() => {
    if (!tooltipPosition || !hoveredRating) return

    const handleScrollOrResize = () => {
      const starElement = starRefs.current[hoveredRating - 1]
      if (starElement) {
        const newPosition = calculateTooltipPosition(starElement, hoveredRating)
        setTooltipPosition(newPosition)
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, { passive: true })
    window.addEventListener('resize', handleScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [tooltipPosition, hoveredRating, calculateTooltipPosition])

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = (rating: number) => {
    if (disabled || readonly || !onChange) return
    onChange(rating)
  }

  /**
   * Render tooltip with precise arrow positioning
   * Arrow Strategy:
   * - Tooltip is positioned using top-left coordinates (tooltipX, tooltipY)
   * - Arrow position within tooltip = (starCenterX - tooltipX) pixels from tooltip's left edge
   * - This makes the arrow point EXACTLY at the star center
   */
  const renderTooltip = () => {
    if (!showTooltip || !tooltipPosition || !isMounted) return null

    const { tooltipX, tooltipY, starCenterX, rating, placement } = tooltipPosition
    const colorScheme = difficultyColors[rating as keyof typeof difficultyColors]
    const label = difficultyLabels[rating as keyof typeof difficultyLabels]
    
    // Calculate arrow's left position within the tooltip container
    // This is the distance from tooltip's left edge to the star center
    const arrowLeftPosition = starCenterX - tooltipX
    const arrowSize = config.arrowSize

    return createPortal(
      <AnimatePresence mode="wait">
        <motion.div
          key={`tooltip-${rating}`}
          ref={tooltipRef}
          initial={{ 
            opacity: 0, 
            scale: 0.93,
            y: placement === 'top' ? 6 : -6
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.93,
            y: placement === 'top' ? 6 : -6
          }}
          transition={{ 
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="fixed pointer-events-none select-none"
          style={{
            left: `${tooltipX}px`,
            top: `${tooltipY}px`,
            zIndex: 99999,
            willChange: 'transform, opacity'
          }}
        >
          {/* Tooltip Body */}
          <div className="relative inline-block">
            <div className={`
              ${config.tooltipPadding}
              ${config.tooltipText}
              relative
              font-bold
              text-white
              bg-gradient-to-br ${colorScheme.gradient}
              rounded-xl
              shadow-2xl
              whitespace-nowrap
              border border-white/30
              backdrop-blur-sm
              overflow-hidden
            `}
              style={{
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset'
              }}
            >
              {/* Shine overlay */}
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)'
                }}
              />
              
              {/* Label */}
              <span className="relative z-10 drop-shadow-md">
                {label}
              </span>
            </div>
            
            {/* Arrow - Positioned exactly at star center */}
            {placement === 'top' ? (
              // Tooltip above star - arrow points down
              <div
                className="absolute"
                style={{
                  left: `${arrowLeftPosition}px`,
                  top: '100%',
                  transform: 'translateX(-50%)'
                }}
              >
                <svg
                  width={arrowSize * 2}
                  height={arrowSize}
                  viewBox={`0 0 ${arrowSize * 2} ${arrowSize}`}
                  style={{
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
                    display: 'block'
                  }}
                >
                  <defs>
                    <linearGradient id={`grad-down-${rating}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: colorScheme.hex, stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: colorScheme.hex, stopOpacity: 0.9 }} />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,0 ${arrowSize * 2},0 ${arrowSize},${arrowSize}`}
                    fill={`url(#grad-down-${rating})`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            ) : (
              // Tooltip below star - arrow points up
              <div
                className="absolute"
                style={{
                  left: `${arrowLeftPosition}px`,
                  bottom: '100%',
                  transform: 'translateX(-50%)'
                }}
              >
                <svg
                  width={arrowSize * 2}
                  height={arrowSize}
                  viewBox={`0 0 ${arrowSize * 2} ${arrowSize}`}
                  style={{
                    filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.25))',
                    display: 'block'
                  }}
                >
                  <defs>
                    <linearGradient id={`grad-up-${rating}`} x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: colorScheme.hex, stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: colorScheme.hex, stopOpacity: 0.9 }} />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${arrowSize},0 0,${arrowSize} ${arrowSize * 2},${arrowSize}`}
                    fill={`url(#grad-up-${rating})`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <>
      <div className={`relative inline-flex items-center ${config.gap} ${className}`} ref={containerRef}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isActive = starValue <= displayRating
          const isHovered = hoveredRating === starValue
          
          return (
            <motion.button
              key={starValue}
              ref={(el) => { starRefs.current[index] = el }}
              data-star-index={starValue}
              whileHover={!disabled ? { scale: 1.15, rotate: 5 } : {}}
              whileTap={!disabled && !readonly ? { scale: 0.9, rotate: -5 } : {}}
              onClick={() => handleClick(starValue)}
              onMouseEnter={(e) => {
                const target = e.currentTarget
                handleMouseEnter(starValue, target)
              }}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
              className={`
                ${config.star} 
                ${disabled ? 'cursor-not-allowed' : readonly ? 'cursor-default' : 'cursor-pointer'} 
                transition-all duration-200
                ${isActive 
                  ? 'text-yellow-400 dark:text-yellow-500' 
                  : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300 dark:hover:text-yellow-600'
                }
                ${disabled ? 'opacity-50' : ''}
                ${isHovered ? 'brightness-110' : ''}
                relative
              `}
              style={{
                filter: isActive ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))' : 'none'
              }}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              {isActive ? (
                <>
                  <StarSolidIcon className="w-full h-full" />
                  {/* Subtle glow effect for active stars */}
                  <div 
                    className="absolute inset-0 rounded-full blur-sm opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)'
                    }}
                  />
                </>
              ) : (
                <StarIcon className="w-full h-full" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Render tooltip via Portal */}
      {renderTooltip()}
    </>
  )
}

// Display-only component for showing ratings without interaction
export function StarRatingDisplay({ 
  value, 
  maxRating = 5, 
  size = 'md',
  className = ''
}: StarRatingDisplayProps) {
  const config = sizeConfig[size]
  
  return (
    <div className={`inline-flex items-center ${config.gap} ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1
        const isActive = starValue <= value
        
        return (
          <div
            key={starValue}
            className={config.star}
          >
            {isActive ? (
              <StarSolidIcon className="w-full h-full text-yellow-500 drop-shadow-sm" />
            ) : (
              <StarIcon className="w-full h-full text-slate-300 dark:text-slate-600" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StarRating
