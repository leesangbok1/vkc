'use client'

import React from 'react'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { UserRole } from '@/lib/utils/permissions'
import AdminIntegratedPanel from './AdminIntegratedPanel'
import AdminSidebar from './AdminSidebar'

interface AdminIntegratedWrapperProps {
  children: React.ReactNode
}

export default function AdminIntegratedWrapper({ children }: AdminIntegratedWrapperProps) {
  const { user, profile, loading } = useSafeAuth()

  // 4-tier 권한 시스템: 사용자 역할 결정
  const userRole = user ? ((profile as any)?.role || UserRole.USER) : UserRole.GUEST
  const isAdmin = userRole === UserRole.ADMIN

  if (loading) {
    return <div>{children}</div>
  }

  return (
    <>
      {/* 관리자 사이드바 - 관리자만 표시 */}
      {isAdmin && <AdminSidebar userRole={userRole} />}

      {/* 메인 컨텐츠 */}
      <div id="main-content" className={isAdmin ? 'ml-16' : ''}>
        {children}
      </div>

      {/* 관리자 통합 패널 - 관리자만 표시 */}
      {isAdmin && <AdminIntegratedPanel userRole={userRole} />}
    </>
  )
}