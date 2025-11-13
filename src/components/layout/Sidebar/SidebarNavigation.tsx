'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import NavSection from '../Navigation/NavSection'
import NavItem from '../Navigation/NavItem'
import RevisionHubNavItem from '../Navigation/RevisionHubNavItem'
import { 
  BookOpenIcon, 
  ClockIcon,
  FolderOpenIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface SidebarNavigationProps {
  isCollapsed: boolean
}

export default function SidebarNavigation({ isCollapsed }: SidebarNavigationProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname?.startsWith(path) || false
  }

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2">
      <div className="space-y-6">
        {/* Learning Section */}
        <NavSection title="Learning" isCollapsed={isCollapsed}>
          <NavItem
            icon={BookOpenIcon}
            label="Practice"
            href="/dashboard"
            isActive={isActive('/dashboard')}
            isCollapsed={isCollapsed}
          />
          <RevisionHubNavItem
            isActive={isActive('/revision-hub')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={ClockIcon}
            label="Mock Tests"
            href="/mock-tests"
            isActive={isActive('/mock-tests')}
            isCollapsed={isCollapsed}
          />
        </NavSection>

        {/* Management Section */}
        <NavSection title="Management" isCollapsed={isCollapsed}>
          <NavItem
            icon={FolderOpenIcon}
            label="My Content"
            href="/my-content"
            isActive={isActive('/my-content')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={CalendarIcon}
            label="My Plans"
            href="/my-plans"
            isActive={isActive('/my-plans')}
            isCollapsed={isCollapsed}
          />
        </NavSection>

        {/* Settings Section */}
        <NavSection title="Settings" isCollapsed={isCollapsed}>
          <NavItem
            icon={CogIcon}
            label="Preferences"
            href="/settings"
            isActive={isActive('/settings')}
            isCollapsed={isCollapsed}
          />
        </NavSection>
      </div>
    </nav>
  )
}