'use client'

import React from 'react'

interface ReactMuiSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

// This component is deprecated and replaced by PremiumSidebar
// Keeping it here to avoid breaking imports, but it's not used
export default function ReactMuiSidebar({ isOpen, onClose, isMobile = false }: ReactMuiSidebarProps) {
  return null
}
