'use client'

import Sidebar from '@/components/layout/Sidebar'
import React from 'react'

type LayoutVariant = 'withSidebar' | 'centered' | 'full'

type Props = {
  children: React.ReactNode
  variant?: LayoutVariant
  /**
   * When variant is 'withSidebar', controls whether to render a sidebar.
   * Ignored for other variants.
   */
  showSidebar?: boolean
  /** Optional custom sidebar node when variant is 'withSidebar' */
  sidebar?: React.ReactNode
}

export default function PageLayout({ children, variant = 'withSidebar', showSidebar = true, sidebar }: Props) {
  if (variant === 'centered') {
    return (
      <main className="main-layout">
        <div className="main-container centered">
          <div className="main-content">
            {children}
          </div>
        </div>
      </main>
    )
  }

  if (variant === 'full') {
    return (
      <main className="main-layout">
        <div className="main-container full-width">
          <div className="main-content">
            {children}
          </div>
        </div>
      </main>
    )
  }

  // Default: withSidebar
  const containerClassName = showSidebar
    ? 'main-container with-sidebar'
    : 'main-container centered'

  return (
    <main className="main-layout">
      <div className={containerClassName}>
        <div className="main-content">
          {children}
        </div>
        {showSidebar ? (sidebar ?? <Sidebar showContent={true} />) : null}
      </div>
    </main>
  )
}
