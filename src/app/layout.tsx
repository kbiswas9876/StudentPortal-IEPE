import type { Metadata } from 'next'
import React from 'react'
import { Inter, Lora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { SidebarProvider } from '@/lib/sidebar-context'
import { ThemeProvider } from '@/lib/theme-context'
import { ToastProvider } from '@/lib/toast-context'
import { ChartJsProvider } from '@/components/ChartJsProvider'
import { DashboardProvider } from '@/lib/dashboard-context'
import { AppLayout } from '@/components/layout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Student Portal',
  description: 'Premium educational platform for interactive learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <ChartJsProvider>
          <ThemeProvider>
            <AuthProvider>
              <SidebarProvider>
                <ToastProvider>
                  <DashboardProvider>
                    <AppLayout>
                      {children}
                    </AppLayout>
                  </DashboardProvider>
                </ToastProvider>
              </SidebarProvider>
            </AuthProvider>
          </ThemeProvider>
        </ChartJsProvider>
      </body>
    </html>
  )
}
