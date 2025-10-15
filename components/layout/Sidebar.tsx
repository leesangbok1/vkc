'use client'

import { useState, useEffect } from 'react'

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
export default function Sidebar({ showContent = true }: { showContent?: boolean }) {
  const [currentTime, setCurrentTime] = useState('')

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

  // 빈 사이드바 (질문/답변 페이지가 아닌 경우)
  if (!showContent) {
    return <div className="sidebar sidebar-sticky"></div>
  }

  return (
    <div className="sidebar sidebar-sticky">
      {/* Advertisement Banner - Certified User 인증 (최근 기사 스타일) */}
      <div className="sidebar-card sidebar-banner-card">
        <div className="sidebar-banner-header">
          <h3 className="sidebar-title">✅ 경험 인증으로 신뢰도 높이기</h3>
        </div>

        <div className="sidebar-banner-content">
          <p className="banner-description" style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: 500 }}>
            "<span style={{ color: '#2563eb', fontWeight: 700 }}>실제 경험</span>을 <span style={{ color: '#059669', fontWeight: 700 }}>검증된 지식</span>으로 전환하세요"
          </p>
          <ul className="banner-benefits">
            <li>외국인등록증, 재직/재학증명서로 인증</li>
            <li>24시간 내 관리자 심사 완료</li>
            <li>프로필에 <strong>인증 뱃지</strong> 표시</li>
          </ul>
          <a href="/experts/apply" className="banner-action-btn">Certified User 인증 신청하기</a>
        </div>
      </div>

      {/* Popular News */}
      <div className="sidebar-card sidebar-news-card">
        <div className="sidebar-news-header">
          <h3 className="sidebar-title">한국 최근 기사/소식 <span className="news-timestamp">{currentTime} <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>KST</span></span></h3>
        </div>

        <div className="sidebar-news-list">
          <div className="news-item-card">
            <div className="news-item-content">
              <div className="news-item-title">2025년 E-9 비자 쿼터 확대 발표</div>
              <div className="news-item-meta">
                <span className="news-item-time">2시간 전</span>
                <a href="/posts/1" className="news-detail-btn">자세히</a>
              </div>
            </div>
          </div>

          <div className="news-item-card">
            <div className="news-item-content">
              <div className="news-item-title">한국어능력시험(TOPIK) 접수 안내</div>
              <div className="news-item-meta">
                <span className="news-item-time">5시간 전</span>
                <a href="/posts/2" className="news-detail-btn">자세히</a>
              </div>
            </div>
          </div>

          <div className="news-item-card">
            <div className="news-item-content">
              <div className="news-item-title">베트남인 근로자 최저임금 인상</div>
              <div className="news-item-meta">
                <span className="news-item-time">1일 전</span>
                <a href="/posts/3" className="news-detail-btn">자세히</a>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-news-footer">
          <a href="/posts" className="news-more-button">
            전체 기사 보기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
