'use client'

import PageLayout from '@/components/layout/PageLayout'
import FeedBoard from '@/components/feed/FeedBoard'

export default function QuestionsListPage() {
  return (
    <PageLayout variant="withSidebar">
      <div className="feed-filter-bar">
        <div className="feed-filter-scroll">
          <a href="/questions" className="category-tab active">전체 질문</a>
          <a href="/posts?type=questions" className="category-tab">답변 모아보기</a>
          <a href="/topics" className="category-tab">토픽 둘러보기</a>
        </div>
      </div>

      <FeedBoard
        mode="questions"
        title="❓ 질문 피드"
        emptyState={{
          icon: '📝',
          title: '아직 게시물이 없습니다',
          description: '첫 번째 게시물을 작성해보세요!',
          actionHref: '/questions/new',
          actionLabel: '질문 작성하기'
        }}
      />
    </PageLayout>
  )
}
