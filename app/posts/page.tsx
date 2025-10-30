'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import FeedBoard from '@/components/feed/FeedBoard'

export default function AllPostsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const emptyState = useMemo(() => ({
    icon: '📝',
    title: '아직 게시글이 없습니다',
    description: '질문이나 정보 글을 작성해 커뮤니티를 채워보세요!',
    actionHref: '/posts/new',
    actionLabel: '정보 글 작성하기'
  }), [])

  return (
    <PageLayout variant="withSidebar">
      <FeedBoard
        mode="all"
        emptyState={emptyState}
        highlightId={highlightId}
        defaultSort="popular"
        showSortTabs
      />
    </PageLayout>
  )
}
