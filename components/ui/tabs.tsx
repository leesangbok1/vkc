'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'data-[orientation=vertical]:flex',
      className
    )}
    {...props}
  />
))
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile optimized: horizontal scroll
      'overflow-x-auto border-b border-light',
      'scrollbar-hide', // 스크롤바 숨김
      className
    )}
    {...props}
  >
    <div className="flex gap-1 px-4 min-w-max md:px-0">
      {props.children}
    </div>
  </div>
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'px-4 py-3 text-sm font-medium transition-normal whitespace-nowrap',
      'border-b-2 hover:text-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue',
      'data-[state=active]:border-primary-blue data-[state=active]:text-primary-blue data-[state=active]:bg-secondary/50',
      'data-[state=inactive]:border-transparent data-[state=inactive]:text-secondary data-[state=inactive]:hover:border-tertiary',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'pt-4 focus:outline-none focus:ring-2 focus:ring-primary-blue',
      className
    )}
    role="tabpanel"
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }