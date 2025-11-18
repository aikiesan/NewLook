'use client'

/**
 * CP2B Maps V3 - Dashboard Layout Component
 * DBFZ-inspired layout with full-width map and floating panels
 */

import React, { ReactNode } from 'react'
import TopNavigation from './TopNavigation'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content Area - Full Height */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  )
}
