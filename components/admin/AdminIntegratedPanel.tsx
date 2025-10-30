'use client'

import { useMemo } from 'react'
import { UserRole } from '@/lib/utils/permissions'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react'
import UserManagement from './UserManagement'
import VerificationApproval from './VerificationApproval'
import ReportModerationPanel from './ReportModerationPanel'
import { useAdminOverview } from '@/components/admin/AdminOverviewProvider'

interface AdminIntegratedPanelProps {
  userRole: UserRole
  className?: string
}

const formatNumber = (value: number | null | undefined, withThousands = true) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return withThousands ? value.toLocaleString() : String(value)
}

export default function AdminIntegratedPanel({ userRole, className }: AdminIntegratedPanelProps) {
  const isAdmin = userRole === UserRole.ADMIN
  const { stats, userStats, loading: overviewLoading, error } = useAdminOverview()

  const dashboardCards = useMemo(
    () => [
      {
        title: '총 사용자',
        icon: <Users className="h-4 w-4 text-blue-600" />,
        value: formatNumber(stats?.totalUsers),
        helper: `오늘 +${formatNumber(stats?.newUsersToday, false)}명`,
        helperClass: 'text-green-600',
      },
      {
        title: '총 질문',
        icon: <BarChart3 className="h-4 w-4 text-green-600" />,
        value: formatNumber(stats?.totalQuestions),
        helper:
          stats?.responseRate != null
            ? `답변률 ${stats.responseRate}%`
            : '답변률 데이터 없음',
      },
      {
        title: '활성 사용자 (24h)',
        icon: <Activity className="h-4 w-4 text-orange-600" />,
        value: formatNumber(stats?.activeUsers24h, false),
        helper:
          stats?.satisfactionScore != null
            ? `만족도 ${stats.satisfactionScore}/5`
            : '만족도 데이터 없음',
      },
      {
        title: '대기 중인 인증',
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        value: formatNumber(stats?.pendingVerifications, false),
        helper: '검토 필요',
        valueClass: 'text-yellow-600',
      },
    ],
    [stats]
  )

  const roleDistribution = useMemo(
    () => [
      { label: '게스트', value: formatNumber(userStats?.guest), tone: 'bg-gray-50', icon: '🔒' },
      { label: '일반 사용자', value: formatNumber(userStats?.user), tone: 'bg-blue-50', icon: '👤' },
      { label: '인증 사용자', value: formatNumber(userStats?.verified), tone: 'bg-green-50', icon: '✅' },
      { label: '관리자', value: formatNumber(userStats?.admin, false), tone: 'bg-purple-50', icon: '👑' },
    ],
    [userStats]
  )

  if (!isAdmin) return null

  return (
    <div
      className={cn(
        'space-y-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg lg:p-8',
        className
      )}
    >
      <header className="flex flex-col gap-6 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-100/80">Platform Admin</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">관리자 패널</h1>
          <p className="mt-3 text-sm text-purple-100/90">
            플랫폼 운영 현황을 확인하고 사용자·인증·신고 관리를 한 화면에서 처리하세요.
          </p>
        </div>
        <div className="grid w-full gap-4 text-sm sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
          {[
            { label: '대기 중 인증', value: formatNumber(stats?.pendingVerifications, false) },
            { label: '오늘 신규 가입', value: `+${formatNumber(stats?.newUsersToday, false)}` },
            { label: '24시간 활성', value: formatNumber(stats?.activeUsers24h, false) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-purple-100/80">{item.label}</p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="flex flex-wrap gap-3">
          {[
            { target: 'admin-dashboard', label: '운영 대시보드' },
            { target: 'admin-users', label: '사용자 관리' },
            { target: 'admin-verification', label: '인증 심사' },
            { target: 'admin-content', label: '신고 처리' },
        ].map((item) => (
          <Button
            key={item.target}
            variant="outline"
            className="rounded-full"
            onClick={() => {
              const el = document.getElementById(item.target)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">지표를 불러오지 못했습니다.</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <section id="admin-dashboard" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', card.valueClass)}>{card.value}</div>
                <p className={cn('mt-1 text-xs text-gray-600', card.helperClass)}>{card.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              사용자 역할 분포
            </CardTitle>
            <CardDescription>가입자 역할 현황을 통해 인증/운영 전략을 조정하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {roleDistribution.map((role) => (
                <div key={role.label} className={cn('rounded-lg p-4 text-center', role.tone)}>
                  <div className="mb-1 text-2xl">{role.icon}</div>
                  <div className="text-xl font-bold">{role.value}</div>
                  <div className="text-sm text-gray-600">{role.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="admin-users" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
            <p className="text-sm text-gray-600">
              역할 변경, 활동 내역 확인 등 사용자 계정을 직접 관리합니다.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-purple-700 border-purple-200">
            <Users className="h-3 w-3" />
            Admin tool
          </Badge>
        </header>
        <UserManagement userRole={userRole} />
      </section>

      <section id="admin-verification" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">인증 심사</h2>
            <p className="text-sm text-gray-600">
              제출 서류를 검토하고 승인/반려, 관리자 메모를 관리합니다.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Certification
          </Badge>
        </header>
        <VerificationApproval userRole={userRole} />
      </section>

      <section id="admin-content" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">신고 처리</h2>
            <p className="text-sm text-gray-600">
              신고 접수된 질문, 답변, 댓글을 검토하고 상태를 업데이트하세요.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-red-700 border-red-200">
            <MessageSquare className="h-3 w-3" />
            Moderation
          </Badge>
        </header>
        <ReportModerationPanel />
      </section>

      {overviewLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-purple-500" />
          최신 데이터를 불러오는 중입니다...
        </div>
      ) : null}
    </div>
  )
}
