'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ForwardRefExoticComponent, SVGProps } from 'react'

interface NavItemProps {
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined;
    titleId?: string | undefined;
  } & React.RefAttributes<SVGSVGElement>>
  label: string
  href: string
  isActive: boolean
  isCollapsed: boolean
  badge?: string | number
}

export default function NavItem({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
  badge
}: NavItemProps) {
  const itemVariants = {
    hover: {
      x: isCollapsed ? 0 : 4,
      scale: isCollapsed ? 1.05 : 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <Link href={href} className="block">
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        className={`
          relative flex items-center px-3 py-3 rounded-xl transition-all duration-300 group
          ${isActive 
            ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 shadow-lg shadow-indigo-500/20' 
            : 'hover:bg-white/10 dark:hover:bg-slate-700/30'
          }
          ${isCollapsed ? 'justify-center mx-1' : 'justify-start space-x-3'}
        `}
        title={isCollapsed ? label : undefined}
      >
        {/* Active indicator - clean single bar on left */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Icon */}
        <div className={`
          relative flex items-center justify-center
          ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'}
          ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
          ${isActive ? 'ml-1' : ''}
        `}>
          <Icon className="w-full h-full" />
          
          {/* Badge for collapsed mode */}
          {badge && isCollapsed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {badge}
            </motion.span>
          )}
        </div>

        {/* Label and Badge */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex items-center justify-between"
          >
            <span className={`
              text-sm font-medium transition-colors duration-200
              ${isActive 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
              }
            `}>
              {label}
            </span>
            
            {badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
              >
                {badge}
              </motion.span>
            )}
          </motion.div>
        )}
      </motion.div>
    </Link>
  )
}