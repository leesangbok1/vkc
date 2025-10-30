'use client'

import { useEffect, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import AdminIntegratedPanel from '@/components/admin/AdminIntegratedPanel'
import AdminOverviewSummary from '@/components/admin/AdminOverviewSummary'
import { AdminOverviewProvider } from '@/components/admin/AdminOverviewProvider'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserRole } from '@/lib/utils/permissions'

export default function AdminPage() {
  const { isLoggedIn, user, isLoading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST)
  useEffect(() => {
    if (user?.role) {
      switch (user.role.toLowerCase()) {
        case 'admin':
          setUserRole(UserRole.ADMIN)
          break
        case 'verified':
          setUserRole(UserRole.VERIFIED)
          break
        case 'user':
          setUserRole(UserRole.USER)
          break
        default:
          setUserRole(UserRole.GUEST)
      }
    } else if (!isLoading) {
      setUserRole(isLoggedIn ? UserRole.USER : UserRole.GUEST)
    }
  }, [user, isLoggedIn, isLoading])

  const isAdmin = userRole === UserRole.ADMIN

  if (isLoading) {
    return (
      <PageLayout variant="withSidebar" showSidebar={false}>
        <div className="admin-dashboard-page">
          <section className="card admin-hero">
            <p>관리자 권한을 확인하는 중입니다...</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return (
      <PageLayout variant="withSidebar" showSidebar={false}>
        <div className="admin-dashboard-page">
          <section className="card admin-warning">
            <div className="admin-warning-icon">🔐</div>
            <h1>관리자 전용 페이지입니다</h1>
            <p>접근 권한이 있는 계정으로 로그인해주세요.</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  const handleNavigate = (targetId: string) => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <PageLayout variant="withSidebar" showSidebar={false}>
      <AdminOverviewProvider>
        <div className="admin-dashboard-page">
        <section className="card admin-hero">
          <div className="admin-hero-top">
            <div>
              <h1 className="admin-hero-title">관리자 대시보드</h1>
              <p className="admin-hero-subtitle">플랫폼 운영 현황과 주요 도구를 한 화면에서 제어하세요.</p>
            </div>
          </div>
          <div className="admin-hero-summary">
            <AdminOverviewSummary />
          </div>
        </section>

        <section className="card admin-feature-card">
          <h2 className="admin-feature-title">주요 기능</h2>
          <div className="admin-feature-grid">
            <button
              type="button"
              className="admin-feature-item"
              onClick={() => handleNavigate('admin-dashboard')}
            >
              <span aria-hidden>👥</span>
              <div>
                <p className="admin-feature-head">사용자 및 인증 현황</p>
                <p className="admin-feature-copy">인증 대기 인원과 역할 분포를 한 번에 확인하세요.</p>
              </div>
            </button>
            <button
              type="button"
              className="admin-feature-item"
              onClick={() => handleNavigate('admin-content')}
            >
              <span aria-hidden>💬</span>
              <div>
                <p className="admin-feature-head">콘텐츠 신고 처리</p>
                <p className="admin-feature-copy">신고 접수 현황을 빠르게 검토하고 조치하세요.</p>
              </div>
            </button>
            <button
              type="button"
              className="admin-feature-item"
              onClick={() => handleNavigate('admin-dashboard')}
            >
              <span aria-hidden>📈</span>
              <div>
                <p className="admin-feature-head">활동 지표 모니터링</p>
                <p className="admin-feature-copy">질문·답변 증가 추세와 만족도 지표를 추적합니다.</p>
              </div>
            </button>
            <button
              type="button"
              className="admin-feature-item"
              onClick={() => {
                window.location.href = '/admin/news/new'
              }}
            >
              <span aria-hidden>📰</span>
              <div>
                <p className="admin-feature-head">기사 · 소식 작성</p>
                <p className="admin-feature-copy">관리자 전용 뉴스 업로드 화면으로 이동합니다.</p>
              </div>
            </button>
          </div>
        </section>

        <section className="card admin-panel-card">
          <h2 className="admin-feature-title">운영 도구</h2>
          <p className="admin-feature-copy">아래 패널에서 사용자 관리, 인증 심사, 신고 처리를 바로 실행할 수 있습니다.</p>
          <AdminIntegratedPanel userRole={userRole} />
        </section>
        </div>
      </AdminOverviewProvider>
    </PageLayout>
  )
}
