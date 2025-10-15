'use client'

import { motion } from 'framer-motion'

interface PauseOverlayProps {
  isVisible: boolean
  children: React.ReactNode
}

export default function PauseOverlay({ isVisible, children }: PauseOverlayProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      {children}
    </motion.div>
  )
}
