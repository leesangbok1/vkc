'use client'

import { useEffect, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import AdminIntegratedPanel from '@/components/admin/AdminIntegratedPanel'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserRole } from '@/lib/utils/permissions'

export default function AdminPage() {
  const { isLoggedIn, profile, isLoading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST)

  useEffect(() => {
    if (profile?.role) {
      const role = profile.role.toLowerCase()
      if (role === 'admin') {
        setUserRole(UserRole.ADMIN)
      } else if (role === 'verified') {
        setUserRole(UserRole.VERIFIED)
      } else {
        setUserRole(UserRole.USER)
      }
    } else if (!isLoading && !isLoggedIn) {
      setUserRole(UserRole.GUEST)
    }
  }, [profile, isLoggedIn, isLoading])

  const isAdmin = userRole === UserRole.ADMIN

  if (isLoading) {
    return (
      <PageLayout variant="centered">
        <div className="admin-page-loading">관리자 권한을 확인하는 중입니다...</div>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return (
      <PageLayout variant="centered">
        <div className="admin-page-unauthorized">
          <div className="admin-page-unauthorized-icon">🔐</div>
          <h1>관리자 전용 페이지입니다</h1>
          <p>접근 권한이 있는 계정으로 로그인해주세요.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
      <div className="admin-page-container">
        <header className="admin-page-header">
          <div>
            <h1>관리자 대시보드</h1>
            <p>플랫폼 운영을 위한 핵심 지표와 관리 도구를 확인하세요.</p>
          </div>
        </header>

        <section className="admin-page-section">
          <h2>주요 기능</h2>
          <ul className="admin-page-feature-list">
            <li>사용자 및 인증 현황 모니터링</li>
            <li>신규 질문/답변 활동 추세 확인</li>
            <li>답변 채택률 등 핵심 지표 추적</li>
          </ul>
        </section>
      </div>
      <AdminIntegratedPanel userRole={userRole} />
    </PageLayout>
  )
}
