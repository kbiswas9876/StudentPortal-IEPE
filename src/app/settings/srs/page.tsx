'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SrsSettingsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings')
  }, [router])

  return null
}
