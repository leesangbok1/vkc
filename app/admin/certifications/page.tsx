'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'

interface CertificationRequest {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  verification_type: string | null
  documents: Record<string, unknown> | null
  admin_notes: string | null
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string | null
    email: string | null
    role: string | null
  } | null
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminCertificationsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<CertificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function bootstrap() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!res.ok) {
          alert('관리자 권한이 필요합니다')
          router.push('/')
          return
        }
        const { data } = await res.json()
        const role = (data?.role || '').toLowerCase()
        const adminYn = (data?.admin_yn || '').toUpperCase()
        const isAdminRole = role === 'admin' || adminYn === 'Y'
        if (!isAdminRole) {
          alert('이 페이지는 관리자만 접근할 수 있습니다')
          router.push('/')
          return
        }
        if (!ignore) {
          setIsAdmin(true)
        }
      } catch (accessError) {
        console.error('[AdminCertifications] access check failed', accessError)
        router.push('/')
      } finally {
        if (!ignore) setLoadingAccess(false)
      }
    }

    bootstrap()
    return () => {
      ignore = true
    }
  }, [router])

  useEffect(() => {
    if (!isAdmin) return
    loadRequests(filterStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, isAdmin])

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests
    return requests.filter((req) => req.status === filterStatus)
  }, [filterStatus, requests])

  async function loadRequests(status: FilterStatus) {
    if (!isAdmin) return
    setLoadingRequests(true)
    setError(null)
    try {
      const query = status === 'all' ? '' : `?status=${status}`
      const res = await fetch(`/api/admin/certifications${query}`, { cache: 'no-store' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '인증 요청을 불러오지 못했습니다.')
      }
      const json = await res.json()
      const fetched: CertificationRequest[] = Array.isArray(json?.requests) ? json.requests : []
      setRequests(fetched)
      if (selectedRequest) {
        const updated = fetched.find((req) => req.id === selectedRequest.id)
        setSelectedRequest(updated ?? null)
      }
    } catch (err: unknown) {
      console.error('[AdminCertifications] loadRequests failed', err)
      const message =
        err instanceof Error ? err.message : '인증 요청 조회 중 오류가 발생했습니다.'
      setError(message)
      setRequests([])
      setSelectedRequest(null)
    } finally {
      setLoadingRequests(false)
    }
  }

  function getStatusBadge(status: CertificationRequest['status']) {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: '심사 대기',
      approved: '승인 완료',
      rejected: '반려',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes[status]}`}>
        {labels[status]}
      </span>
    )
  }

  function getVerificationTypeLabel(type: string | null | undefined) {
    const labels: Record<string, string> = {
      student: '🎓 학생 인증',
      worker: '💼 재직자 인증',
      resident: '🏠 거주자 인증',
      business: '🏢 사업자 인증',
      mentor: '🧑‍🏫 멘토 인증',
      other: '🔖 기타 인증',
    }
    return labels[(type || '').toLowerCase()] || type || '인증 유형 미지정'
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function handleApprove(requestId: string) {
    const confirmed = window.confirm('이 인증 요청을 승인하시겠습니까?')
    if (!confirmed) return
    try {
      const res = await fetch(`/api/admin/certifications/${requestId}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '인증 승인 중 오류가 발생했습니다.')
      }
      alert('인증이 승인되었습니다!')
      await loadRequests(filterStatus)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '인증 승인 중 오류가 발생했습니다.'
      alert(message)
    }
  }

  async function handleReject(requestId: string) {
    const reason = window.prompt('반려 사유를 입력해주세요:')
    if (!reason) return
    try {
      const res = await fetch(`/api/admin/certifications/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '인증 반려 중 오류가 발생했습니다.')
      }
      alert('인증이 반려되었습니다.')
      await loadRequests(filterStatus)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '인증 반려 중 오류가 발생했습니다.'
      alert(message)
    }
  }

  async function handleUpdateNotes(requestId: string, notes: string) {
    try {
      const res = await fetch(`/api/admin/certifications/${requestId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '관리자 메모 저장에 실패했습니다.')
      }
      await loadRequests(filterStatus)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '관리자 메모 저장에 실패했습니다.'
      alert(message)
    }
  }

  function renderDocuments(documents: Record<string, unknown> | null) {
    if (!documents || Object.keys(documents).length === 0) {
      return <p className="text-sm text-gray-500">제출된 서류가 없습니다.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(documents).map(([key, raw]) => {
          const value = String(raw ?? '')
          const isLink = /^https?:\/\//i.test(value)
          return (
            <div key={key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{key}</p>
                {isLink ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-xs text-gray-500 break-all">{value || '파일 정보 없음'}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loadingAccess) {
    return (
      <PageLayout variant="centered">
        <div className="py-12 text-center text-gray-600">관리자 권한 확인 중...</div>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return (
      <PageLayout variant="centered">
        <div className="py-12 text-center text-gray-600">관리자만 접근할 수 있는 페이지입니다.</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="withSidebar">
      <div className="max-w-6xl mx-auto py-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">인증 요청 관리</h1>
                <p className="text-sm text-gray-500 mt-1">
                  사용자 인증 신청을 검토하고 승인/반려 처리하세요.
                </p>
              </div>
              <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all'
                      ? '전체'
                      : status === 'pending'
                      ? '심사 대기'
                      : status === 'approved'
                      ? '승인됨'
                      : '반려됨'}
                  </button>
                ))}
              </div>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-red-600">⚠️ {error}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-lg font-semibold">
                    {loadingRequests ? '인증 요청을 불러오는 중입니다…' : '해당 조건의 인증 요청이 없습니다.'}
                  </p>
                  <p className="text-sm mt-2">새로운 인증 요청이 접수되면 이곳에서 관리할 수 있습니다.</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`rounded-2xl border ${
                      selectedRequest?.id === request.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                    } bg-white transition-colors`}
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.user?.name || '이름 정보 없음'} <span className="text-sm text-gray-500">({request.user?.email || '이메일 없음'})</span>
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            {getStatusBadge(request.status)}
                            <span>{getVerificationTypeLabel(request.verification_type)}</span>
                            <span className="text-gray-400">요청일: {formatDate(request.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleApprove(request.id)
                            }}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleReject(request.id)
                            }}
                            className="px-3 py-2 bg-white border border-gray-300 hover:border-red-500 text-sm rounded-lg transition-colors"
                          >
                            반려
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        제출 서류: {request.documents ? Object.keys(request.documents).length : 0}개 · 최근 업데이트:{' '}
                        {formatDate(request.updated_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">인증 요청 상세</h3>
                  <p className="text-sm text-gray-500">요청을 선택하면 상세 정보를 확인하고 메모를 남길 수 있습니다.</p>
                </div>

                {!selectedRequest ? (
                  <div className="p-6 text-sm text-gray-500 text-center">
                    왼쪽 목록에서 인증 요청을 선택하세요.
                  </div>
                ) : (
                  <div className="p-6 space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">인증 정보</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          사용자: <span className="font-medium">{selectedRequest.user?.name || '정보 없음'}</span>
                        </p>
                        <p>
                          이메일: <span className="font-medium">{selectedRequest.user?.email || '정보 없음'}</span>
                        </p>
                        <p>
                          인증 유형: <span className="font-medium">{getVerificationTypeLabel(selectedRequest.verification_type)}</span>
                        </p>
                        <p className="text-gray-500">요청일: {formatDate(selectedRequest.created_at)}</p>
                        {selectedRequest.reviewed_at ? (
                          <p className="text-blue-600">
                            최근 처리: {selectedRequest.status === 'approved' ? '승인' : '반려'} · {formatDate(selectedRequest.reviewed_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">제출 서류</h4>
                      {renderDocuments(selectedRequest.documents)}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">관리자 메모</h4>
                      <textarea
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="검토 메모를 입력하세요"
                        value={selectedRequest.admin_notes ?? ''}
                        onChange={(event) =>
                          setSelectedRequest((prev) =>
                            prev ? { ...prev, admin_notes: event.target.value } : prev
                          )
                        }
                        onBlur={() => {
                          if (!selectedRequest) return
                          handleUpdateNotes(selectedRequest.id, selectedRequest.admin_notes ?? '')
                        }}
                      />
                      {selectedRequest.rejection_reason ? (
                        <p className="text-xs text-red-600 mt-2">
                          최근 반려 사유: {selectedRequest.rejection_reason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        className="flex-1 bg-white border border-gray-300 hover:border-red-500 text-gray-700 py-2 rounded-lg transition-colors"
                      >
                        반려
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
