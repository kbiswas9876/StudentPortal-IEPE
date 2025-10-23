'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

interface InformationalTooltipProps {
  content: string
  className?: string
}

export default function InformationalTooltip({ content, className = '' }: InformationalTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // If not enough space below, show above
      if (spaceBelow < tooltipRect.height + 20 && spaceAbove > tooltipRect.height + 20) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [isVisible])

  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      tooltipRef.current &&
      triggerRef.current &&
      !tooltipRef.current.contains(event.target as Node) &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsVisible(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        aria-label="More information"
        aria-expanded={isVisible}
        type="button"
      >
        <HelpCircle className="h-4 w-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 w-72 ${
              position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
            } left-1/2 -translate-x-1/2`}
            role="tooltip"
          >
            {/* Pointer Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transform rotate-45 ${
                position === 'bottom'
                  ? '-top-1.5 border-t border-l'
                  : '-bottom-1.5 border-b border-r'
              }`}
            />

            {/* Tooltip Content */}
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

