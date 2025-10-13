'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show header on solutions pages
  if (pathname?.includes('/solutions')) {
    return null
  }
  
  return <Header />
}
