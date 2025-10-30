'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  ReportStatus,
  ReportTargetType
} from '@/lib/constants/reports'
import {
  Loader2,
  RefreshCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info
} from 'lucide-react'

type ReportFilters = {
  status: 'all' | ReportStatus
  targetType: 'all' | ReportTargetType
}

interface AdminReportUser {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
}

interface AdminReportTarget {
  title?: string | null
  excerpt?: string | null
  url?: string | null
  status?: string | null
  postType?: string | null
  questionId?: string | null
  createdAt?: string | null
  isHidden?: boolean | null
}

interface AdminReport {
  id: string
  targetId: string
  targetType: ReportTargetType
  reason: string
  reasonLabel: string
  description?: string | null
  status: ReportStatus
  createdAt: string
  updatedAt: string
  reviewedAt?: string | null
  reporter?: AdminReportUser | null
  reviewer?: AdminReportUser | null
  metadata?: Record<string, unknown>
  target?: AdminReportTarget | null
}

type ModerationLogEntry = {
  action?: string
  moderatorId?: string
  timestamp?: string
}

interface ReportsSummaryPayload {
  total: number
  byStatus: Record<ReportStatus, number>
  filters: {
    status: ReportStatus | null
    targetType: ReportTargetType | null
    since: string | null
  }
  limit: number
}

const statusLabels: Record<ReportStatus, string> = {
  pending: '대기',
  in_review: '검토 중',
  resolved: '해결',
  dismissed: '무효'
}

const statusBadgeClasses: Record<ReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  in_review: 'bg-blue-100 text-blue-700 border border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  dismissed: 'bg-gray-200 text-gray-700 border border-gray-300'
}

const targetTypeLabels: Record<'all' | ReportTargetType, string> = {
  all: '전체',
  question: '질문',
  post: '정보글',
  answer: '답변',
  comment: '댓글'
}

const filtersDefault: ReportFilters = {
  status: 'pending',
  targetType: 'all'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatReporterName = (user?: AdminReportUser | null) => {
  if (!user) return '알 수 없음'
  if (user.name) return user.name
  if (user.email) return user.email
  return user.id
}

export default function ReportModerationPanel() {
  const [filters, setFilters] = useState<ReportFilters>(filtersDefault)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [summary, setSummary] = useState<ReportsSummaryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [contentActionKey, setContentActionKey] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  const loadReports = useCallback(async (activeFilters: ReportFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeFilters.status !== 'all') {
        params.set('status', activeFilters.status)
      }
      if (activeFilters.targetType !== 'all') {
        params.set('targetType', activeFilters.targetType)
      }
      const queryString = params.toString()
      const response = await fetch(`/api/admin/reports${queryString ? `?${queryString}` : ''}`, {
        cache: 'no-store'
      })

      const payload = await response.json().catch(() => ({}))

      if (response.status === 401 || response.status === 403) {
        throw new Error('관리자 인증이 필요합니다.')
      }
      if (!response.ok) {
        throw new Error(payload?.error || '신고 목록을 불러오지 못했습니다.')
      }

      const items = Array.isArray(payload?.reports) ? (payload.reports as AdminReport[]) : []
      setReports(items)
      setSummary(payload?.summary ?? null)
      setLastUpdatedAt(new Date().toISOString())
    } catch (err: any) {
      console.error('[ReportModerationPanel] load failed', err)
      setError(err?.message || '신고 목록을 불러오지 못했습니다.')
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports(filtersDefault)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    loadReports(filters)
  }

  const handleStatusFilterChange = (status: 'all' | ReportStatus) => {
    const nextFilters = { ...filters, status }
    setFilters(nextFilters)
    loadReports(nextFilters)
  }

  const handleTargetFilterChange = (targetType: 'all' | ReportTargetType) => {
    const nextFilters = { ...filters, targetType }
    setFilters(nextFilters)
    loadReports(nextFilters)
  }

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    setActionLoadingId(reportId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || '신고 상태를 변경하지 못했습니다.')
      }
      await loadReports(filters)
    } catch (err: any) {
      console.error('[ReportModerationPanel] update failed', err)
      setError(err?.message || '신고 상태를 변경하지 못했습니다.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const updateReportStatusSilently = async (reportId: string, status: ReportStatus) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || '신고 상태를 업데이트하지 못했습니다.')
      }
    } catch (err: any) {
      console.error('[ReportModerationPanel] silent status update failed', err)
      setError(err?.message || '신고 상태 업데이트에 실패했습니다.')
    }
  }

  const moderateContent = async (
    report: AdminReport,
    action: 'hide' | 'unhide' | 'delete'
  ) => {
    const key = `${report.id}-${action}`
    setContentActionKey(key)
    setError(null)
    try {
      if (action === 'delete') {
        const confirmed = window.confirm('정말 이 콘텐츠를 삭제하시겠습니까? 되돌릴 수 없습니다.')
        if (!confirmed) {
          setContentActionKey(null)
          return
        }
      }

      const endpoint = `/api/admin/content/${report.targetType}/${report.targetId}`
      const fetchOptions: RequestInit =
        action === 'delete'
          ? {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reportId: report.id }),
            }
          : {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action, reportId: report.id }),
            }

      const response = await fetch(endpoint, fetchOptions)
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || '콘텐츠 처리에 실패했습니다.')
      }

      const nextStatus: ReportStatus | null =
        action === 'delete' ? 'resolved'
          : action === 'hide' ? 'resolved'
            : action === 'unhide' ? 'in_review'
              : null

      if (nextStatus) {
        await updateReportStatusSilently(report.id, nextStatus)
      }

      await loadReports(filters)
    } catch (err: any) {
      console.error('[ReportModerationPanel] content moderation failed', err)
      setError(err?.message || '콘텐츠 처리에 실패했습니다.')
    } finally {
      setContentActionKey(null)
    }
  }

  const renderActionButtons = (report: AdminReport) => {
    const isLoadingAction = actionLoadingId === report.id

    if (report.status === 'pending') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary-outline"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'in_review')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            검토 시작
          </Button>
          <Button
            size="sm"
            variant="primary-green"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'resolved')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            해결
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'dismissed')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            무효 처리
          </Button>
        </div>
      )
    }

    if (report.status === 'in_review') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary-green"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'resolved')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            해결
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'dismissed')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            무효 처리
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isLoadingAction}
            onClick={() => updateReportStatus(report.id, 'pending')}
          >
            {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            대기로 되돌리기
          </Button>
        </div>
      )
    }

    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isLoadingAction}
        onClick={() => updateReportStatus(report.id, 'pending')}
      >
        {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
        다시 열기
      </Button>
    )
  }

  const renderContentActions = (report: AdminReport) => {
    const hideKey = `${report.id}-hide`
    const deleteKey = `${report.id}-delete`
    const isHideLoading = contentActionKey === hideKey
    const isDeleteLoading = contentActionKey === deleteKey

  const targetLabel = (() => {
    switch (report.targetType) {
      case 'question':
        return '질문'
      case 'answer':
          return '답변'
        case 'comment':
          return '댓글'
        case 'post':
          return '게시글'
        default:
          return '콘텐츠'
      }
  })()

    const isHidden = Boolean(report.target?.isHidden)

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={isHidden ? 'primary-outline' : 'outline'}
          disabled={isHideLoading}
          onClick={() => moderateContent(report, isHidden ? 'unhide' : 'hide')}
        >
          {isHideLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldAlert className="mr-2 h-4 w-4" />
          )}
          {isHidden ? `${targetLabel} 표시 복원` : `${targetLabel} 숨기기`}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isDeleteLoading}
          onClick={() => moderateContent(report, 'delete')}
        >
          {isDeleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
          {targetLabel} 삭제
        </Button>
      </div>
    )
  }

  const buildModerationHistory = (report: AdminReport) => {
    const metadata = report.metadata
    if (!metadata || typeof metadata !== 'object') return []
    const historyRaw = (metadata as Record<string, unknown>).moderationHistory
    if (!Array.isArray(historyRaw)) return []

    return historyRaw
      .filter((item): item is ModerationLogEntry => item && typeof item === 'object')
      .map((entry) => ({
        action: typeof entry.action === 'string' ? entry.action : 'unknown',
        moderatorId: typeof entry.moderatorId === 'string' ? entry.moderatorId : 'unknown',
        timestamp: typeof entry.timestamp === 'string' ? entry.timestamp : null,
      }))
      .reverse()
      .slice(0, 5)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>콘텐츠 신고 관리</CardTitle>
          <CardDescription>신고 접수 현황을 확인하고 신속하게 처리하세요.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdatedAt && (
            <span className="text-xs text-gray-500">
              마지막 갱신: {formatDateTime(lastUpdatedAt)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_STATUSES.map((status) => (
            <div
              key={status}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <p className="text-xs font-medium text-gray-500">{statusLabels[status]}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary?.byStatus?.[status] ?? 0}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">상태</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filters.status === 'all' ? 'primary' : 'outline'}
                onClick={() => handleStatusFilterChange('all')}
                disabled={isLoading}
              >
                전체
              </Button>
              {REPORT_STATUSES.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filters.status === status ? 'primary' : 'outline'}
                  onClick={() => handleStatusFilterChange(status)}
                  disabled={isLoading}
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">유형</span>
            <div className="flex flex-wrap gap-2">
              {(['all', ...REPORT_TARGET_TYPES] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filters.targetType === type ? 'primary-outline' : 'outline'}
                  onClick={() => handleTargetFilterChange(type)}
                  disabled={isLoading}
                >
                  {targetTypeLabels[type]}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-vk-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-base font-semibold text-gray-800">처리할 신고가 없습니다.</p>
            <p className="text-sm text-gray-600">새로운 신고가 접수되면 이곳에서 확인할 수 있습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="space-y-4 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={statusBadgeClasses[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-800">
                        {report.reasonLabel}
                      </span>
                      <span className="text-xs text-gray-500">
                        신고일 {formatDateTime(report.createdAt)}
                      </span>
                      {report.target?.isHidden ? (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                          숨김 처리됨
                        </span>
                      ) : null}
                      {report.description && (
                        <span className="relative inline-flex items-center group">
                          <span
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 cursor-help"
                            aria-label="신고 상세 설명"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </span>
                          <span className="pointer-events-none absolute left-1/2 top-7 z-40 hidden w-64 -translate-x-1/2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-800 shadow-lg group-hover:block">
                            {report.description}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    {renderActionButtons(report)}
                    {report.target ? renderContentActions(report) : null}
                  </div>
                </div>

                {report.target && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      {targetTypeLabels[report.targetType]}
                    </p>
                    {report.target.title && (
                      <h4 className="mt-1 text-base font-semibold text-gray-900">
                        {report.target.title}
                      </h4>
                    )}
                    {report.target.excerpt && (
                      <p className="mt-2 text-sm text-gray-600">{report.target.excerpt}</p>
                    )}
                    {report.target.url && (
                      <a
                        href={report.target.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-vk-primary hover:underline"
                      >
                        콘텐츠 열기 →
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                  <span>신고자: <strong>{formatReporterName(report.reporter)}</strong></span>
                  {report.reviewer && (
                    <span>담당자: <strong>{formatReporterName(report.reviewer)}</strong></span>
                  )}
                  {report.reviewedAt && (
                    <span>처리일: {formatDateTime(report.reviewedAt)}</span>
                  )}
                  <span>콘텐츠 ID: {report.targetId}</span>
                </div>

                {(() => {
                  const history = buildModerationHistory(report)
                  if (history.length === 0) return null

                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                      <p className="mb-2 font-semibold text-gray-700">최근 처리 기록</p>
                      <ul className="space-y-1">
                        {history.map((entry, index) => (
                          <li key={`${report.id}-history-${index}`} className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                              {entry.action === 'hide' && '숨김'}
                              {entry.action === 'unhide' && '복원'}
                              {entry.action === 'delete' && '삭제'}
                              {!['hide', 'unhide', 'delete'].includes(entry.action ?? '') && entry.action}
                            </span>
                            {entry.timestamp && (
                              <span className="text-gray-500">{formatDateTime(entry.timestamp)}</span>
                            )}
                            <span className="text-gray-400">by {entry.moderatorId}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
