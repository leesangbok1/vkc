'use client'

import React, { useState, useEffect } from 'react'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Database,
  UserCheck,
  MessageSquare,
  Globe
} from 'lucide-react'
import VerificationApproval from '@/components/admin/VerificationApproval'
import UserManagement from '@/components/admin/UserManagement'

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

export default function AdminDashboard() {
  const { user, profile, loading } = useSafeAuth()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // 권한 확인
  const userRole = (profile as any)?.role || UserRole.USER
  const isAdmin = userRole === UserRole.ADMIN

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">접근 권한 없음</CardTitle>
            <CardDescription>
              관리자만 이 페이지에 접근할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <a href="/">홈으로 돌아가기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                관리자 대시보드
              </h1>
              <p className="text-gray-600 mt-1">VietKConnect 플랫폼 관리 및 통계</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getRoleDisplayInfo(userRole).badgeColor}>
                {getRoleDisplayInfo(userRole).icon} {getRoleDisplayInfo(userRole).label}
              </Badge>
              <span className="text-sm text-gray-500">
                {profile?.name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              인증 관리
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              콘텐츠 관리
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              시스템 설정
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
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

            {/* 시스템 상태 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    시스템 상태
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">데이터베이스</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      정상
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">인증 서버</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      정상
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">알림 시스템</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      점검 중
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">파일 저장소</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      정상
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    최근 활동
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">새 사용자 가입</div>
                      <div className="text-xs text-gray-600">15분 전</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">인증 승인 완료</div>
                      <div className="text-xs text-gray-600">32분 전</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">인증 요청 접수</div>
                      <div className="text-xs text-gray-600">1시간 전</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 사용자 관리 탭 */}
          <TabsContent value="users">
            <UserManagement userRole={userRole} />
          </TabsContent>

          {/* 인증 관리 탭 */}
          <TabsContent value="verification">
            <VerificationApproval userRole={userRole} />
          </TabsContent>

          {/* 콘텐츠 관리 탭 */}
          <TabsContent value="content">
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
          </TabsContent>

          {/* 시스템 설정 탭 */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>시스템 설정</CardTitle>
                <CardDescription>
                  플랫폼 설정, 권한 관리, 시스템 구성을 변경할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">시스템 설정</h3>
                  <p className="text-gray-400 mb-4">고급 시스템 설정 기능을 준비 중입니다.</p>
                  <Button variant="outline">
                    구현 예정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </TabsPrimitive.Root>
      </div>
    </div>
  )
}