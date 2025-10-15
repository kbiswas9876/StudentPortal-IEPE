'use client'

import { motion } from 'framer-motion'

interface SegmentedControlProps {
  options: Array<{
    value: string
    label: string
  }>
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = ''
}: SegmentedControlProps) {
  const selectedIndex = options.findIndex(option => option.value === value)

  return (
    <div className={`relative inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 ${className}`}>
      {/* Background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600"
        initial={false}
        animate={{
          left: `${selectedIndex * (100 / options.length)}%`,
          width: `${100 / options.length}%`
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      />
      
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${value === option.value
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
