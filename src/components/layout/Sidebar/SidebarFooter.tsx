'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import NotificationBell from '@/components/NotificationBell'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SidebarFooterProps {
  isCollapsed: boolean
}

export default function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  // Safely get theme context
  let theme = 'light'
  let toggleTheme = () => {}
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    toggleTheme = themeContext.toggleTheme
  } catch (error) {
    console.warn('ThemeProvider not available, using default theme')
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="border-t border-white/10 p-4">
      {/* Simplified footer - controls moved to top bar */}
      <div className="text-center">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Student Portal v2.0
        </div>
      </div>
    </div>
  )
}