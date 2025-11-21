'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface MaterialNavItemProps {
    icon: React.ElementType
    label: string
    href: string
    isActive: boolean
    onClick?: () => void
    isCollapsed?: boolean
}

export default function MaterialNavItem({
    icon: Icon,
    label,
    href,
    isActive,
    onClick,
    isCollapsed = false
}: MaterialNavItemProps) {
    return (
        <Link href={href} onClick={onClick} className="block w-full mb-1">
            <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
          relative flex items-center px-4 py-3 mx-2 rounded-lg
          transition-all duration-300 ease-in-out
          ${isActive
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/40 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }
        `}
            >
                <Icon
                    className={`
            w-5 h-5 min-w-[20px]
            ${isActive ? 'text-white' : 'text-inherit'}
            ${isCollapsed ? 'mr-0' : 'mr-4'}
          `}
                />

                {!isCollapsed && (
                    <span className={`
            text-sm font-medium tracking-wide whitespace-nowrap
            ${isActive ? 'text-white' : 'text-inherit'}
          `}>
                        {label}
                    </span>
                )}
            </motion.div>
        </Link>
    )
}
