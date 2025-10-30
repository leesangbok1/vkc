'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminOverview } from '@/components/admin/AdminOverviewProvider'

const formatNumber = (value: number | null | undefined, withThousands = true) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return withThousands ? value.toLocaleString() : String(value)
}

export default function AdminOverviewSummary() {
  const { stats, loading, error, refresh } = useAdminOverview()

  const summaryItems = useMemo(() => {
    if (!stats) {
      return [
        { label: '총 사용자', value: '-', helper: '' },
        { label: '신규 가입 (오늘)', value: '-', helper: '' },
        { label: '활성 사용자 (24h)', value: '-', helper: '' },
        { label: '대기 중 인증', value: '-', helper: '' },
      ]
    }

    return [
      {
        label: '총 사용자',
        value: formatNumber(stats.totalUsers),
        helper: `오늘 +${formatNumber(stats.newUsersToday, false)}명`,
      },
      {
        label: '신규 가입 (오늘)',
        value: `+${formatNumber(stats.newUsersToday, false)}`,
        helper: '00시 기준 일일 신규 회원',
      },
      {
        label: '활성 사용자 (24h)',
        value: formatNumber(stats.activeUsers24h, false),
        helper: stats.satisfactionScore != null ? `만족도 ${stats.satisfactionScore}/5` : '최근 24시간 로그인',
      },
      {
        label: '대기 중 인증',
        value: formatNumber(stats.pendingVerifications, false),
        helper: '승인 검토 필요 건수',
      },
    ]
  }, [stats])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.label} className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? <span className="text-gray-400">불러오는 중...</span> : item.value}
            </div>
            {item.helper && (
              <CardDescription className="mt-1 text-xs text-gray-500">
                {loading ? '' : item.helper}
              </CardDescription>
            )}
          </CardContent>
        </Card>
      ))}
      {error && (
        <Card className="md:col-span-2 xl:col-span-4 border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-4 text-sm text-red-600">
            <span>{error}</span>
            <button
              type="button"
              className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600"
              onClick={refresh}
            >
              다시 시도
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
