'use client'

import { lazy, ComponentType, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load heavy components for better performance
export const LazyRealtimeDashboard = lazy(() =>
  import('@/components/monitoring/RealtimeDashboard').then(module => ({
    default: module.RealtimeDashboard
  }))
)

export const LazyAnswerList = lazy(() =>
  import('@/components/answers/AnswerList')
)

export const LazyQuestionCard = lazy(() =>
  import('@/components/questions/QuestionCard').then(module => ({
    default: module.QuestionCard
  }))
)

export const LazySpecialtyTags = lazy(() =>
  import('@/components/trust/SpecialtyTags')
)

export const LazyValuePropositionBanner = lazy(() =>
  import('@/components/banners/ValuePropositionBanner')
)

export const LazyAIMatchingFlow = lazy(() =>
  import('@/components/trust/AIMatchingFlow')
)

export const LazyQuestionDetail = lazy(() =>
  import('@/components/questions/QuestionDetail')
)

export const LazyCommentSection = lazy(() =>
  import('@/components/answers/CommentSection')
)

export const LazySearchBox = lazy(() =>
  import('@/components/search/SearchBox').then(module => ({
    default: module.SearchBox
  }))
)

export const LazyQuestionList = lazy(() =>
  import('@/components/questions/QuestionList').then(module => ({
    default: module.QuestionList
  }))
)

// HOC for wrapping lazy components with Suspense
export function withLazyLoading<T extends ComponentType<any>>(
  LazyComponent: T,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Pre-configured lazy components with fallbacks
export const RealtimeDashboard = withLazyLoading(LazyRealtimeDashboard,
  <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
)

export const AnswerList = withLazyLoading(LazyAnswerList,
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
    ))}
  </div>
)

export const QuestionCard = withLazyLoading(LazyQuestionCard,
  <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
)

export const SpecialtyTags = withLazyLoading(LazySpecialtyTags,
  <div className="flex gap-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-6 w-16 rounded" />
    ))}
  </div>
)

export const ValuePropositionBanner = withLazyLoading(LazyValuePropositionBanner,
  <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
)

export const AIMatchingFlow = withLazyLoading(LazyAIMatchingFlow,
  <div className="animate-pulse bg-gray-200 h-80 rounded-lg" />
)

export const QuestionDetail = withLazyLoading(LazyQuestionDetail,
  <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
)

export const CommentSection = withLazyLoading(LazyCommentSection,
  <div className="space-y-2">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded" />
    ))}
  </div>
)

export const SearchBox = withLazyLoading(LazySearchBox,
  <div className="animate-pulse bg-gray-200 h-12 rounded-lg" />
)

export const QuestionList = withLazyLoading(LazyQuestionList,
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
    ))}
  </div>
)