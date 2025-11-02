'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show header on solutions pages or instructions pages
  if (pathname?.includes('/solutions') || pathname?.includes('/instructions')) {
    return null
  }
  
  return <Header />
}
