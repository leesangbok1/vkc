'use client'

import { Fragment } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type FeedSkeletonProps = {
  count?: number
}

export function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Fragment key={index}>
          <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

