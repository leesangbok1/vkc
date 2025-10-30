'use client'

import { useState, useEffect, useMemo } from 'react'
import BannerCarousel from '@/components/banners/BannerCarousel'

type Banner = {
  id: string
  title: string
  description: string
  linkUrl: string
  backgroundColor?: string
  tagline?: string
  ctaLabel?: string
  highlights?: string[]
  icon?: string
}

const FALLBACK_SIDEBAR_BANNERS: Banner[] = [
  {
    id: 'welcome-community',
    title: '베트남 커뮤니티에 오신 것을 환영해요!',
    tagline: '지금 뜨는 질문과 정보를 한눈에',
    description: '실시간 피드에서 새로운 소식과 질문을 확인하고, 관심 있는 주제와 사람들을 팔로우해보세요.',
    linkUrl: '/posts',
    backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    ctaLabel: '전체 게시글 보기',
    highlights: [
      '실명 인증된 답변자와 빠르게 소통',
      '관심 카테고리만 골라보기',
      '팔로우한 멤버 업데이트 모아보기'
    ],
    icon: '🌟'
  },
  {
    id: 'share-your-story',
    title: '당신의 한국생활 스토리를 나눠주세요',
    tagline: '정보 글과 질문, 모두 환영합니다',
    description: '한국 생활 중 겪은 경험을 나누고, 궁금한 점은 커뮤니티에 물어보세요. 더 많은 사람들이 도움을 받을 수 있어요.',
    linkUrl: '/posts/new',
    backgroundColor: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    ctaLabel: '지금 글 작성하기',
    highlights: [
      '정보 글, 후기, 꿀팁 자유롭게 작성',
      '답변이 필요한 질문도 간편하게 등록',
      '사진과 파일 첨부로 더 생생하게 공유'
    ],
    icon: '📝'
  },
  {
    id: 'apply-certification',
    title: '전문가 인증으로 신뢰도를 높여보세요',
    tagline: 'Certified User로 커뮤니티 리더 되기',
    description: '전문 분야 경험과 서류를 인증받고, 신뢰할 수 있는 답변자로 활동해보세요.',
    linkUrl: '/experts/apply',
    backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    ctaLabel: 'Certified 신청하기',
    highlights: [
      '비자·재직 등 서류 인증으로 신뢰도 상승',
      '답변 시 Certified 배지 자동 표시',
      '전문가 전용 미션과 혜택 제공'
    ],
    icon: '🎓'
  }
]

type NewsItem = {
  id: string
  title: string
  created_at: string
  category?: { name?: string | null; icon?: string | null } | null
}

/**
 * Sidebar Component
 *
 * 재사용 가능한 사이드바 컴포넌트
 * - Certified User 인증 광고 배너
 * - 최근 기사/소식
 *
 * Props:
 * @param showContent - true: 질문/답변 페이지 (배너+뉴스), false: 기타 페이지 (빈 사이드바)
 *
 * 사용법:
 * <Sidebar showContent={true} />  // 메인, 질문 페이지
 * <Sidebar showContent={false} /> // 설정, 알림 등
 */
type SidebarProps = {
  showContent?: boolean
  banners?: Banner[]
}

export default function Sidebar({ showContent = true, banners }: SidebarProps) {
  const [currentTime, setCurrentTime] = useState('--:--')
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])

  useEffect(() => {
    // 실시간 시계 업데이트
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime() // 초기 실행
    const interval = setInterval(updateTime, 1000) // 1초마다 업데이트

    return () => clearInterval(interval) // cleanup
  }, [])

  useEffect(() => {
    async function loadNews() {
      setNewsLoading(true)
      setNewsError(null)
      try {
        const res = await fetch('/api/posts?sort=recent&limit=5&post_type=news', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`failed ${res.status}`)
        }
        const json = await res.json().catch(() => null)
        const items = Array.isArray(json?.items)
          ? json.items.map((item: any) => ({
              id: String(item?.id ?? ''),
              title: item?.title ?? '제목 없음',
              created_at: item?.created_at ?? new Date().toISOString(),
              category: item?.category ?? null,
            }))
          : []
        setNewsItems(items.filter((item) => item.id.length > 0))
      } catch (error) {
        console.error('[Sidebar] failed to load news', error)
        setNewsItems([])
        setNewsError('최근 정보 글을 불러오지 못했습니다.')
      } finally {
        setNewsLoading(false)
      }
    }

    loadNews()
  }, [])

  // 빈 사이드바 (질문/답변 페이지가 아닌 경우)
  if (!showContent) {
    return <div className="sidebar sidebar-sticky"></div>
  }

  const bannerSlides = useMemo(() => {
    const provided = Array.isArray(banners) ? banners.filter(Boolean).slice(0, 3) : []
    if (provided.length >= 3) {
      return provided
    }

    const merged: Banner[] = [...provided]
    for (const fallback of FALLBACK_SIDEBAR_BANNERS) {
      if (merged.length >= 3) break
      if (!merged.some((banner) => banner.id === fallback.id)) {
        merged.push(fallback)
      }
    }

    return merged.slice(0, 3)
  }, [banners])

  return (
    <div
      className="sidebar sidebar-sticky"
      style={{
        height: 'var(--sidebar-total-height, 832px)',
        minHeight: 'var(--sidebar-total-height, 832px)'
      }}
    >
      {bannerSlides.length > 0 && (
        <div className="sidebar-banner-stack">
          <BannerCarousel banners={bannerSlides} variant="sidebar" />
        </div>
      )}

      {/* Popular News */}
      <div
        className="sidebar-card sidebar-news-card"
        style={{
          height: 'var(--sidebar-news-card-h, 360px)',
          minHeight: 'var(--sidebar-news-card-h, 360px)'
        }}
      >
        <div className="sidebar-news-header">
          <h3 className="sidebar-title">한국 최근 기사/소식 <span className="news-timestamp">{currentTime} <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>KST</span></span></h3>
        </div>

        <div className="sidebar-news-list">
          {newsLoading ? (
            <div className="news-item-card">
              <div className="news-item-content">
                <div className="news-item-title" style={{ color: '#9ca3af' }}>기사 정보를 불러오는 중...</div>
              </div>
            </div>
          ) : newsError ? (
            <div className="news-item-card">
              <div className="news-item-content">
                <div className="news-item-title" style={{ color: '#ef4444' }}>{newsError}</div>
              </div>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="news-item-card">
              <div className="news-item-content">
                <div className="news-item-title" style={{ color: '#9ca3af' }}>등록된 정보 글이 없습니다.</div>
              </div>
            </div>
          ) : (
            newsItems.map((item) => {
              const timeLabel = formatRelativeTime(item.created_at)
              return (
                <a
                  key={item.id}
                  className="news-item-card news-item-link"
                  href={`/posts/${item.id}`}
                >
                  <div className="news-item-content">
                    <div className="news-item-title">
                      {item.category?.icon && <span style={{ marginRight: '0.5rem' }}>{item.category.icon}</span>}
                      {item.title}
                    </div>
                    <div className="news-item-meta">
                      <span className="vk-chip vk-chip--xs vk-chip--muted news-item-time">
                        <span className="vk-chip__label">{timeLabel}</span>
                      </span>
                      <span className="vk-chip vk-chip--xs vk-chip--link vk-chip--interactive news-detail-btn">
                        <span className="vk-chip__label">자세히</span>
                      </span>
                    </div>
                  </div>
                </a>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return '방금 전'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}일 전`
  return date.toLocaleDateString('ko-KR')
}
