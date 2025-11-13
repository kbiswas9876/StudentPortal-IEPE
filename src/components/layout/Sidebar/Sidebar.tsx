'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SidebarHeader from './SidebarHeader'
import SidebarNavigation from './SidebarNavigation'
import SidebarFooter from './SidebarFooter'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onClose: () => void
  className?: string
}

export default function Sidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  className = ''
}: SidebarProps) {
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  const desktopVariants = {
    expanded: {
      width: '280px',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: '80px',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={desktopVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50 premium-sidebar ${className}`}
      >
        <SidebarHeader 
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
        <SidebarNavigation isCollapsed={isCollapsed} />
        <SidebarFooter isCollapsed={isCollapsed} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden flex flex-col fixed left-0 top-0 h-screen w-80 z-60 premium-sidebar-mobile"
          >
            <SidebarHeader 
              isCollapsed={false}
              onToggleCollapse={onClose}
              isMobile={true}
            />
            <SidebarNavigation isCollapsed={false} />
            <SidebarFooter isCollapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}