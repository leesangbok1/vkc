'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type FeedEmptyStateProps = {
  icon?: string
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}

export function FeedEmptyState({
  icon = '📝',
  title,
  description,
  actionHref,
  actionLabel,
}: FeedEmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="text-3xl" aria-hidden>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {actionHref && actionLabel && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )

  return (
    <div className="border border-dashed border-gray-200 rounded-xl bg-white py-12 px-6">
      {content}
    </div>
  )
}

