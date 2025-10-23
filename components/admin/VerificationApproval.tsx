'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/utils/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Eye, FileText, Clock, User } from 'lucide-react'

type VerificationStatus = 'pending' | 'approved' | 'rejected'

interface CertificationRequest {
  id: string
  user_id: string
  status: VerificationStatus
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
    avatar_url?: string | null
    visa_type?: string | null
    years_in_korea?: number | null
    company?: string | null
  } | null
}

interface VerificationApprovalProps {
  userRole: UserRole
  className?: string
}

export default function VerificationApproval({ userRole, className }: VerificationApprovalProps) {
  const [requests, setRequests] = useState<CertificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (userRole !== UserRole.ADMIN) return
    let ignore = false
    async function fetchPending() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/admin/certifications?status=pending&limit=25', { cache: 'no-store' })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || '인증 요청을 불러오지 못했습니다.')
        }
        const json = await res.json()
        if (!ignore) {
          const fetched: CertificationRequest[] = Array.isArray(json?.requests) ? json.requests : []
          setRequests(fetched)
          setSelectedRequest(fetched[0] ?? null)
        }
      } catch (err: any) {
        console.error('[VerificationApproval] load failed', err)
        if (!ignore) {
          setError(err?.message || '인증 요청을 불러오지 못했습니다.')
          setRequests([])
          setSelectedRequest(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchPending()
    return () => {
      ignore = true
    }
  }, [userRole])

  const pendingRequests = useMemo(() => requests.filter((req) => req.status === 'pending'), [requests])

  const getVerificationTypeLabel = (type: string | null | undefined) => {
    const labels: Record<string, string> = {
      student: '학생 인증',
      worker: '재직 인증',
      resident: '거주 인증',
      business: '사업자 인증',
      mentor: '멘토 인증',
      other: '기타 인증',
    }
    return labels[(type || '').toLowerCase()] || type || '인증 유형 미지정'
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기중</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />반려</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
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
      setProcessing(true)
      const res = await fetch(`/api/admin/certifications/${requestId}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '인증 승인 중 오류가 발생했습니다.')
      }
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      setSelectedRequest((prev) => (prev?.id === requestId ? null : prev))
    } catch (err: any) {
      alert(err?.message || '인증 승인 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject(requestId: string) {
    const reason = window.prompt('반려 사유를 입력해주세요:')
    if (!reason) return
    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/certifications/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '인증 반려 중 오류가 발생했습니다.')
      }
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      setSelectedRequest((prev) => (prev?.id === requestId ? null : prev))
    } catch (err: any) {
      alert(err?.message || '인증 반려 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
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
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, admin_notes: notes } : req
        )
      )
      setSelectedRequest((prev) => (prev ? { ...prev, admin_notes: notes } : prev))
    } catch (err: any) {
      alert(err?.message || '관리자 메모 저장에 실패했습니다.')
    }
  }

  if (userRole !== UserRole.ADMIN) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <User className="w-16 h-16 mx-auto mb-2" />
          <h3 className="text-lg font-medium">접근 권한이 없습니다</h3>
          <p className="text-sm">관리자만 인증 승인을 관리할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle>인증 승인 요청</CardTitle>
            <CardDescription>인증 요청을 불러오는 중입니다…</CardDescription>
          </CardHeader>
          <CardContent className="py-10 text-center text-gray-500">Loading...</CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle>인증 승인 요청</CardTitle>
            <CardDescription>요청을 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent className="py-10 text-center text-red-500">{error}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle>인증 승인 요청</CardTitle>
          <CardDescription>현재 심사 대기 중인 인증 요청을 빠르게 검토할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              심사 대기 중인 인증 요청이 없습니다.
            </div>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={request.user?.avatar_url || undefined} />
                      <AvatarFallback>{request.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {request.user?.name || '이름 정보 없음'}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {request.user?.email || '이메일 정보 없음'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">{getVerificationTypeLabel(request.verification_type)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">제출 정보</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>요청일: {formatDate(request.created_at)}</li>
                      {request.user?.visa_type ? <li>비자 유형: {request.user.visa_type}</li> : null}
                      {request.user?.years_in_korea != null ? (
                        <li>한국 체류: {request.user.years_in_korea}년</li>
                      ) : null}
                      {request.user?.company ? <li>재직처: {request.user.company}</li> : null}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">제출 서류</h4>
                    {request.documents && Object.keys(request.documents).length > 0 ? (
                      <ul className="space-y-1 text-sm text-blue-600">
                        {Object.entries(request.documents).map(([key, raw]) => {
                          const value = String(raw ?? '')
                          const isLink = /^https?:\/\//i.test(value)
                          return (
                            <li key={key} className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              {isLink ? (
                                <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                                  {key}
                                </a>
                              ) : (
                                <span className="text-gray-600 break-all">{key}: {value}</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">등록된 서류가 없습니다.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        상세보기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>인증 요청 상세</DialogTitle>
                        <DialogDescription>
                          {request.user?.name || '사용자'} 님의 인증 신청 정보를 확인할 수 있습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">사용자 정보</h4>
                          <p className="text-sm text-gray-700">
                            이름: {request.user?.name || '정보 없음'} / 이메일: {request.user?.email || '정보 없음'}
                          </p>
                          <p className="text-sm text-gray-700">요청일: {formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">서류 목록</h4>
                          {request.documents && Object.keys(request.documents).length > 0 ? (
                            <ul className="space-y-1 text-sm text-blue-600">
                              {Object.entries(request.documents).map(([key, raw]) => {
                                const value = String(raw ?? '')
                                const isLink = /^https?:\/\//i.test(value)
                                return (
                                  <li key={key}>
                                    {isLink ? (
                                      <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                                        {key}
                                      </a>
                                    ) : (
                                      <span className="break-all text-gray-600">{key}: {value}</span>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">등록된 서류가 없습니다.</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">관리자 메모</h4>
                          <Textarea
                            value={selectedRequest?.id === request.id ? selectedRequest.admin_notes ?? '' : request.admin_notes ?? ''}
                            onChange={(event) => {
                              const next = event.target.value
                              setSelectedRequest((prev) =>
                                prev && prev.id === request.id ? { ...prev, admin_notes: next } : prev
                              )
                            }}
                            onBlur={(event) => handleUpdateNotes(request.id, event.target.value)}
                            placeholder="검토 메모를 입력하세요"
                          />
                          {request.rejection_reason ? (
                            <p className="text-xs text-red-600 mt-2">최근 반려 사유: {request.rejection_reason}</p>
                          ) : null}
                        </div>
                      </div>
                      <DialogFooter className="flex gap-3">
                        <Button variant="secondary" onClick={() => handleReject(request.id)} disabled={processing}>
                          반려
                        </Button>
                        <Button onClick={() => handleApprove(request.id)} disabled={processing}>
                          승인
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleReject(request.id)} disabled={processing}>
                      반려
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(request.id)} disabled={processing}>
                      승인
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          총 {pendingRequests.length}건의 심사 대기 요청이 있습니다.
        </CardFooter>
      </Card>
    </div>
  )
}
