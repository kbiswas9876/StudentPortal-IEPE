'use client'

import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'card' | 'button' | 'avatar'
}

export default function SkeletonLoader({ className = '', variant = 'text' }: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700'
  
  const variants = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-lg',
    button: 'h-10 rounded-lg',
    avatar: 'h-8 w-8 rounded-full'
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  )
}

export function BookAccordionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <SkeletonLoader className="h-6 w-48" variant="text" />
            <SkeletonLoader className="h-5 w-5 rounded-full" variant="avatar" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function RecentReportsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex-1">
            <SkeletonLoader className="h-4 w-32 mb-2" variant="text" />
            <SkeletonLoader className="h-3 w-24" variant="text" />
          </div>
          <SkeletonLoader className="h-6 w-12 rounded" variant="text" />
        </motion.div>
      ))}
    </div>
  )
}
