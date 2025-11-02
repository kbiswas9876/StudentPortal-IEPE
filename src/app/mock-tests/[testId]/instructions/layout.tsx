import React from 'react'

export default function InstructionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout renders children without the site header/navigation
  // This creates a fully immersive, header-less experience
  return <>{children}</>
}

