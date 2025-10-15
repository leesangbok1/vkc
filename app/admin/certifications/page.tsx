'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

// Mock certification requests data
const MOCK_CERTIFICATION_REQUESTS = [
  {
    id: 'cert-req-001',
    userId: 'user-003',
    userName: '레투안',
    email: 'letuan@example.com',
    requestDate: '2025-10-14T10:30:00Z',
    status: 'pending', // pending, approved, rejected
    verificationType: 'worker', // student, worker, resident, business
    documents: {
      alienCard: 'alien-card-001.jpg',
      employmentCert: 'employment-cert-001.pdf'
    },
    submittedInfo: {
      visaType: 'E-7 비자',
      yearsInKorea: 5,
      company: '삼성전자',
      specialties: ['취업', '비자', '급여협상']
    },
    adminNotes: ''
  },
  {
    id: 'cert-req-002',
    userId: 'user-005',
    userName: '팜티란',
    email: 'phamthilan@example.com',
    requestDate: '2025-10-13T15:20:00Z',
    status: 'pending',
    verificationType: 'student',
    documents: {
      alienCard: 'alien-card-002.jpg',
      enrollmentCert: 'enrollment-cert-002.pdf'
    },
    submittedInfo: {
      visaType: 'D-2 비자',
      yearsInKorea: 3,
      university: '서울대학교',
      specialties: ['유학', '대학원', '장학금']
    },
    adminNotes: ''
  }
]

interface CertificationRequest {
  id: string
  userId: string
  userName: string
  email: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  verificationType: 'student' | 'worker' | 'resident' | 'business'
  documents: Record<string, string>
  submittedInfo: {
    visaType: string
    yearsInKorea: number
    company?: string
    university?: string
    specialties: string[]
  }
  adminNotes: string
}

export default function AdminCertificationsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<CertificationRequest[]>(MOCK_CERTIFICATION_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  function checkAdminAccess() {
    try {
      const mockUser = localStorage.getItem('mock_user')
      if (!mockUser) {
        alert('관리자 권한이 필요합니다')
        router.push('/')
        return
      }

      const user = JSON.parse(mockUser)
      if (user.role !== 'admin') {
        alert('이 페이지는 관리자만 접근할 수 있습니다')
        router.push('/')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/')
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: '심사 대기',
      approved: '승인 완료',
      rejected: '반려'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  function getVerificationTypeLabel(type: string) {
    const labels = {
      student: '🎓 학생 인증',
      worker: '💼 재직자 인증',
      resident: '🏠 거주자 인증',
      business: '🏢 사업자 인증'
    }
    return labels[type as keyof typeof labels]
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function handleApprove(requestId: string) {
    const confirmed = window.confirm('이 인증 요청을 승인하시겠습니까?')
    if (!confirmed) return

    setRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' }
        : req
    ))

    // TODO: API call to update certification status
    // await fetch(`/api/admin/certifications/${requestId}/approve`, { method: 'POST' })

    alert('인증이 승인되었습니다!')
    setSelectedRequest(null)
  }

  function handleReject(requestId: string) {
    const reason = window.prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    setRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected', adminNotes: reason }
        : req
    ))

    // TODO: API call to reject certification
    // await fetch(`/api/admin/certifications/${requestId}/reject`, {
    //   method: 'POST',
    //   body: JSON.stringify({ reason })
    // })

    alert('인증이 반려되었습니다')
    setSelectedRequest(null)
  }

  function handleUpdateNotes(requestId: string, notes: string) {
    setRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, adminNotes: notes }
        : req
    ))

    // TODO: API call to update admin notes
    // await fetch(`/api/admin/certifications/${requestId}/notes`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ notes })
    // })
  }

  const filteredRequests = requests.filter(req =>
    filterStatus === 'all' || req.status === filterStatus
  )

  if (loading) {
    return (
      <main className="main-layout">
        <div className="container">
          <div className="main-content">
            <div className="text-center py-12">로딩 중...</div>
          </div>
          <Sidebar showContent={false} />
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <main className="main-layout">
      <div className="container">
        <div className="main-content">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👑 Certified User 인증 관리
            </h1>
            <p className="text-gray-600">
              인증 요청을 검토하고 승인/반려할 수 있습니다
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">전체 요청</div>
              <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-800 mb-1">심사 대기</div>
              <div className="text-2xl font-bold text-yellow-900">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-800 mb-1">승인 완료</div>
              <div className="text-2xl font-bold text-green-900">
                {requests.filter(r => r.status === 'approved').length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm text-red-800 mb-1">반려</div>
              <div className="text-2xl font-bold text-red-900">
                {requests.filter(r => r.status === 'rejected').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              심사 대기
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              승인 완료
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              반려
            </button>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 && (
              <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                <div className="text-gray-400 text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  요청이 없습니다
                </h3>
                <p className="text-gray-600">
                  현재 {filterStatus === 'all' ? '인증' : filterStatus === 'pending' ? '심사 대기 중인' : filterStatus} 요청이 없습니다
                </p>
              </div>
            )}

            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.userName}</h3>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">인증 유형</div>
                    <div className="text-sm font-medium">{getVerificationTypeLabel(request.verificationType)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">비자 종류</div>
                    <div className="text-sm font-medium">{request.submittedInfo.visaType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">거주 기간</div>
                    <div className="text-sm font-medium">{request.submittedInfo.yearsInKorea}년차</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">신청일</div>
                    <div className="text-sm font-medium">{formatDate(request.requestDate)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {request.submittedInfo.specialties.map((specialty, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      #{specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Sidebar showContent={false} />
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRequest(null)
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">인증 요청 상세</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">사용자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">이름</div>
                    <div className="font-medium">{selectedRequest.userName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">이메일</div>
                    <div className="font-medium">{selectedRequest.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">신청일</div>
                    <div className="font-medium">{formatDate(selectedRequest.requestDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">상태</div>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
              </div>

              {/* Certification Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">인증 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">인증 유형</div>
                    <div className="font-medium">{getVerificationTypeLabel(selectedRequest.verificationType)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">비자 종류</div>
                    <div className="font-medium">{selectedRequest.submittedInfo.visaType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">한국 거주</div>
                    <div className="font-medium">{selectedRequest.submittedInfo.yearsInKorea}년차</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">소속</div>
                    <div className="font-medium">
                      {selectedRequest.submittedInfo.company || selectedRequest.submittedInfo.university || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">전문 분야</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.submittedInfo.specialties.map((specialty, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      #{specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">제출 서류</h3>
                <div className="space-y-2">
                  {Object.entries(selectedRequest.documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{value}</span>
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        다운로드
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">관리자 메모</h3>
                <textarea
                  value={selectedRequest.adminNotes}
                  onChange={(e) => handleUpdateNotes(selectedRequest.id, e.target.value)}
                  placeholder="관리자 전용 메모를 입력하세요..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  rows={4}
                />
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    ✓ 승인
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    ✕ 반려
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
