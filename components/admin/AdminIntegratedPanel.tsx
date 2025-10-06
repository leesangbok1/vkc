'use client'

import React, { useState, useEffect } from 'react'
import { UserRole } from '@/lib/utils/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  Shield,
  Database,
  UserCheck,
  MessageSquare,
  Settings,
  Globe,
  Bell,
  Eye,
  X
} from 'lucide-react'
import UserManagement from './UserManagement'
import VerificationApproval from './VerificationApproval'

interface AdminIntegratedPanelProps {
  userRole: UserRole
  className?: string
}

interface PlatformStats {
  totalUsers: number
  totalQuestions: number
  totalAnswers: number
  pendingVerifications: number
  activeUsers24h: number
  responseRate: number
  satisfactionScore: number
  newUsersToday: number
}

interface UserStats {
  guest: number
  user: number
  verified: number
  admin: number
}

export default function AdminIntegratedPanel({ userRole, className }: AdminIntegratedPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('dashboard')
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const isAdmin = userRole === UserRole.ADMIN

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()

      // 헤더에서 관리자 패널 열기 이벤트 수신
      const handleOpenAdminPanel = () => {
        setIsVisible(true)
        // 메인 컨텐츠 숨기기
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          mainContent.style.display = 'none'
        }
      }

      window.addEventListener('openAdminPanel', handleOpenAdminPanel)

      return () => {
        window.removeEventListener('openAdminPanel', handleOpenAdminPanel)
      }
    }
  }, [isAdmin])

  const loadDashboardData = async () => {
    try {
      // Mock 데이터 (실제로는 API 호출)
      const mockStats: PlatformStats = {
        totalUsers: 2847,
        totalQuestions: 1356,
        totalAnswers: 3421,
        pendingVerifications: 12,
        activeUsers24h: 234,
        responseRate: 87.5,
        satisfactionScore: 4.6,
        newUsersToday: 18
      }

      const mockUserStats: UserStats = {
        guest: 1420,
        user: 1287,
        verified: 132,
        admin: 8
      }

      setStats(mockStats)
      setUserStats(mockUserStats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const showAdminPanel = () => {
    setIsVisible(true)
    // 메인 컨텐츠 숨기기
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.style.display = 'none'
    }
  }

  const hideAdminPanel = () => {
    setIsVisible(false)
    // 메인 컨텐츠 표시
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.style.display = 'block'
    }
  }

  if (!isAdmin) return null

  return (
    <>
      {/* 관리자 패널 진입 버튼 */}
      {!isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={showAdminPanel}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-full p-4 h-auto"
          >
            <Shield className="w-6 h-6 mr-2" />
            관리자 패널
          </Button>
        </div>
      )}

      {/* 통합 관리자 패널 */}
      {isVisible && (
        <div
          id="admin-panel"
          className="fixed inset-0 bg-gray-50 z-40 overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                  <Badge className="bg-purple-100 text-purple-800">
                    Admin Panel
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={hideAdminPanel}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  닫기
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-6">
            {/* 빠른 액션 버튼 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Button
                variant={activeSection === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveSection('dashboard')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <BarChart3 className="w-5 h-5" />
                <span>대시보드</span>
              </Button>
              <Button
                variant={activeSection === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveSection('users')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <Users className="w-5 h-5" />
                <span>사용자 관리</span>
              </Button>
              <Button
                variant={activeSection === 'verification' ? 'default' : 'outline'}
                onClick={() => setActiveSection('verification')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <UserCheck className="w-5 h-5" />
                <span>인증 관리</span>
              </Button>
              <Button
                variant={activeSection === 'content' ? 'default' : 'outline'}
                onClick={() => setActiveSection('content')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <MessageSquare className="w-5 h-5" />
                <span>콘텐츠</span>
              </Button>
            </div>

            {/* 대시보드 섹션 */}
            {activeSection === 'dashboard' && (
              <div id="admin-dashboard" className="space-y-6">
                {/* 핵심 지표 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        오늘 +{stats?.newUsersToday}명
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">총 질문</CardTitle>
                      <FileText className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalQuestions.toLocaleString()}</div>
                      <p className="text-xs text-gray-600 mt-1">
                        답변률 {stats?.responseRate}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">활성 사용자 (24h)</CardTitle>
                      <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.activeUsers24h}</div>
                      <p className="text-xs text-gray-600 mt-1">
                        만족도 {stats?.satisfactionScore}/5.0
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">대기 중인 인증</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats?.pendingVerifications}</div>
                      <p className="text-xs text-gray-600 mt-1">
                        검토 필요
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 사용자 역할별 분포 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      사용자 역할별 분포
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl mb-1">🔒</div>
                        <div className="text-xl font-bold">{userStats?.guest.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">게스트</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl mb-1">👤</div>
                        <div className="text-xl font-bold">{userStats?.user.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">일반사용자</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl mb-1">✅</div>
                        <div className="text-xl font-bold">{userStats?.verified.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">인증사용자</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl mb-1">👑</div>
                        <div className="text-xl font-bold">{userStats?.admin}</div>
                        <div className="text-sm text-gray-600">관리자</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 사용자 관리 섹션 */}
            {activeSection === 'users' && (
              <div id="admin-users">
                <UserManagement userRole={userRole} />
              </div>
            )}

            {/* 인증 관리 섹션 */}
            {activeSection === 'verification' && (
              <div id="admin-verification">
                <VerificationApproval userRole={userRole} />
              </div>
            )}

            {/* 콘텐츠 관리 섹션 */}
            {activeSection === 'content' && (
              <div id="admin-content">
                <Card>
                  <CardHeader>
                    <CardTitle>콘텐츠 관리</CardTitle>
                    <CardDescription>
                      질문, 답변, 댓글 등의 콘텐츠를 관리할 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">콘텐츠 관리 기능</h3>
                      <p className="text-gray-400 mb-4">질문, 답변 관리 기능을 준비 중입니다.</p>
                      <Button variant="outline">
                        구현 예정
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}