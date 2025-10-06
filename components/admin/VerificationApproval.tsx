'use client'

import React, { useState, useEffect } from 'react'
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

interface VerificationRequest {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string
    visa_type?: string
    years_in_korea?: number
    company?: string
  }
  verification_type: 'student' | 'worker' | 'resident' | 'business'
  verification_status: 'pending' | 'approved' | 'rejected'
  documents: string[]
  submitted_at: string
  notes?: string
  reviewed_by?: string
  reviewed_at?: string
}

interface VerificationApprovalProps {
  userRole: UserRole
  className?: string
}

export default function VerificationApproval({ userRole, className }: VerificationApprovalProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  // 관리자만 접근 가능
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

  useEffect(() => {
    loadVerificationRequests()
  }, [])

  const loadVerificationRequests = async () => {
    try {
      setLoading(true)
      // Mock 데이터 (실제로는 API 호출)
      const mockRequests: VerificationRequest[] = [
        {
          id: '1',
          user: {
            id: 'user1',
            name: '김베트남',
            email: 'kim@example.com',
            avatar_url: '/default-avatar.png',
            visa_type: 'E-7',
            years_in_korea: 3,
            company: '삼성전자'
          },
          verification_type: 'worker',
          verification_status: 'pending',
          documents: ['재직증명서.pdf', '비자사본.pdf'],
          submitted_at: '2025-01-10T10:30:00Z',
          notes: '한국에서 3년간 근무 중인 소프트웨어 엔지니어입니다.'
        },
        {
          id: '2',
          user: {
            id: 'user2',
            name: '레베트남',
            email: 'le@example.com',
            avatar_url: '/default-avatar.png',
            visa_type: 'D-2',
            years_in_korea: 2,
            company: '연세대학교'
          },
          verification_type: 'student',
          verification_status: 'pending',
          documents: ['재학증명서.pdf', '학생증.jpg'],
          submitted_at: '2025-01-10T09:15:00Z',
          notes: '연세대학교 컴퓨터과학과 재학 중입니다.'
        }
      ]
      setRequests(mockRequests)
    } catch (error) {
      console.error('Failed to load verification requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(true)
      // API 호출로 승인 처리
      console.log('Approving request:', requestId, 'Notes:', reviewNotes)

      // Mock 승인 처리
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              verification_status: 'approved' as const,
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'admin'
            }
          : req
      ))

      setSelectedRequest(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Failed to approve request:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(true)
      // API 호출로 거절 처리
      console.log('Rejecting request:', requestId, 'Notes:', reviewNotes)

      // Mock 거절 처리
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              verification_status: 'rejected' as const,
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'admin'
            }
          : req
      ))

      setSelectedRequest(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Failed to reject request:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getVerificationTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return '학생 인증'
      case 'worker': return '재직 인증'
      case 'resident': return '거주 인증'
      case 'business': return '사업자 인증'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기중</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />거절</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingRequests = requests.filter(req => req.verification_status === 'pending')
  const processedRequests = requests.filter(req => req.verification_status !== 'pending')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">인증 승인 관리</h2>
          <p className="text-gray-600 mt-1">사용자 인증 요청을 검토하고 승인/거절할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            대기: {pendingRequests.length}개
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            처리완료: {processedRequests.length}개
          </div>
        </div>
      </div>

      {/* 대기 중인 요청 */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">승인 대기 중 ({pendingRequests.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.user.avatar_url} alt={request.user.name} />
                      <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{request.user.name}</CardTitle>
                      <CardDescription className="text-sm">{request.user.email}</CardDescription>
                    </div>
                    {getStatusBadge(request.verification_status)}
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">인증 유형:</span>
                      <span className="font-medium">{getVerificationTypeLabel(request.verification_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">비자:</span>
                      <span>{request.user.visa_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">거주년수:</span>
                      <span>{request.user.years_in_korea || 0}년</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">제출 서류:</span>
                      <span>{request.documents.length}개</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        상세 검토
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>인증 요청 상세 검토</DialogTitle>
                        <DialogDescription>
                          {request.user.name}님의 {getVerificationTypeLabel(request.verification_type)} 요청을 검토합니다.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* 사용자 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-3">신청자 정보</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">이름:</span>
                              <span className="ml-2 font-medium">{request.user.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">이메일:</span>
                              <span className="ml-2">{request.user.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">비자 유형:</span>
                              <span className="ml-2">{request.user.visa_type || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">거주 년수:</span>
                              <span className="ml-2">{request.user.years_in_korea || 0}년</span>
                            </div>
                            <div>
                              <span className="text-gray-500">소속:</span>
                              <span className="ml-2">{request.user.company || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">신청일:</span>
                              <span className="ml-2">{new Date(request.submitted_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                        </div>

                        {/* 제출 서류 */}
                        <div>
                          <h4 className="font-medium mb-3">제출 서류</h4>
                          <div className="space-y-2">
                            {request.documents.map((doc, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{doc}</span>
                                <Button variant="ghost" size="sm" className="ml-auto">
                                  다운로드
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 신청 사유 */}
                        {request.notes && (
                          <div>
                            <h4 className="font-medium mb-2">신청 사유</h4>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                              {request.notes}
                            </p>
                          </div>
                        )}

                        {/* 검토 의견 */}
                        <div>
                          <h4 className="font-medium mb-2">검토 의견</h4>
                          <Textarea
                            placeholder="승인/거절 사유를 입력하세요..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={processing}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          거절
                        </Button>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          승인
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 처리된 요청 */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">처리 완료 ({processedRequests.length})</h3>
          <div className="space-y-3">
            {processedRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={request.user.avatar_url} alt={request.user.name} />
                        <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {getVerificationTypeLabel(request.verification_type)} • {new Date(request.submitted_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.verification_status)}
                      {request.reviewed_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(request.reviewed_at).toLocaleDateString('ko-KR')} 처리
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 요청이 없는 경우 */}
      {requests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">인증 요청이 없습니다</h3>
          <p className="text-gray-400">새로운 인증 요청이 들어오면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  )
}