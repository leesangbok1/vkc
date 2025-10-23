'use client'

import PageLayout from '@/components/layout/PageLayout'
import FeedBoard from '@/components/feed/FeedBoard'

export default function QuestionsListPage() {
  return (
    <PageLayout variant="withSidebar">
      <div className="mobile-category-grid">
        <a href="/categories/visa" className="mobile-category-item">
          <div className="mobile-category-icon">💼</div>
          <div className="mobile-category-label">한국 취업</div>
        </a>
        <a href="/categories/visa" className="mobile-category-item">
          <div className="mobile-category-icon">✈️</div>
          <div className="mobile-category-label">한국 비자</div>
        </a>
        <a href="/categories/life" className="mobile-category-item">
          <div className="mobile-category-icon">🏠</div>
          <div className="mobile-category-label">한국 생활</div>
        </a>
        <a href="/categories/legal" className="mobile-category-item">
          <div className="mobile-category-icon">⚖️</div>
          <div className="mobile-category-label">한국 법률</div>
        </a>
      </div>

      <div className="filter-buttons" style={{ marginBottom: '1.5rem' }}>
        <button className="filter-btn active" disabled>
          전체
        </button>
        <button className="filter-btn" onClick={() => window.location.href = '/posts'}>
          전체 게시글로 보기
        </button>
        <button className="filter-btn" onClick={() => window.location.href = '/topics'}>
          토픽 둘러보기
        </button>
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
        loginRedirectPath="/questions"
      />
    </PageLayout>
  )
}
