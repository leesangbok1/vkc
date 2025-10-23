'use client'

import { useState, useEffect, useMemo } from 'react'
import BannerCarousel from '@/components/banners/BannerCarousel'

type Banner = {
  id: string
  title: string
  description: string
  linkUrl: string
  backgroundColor?: string
}

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
  const [currentTime, setCurrentTime] = useState('')
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

  const bannerSlides = useMemo(() => (
    (banners ?? []).slice(0, 4)
  ), [banners])

  return (
    <div className="sidebar sidebar-sticky">
      {bannerSlides.length > 0 && (
        <BannerCarousel banners={bannerSlides} variant="sidebar" />
      )}

      {/* Popular News */}
      <div className="sidebar-card sidebar-news-card">
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
                      <span className="news-item-time">{timeLabel}</span>
                      <span className="news-detail-btn">자세히</span>
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
