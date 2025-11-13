'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface HamburgerMenuProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export default function HamburgerMenu({
  isOpen,
  onClick,
  className = ''
}: HamburgerMenuProps) {
  const lineVariants = {
    closed: {
      rotate: 0,
      y: 0,
      opacity: 1
    },
    open: {
      rotate: 45,
      y: 6,
      opacity: 1
    }
  }

  const middleLineVariants = {
    closed: {
      opacity: 1,
      x: 0
    },
    open: {
      opacity: 0,
      x: -20
    }
  }

  const bottomLineVariants = {
    closed: {
      rotate: 0,
      y: 0,
      opacity: 1
    },
    open: {
      rotate: -45,
      y: -6,
      opacity: 1
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        lg:hidden relative p-2 rounded-lg 
        bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm
        hover:bg-white/20 dark:hover:bg-slate-700/50
        border border-white/20 dark:border-slate-600/50
        transition-all duration-200
        ${className}
      `}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <motion.div
          variants={lineVariants}
          animate={isOpen ? 'open' : 'closed'}
          className="w-5 h-0.5 bg-slate-700 dark:bg-slate-300 rounded-full mb-1.5 origin-center"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          variants={middleLineVariants}
          animate={isOpen ? 'open' : 'closed'}
          className="w-5 h-0.5 bg-slate-700 dark:bg-slate-300 rounded-full mb-1.5"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          variants={bottomLineVariants}
          animate={isOpen ? 'open' : 'closed'}
          className="w-5 h-0.5 bg-slate-700 dark:bg-slate-300 rounded-full origin-center"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </motion.button>
  )
}