'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Lazy loading with proper loading state
const AIMatchingFlow = dynamic(() => import('@/components/trust/AIMatchingFlow'), {
  loading: () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
})

type AIMatchingFlowProps = ComponentProps<typeof import('@/components/trust/AIMatchingFlow').default>

export default function DynamicAIMatchingFlow(props: AIMatchingFlowProps) {
  return <AIMatchingFlow {...props} />
}