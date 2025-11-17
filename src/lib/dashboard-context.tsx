'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type ActiveTab = 'practice' | 'saved'

interface DashboardContextType {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice')

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
