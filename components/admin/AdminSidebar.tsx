'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  Shield,
  Database,
  Activity,
  Bell,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: UserRole
  className?: string
}

export default function AdminSidebar({ userRole, className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isAdmin = userRole === UserRole.ADMIN

  if (!isAdmin) return null

  const adminMenuItems = [
    {
      id: 'dashboard',
      title: '대시보드 개요',
      icon: BarChart3,
      href: '#dashboard',
      description: '플랫폼 통계 및 핵심 지표'
    },
    {
      id: 'users',
      title: '사용자 관리',
      icon: Users,
      href: '#users',
      description: '사용자 검색, 역할 변경, 계정 관리'
    },
    {
      id: 'verification',
      title: '인증 관리',
      icon: UserCheck,
      href: '#verification',
      description: '문서 인증 승인/거부 관리'
    },
    {
      id: 'content',
      title: '콘텐츠 관리',
      icon: MessageSquare,
      href: '#content',
      description: '질문, 답변, 댓글 관리'
    },
    {
      id: 'notifications',
      title: '알림 관리',
      icon: Bell,
      href: '#notifications',
      description: '시스템 알림 및 이메일 발송'
    },
    {
      id: 'analytics',
      title: '통계 분석',
      icon: TrendingUp,
      href: '#analytics',
      description: '사용자 활동 및 성과 분석'
    },
    {
      id: 'system',
      title: '시스템 설정',
      icon: Settings,
      href: '#system',
      description: '플랫폼 설정 및 구성 관리'
    }
  ]

  const handleMenuClick = (menuId: string) => {
    // 메인 페이지의 관리자 섹션으로 스크롤
    const element = document.getElementById(`admin-${menuId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r shadow-lg transition-all duration-300 z-30",
        isCollapsed ? "w-16" : "w-72",
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-purple-50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">관리자 패널</span>
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              Admin
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* 홈으로 돌아가기 */}
      <div className="p-4 border-b">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            // 관리자 섹션 숨기기
            const adminPanel = document.getElementById('admin-panel')
            if (adminPanel) {
              adminPanel.style.display = 'none'
            }
            // 메인 컨텐츠 표시
            const mainContent = document.getElementById('main-content')
            if (mainContent) {
              mainContent.style.display = 'block'
            }
          }}
        >
          <Home className="w-4 h-4" />
          {!isCollapsed && <span>메인으로 돌아가기</span>}
        </Button>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {adminMenuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto p-3 text-left hover:bg-purple-50 transition-colors",
                isCollapsed && "px-2"
              )}
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">
                    {item.description}
                  </div>
                </div>
              )}
            </Button>
          ))}
        </div>
      </nav>

      {/* 하단 상태 */}
      <div className="p-4 border-t bg-gray-50">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">시스템 상태</span>
              <span className="text-green-600 font-medium">정상</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">DB 연결</span>
              <span className="text-blue-600 font-medium">양호</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <Database className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </div>
    </aside>
  )
}