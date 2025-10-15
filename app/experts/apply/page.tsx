'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ExpertApplicationPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [applicationType, setApplicationType] = useState<'domestic' | 'international'>('domestic')
  const [documentType, setDocumentType] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  async function handleSubmit() {
    if (!selectedFile || !documentType || !fullName || !email || !phone) {
      alert('모든 필수 항목을 입력해주세요')
      return
    }

    setUploading(true)

    // Mock: 실제로는 서버에 업로드
    setTimeout(() => {
      // localStorage에 신청 정보 저장
      const applications = JSON.parse(localStorage.getItem('certification_applications') || '[]')
      const newApplication = {
        id: `app${Date.now()}`,
        fullName,
        email,
        phone,
        applicationType,
        documentType,
        fileName: selectedFile.name,
        additionalInfo,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      applications.push(newApplication)
      localStorage.setItem('certification_applications', JSON.stringify(applications))

      setUploading(false)
      alert('신청이 완료되었습니다! 3일 이내에 심사 결과를 이메일로 알려드립니다.')
      router.push('/')
    }, 2000)
  }

  return (
    <main className="main-layout">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Certified User 신청</h1>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '1rem',
            marginTop: '0.5rem'
          }}>
            검증된 전문가로 인정받고 커뮤니티에 기여하세요
          </p>
        </div>

        {/* Centered Content */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem 1rem'
        }}>
          {/* Benefits Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              ✨ Certified User 혜택
            </h3>
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '0.95rem', lineHeight: '2' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎯</span>
                  <span style={{ fontWeight: '500' }}>답변 우선 노출</span>
                </div>
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                  <span style={{ fontWeight: '500' }}>Certified 배지 표시</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                  <span style={{ fontWeight: '500' }}>Trust Score 상승</span>
                </div>
              </div>
            </div>

            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              🔄 인증 프로세스
            </h3>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#374151' }}>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>1</span>
                  <span>서류 제출</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.5rem' }}>온라인 업로드</div>
              </div>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#8b5cf6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>2</span>
                  <span>관리자 심사</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.5rem' }}>3일 이내 완료</div>
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#10b981', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>3</span>
                  <span>인증 완료</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.5rem' }}>배지 발급 및 활동 시작</div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              📋 신청 요구사항
            </h3>

            {/* Domestic Requirements */}
            <div style={{
              padding: '1.25rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                🇰🇷 국내 거주자 필수 서류 (택 1)
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#075985', fontSize: '0.875rem', lineHeight: '1.8' }}>
                <li>외국인등록증 (앞/뒷면)</li>
                <li>졸업증명서 또는 재학증명서</li>
                <li>학생증 (유효기간 내)</li>
              </ul>
              <div style={{ marginTop: '1rem', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span>⏱️</span>
                <span><strong>심사 기간:</strong> 3일 이내</span>
              </div>
            </div>

            {/* International Requirements */}
            <div style={{
              padding: '1.25rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                🌍 해외 거주자 필수 서류 (택 1)
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#047857', fontSize: '0.875rem', lineHeight: '1.8' }}>
                <li>여권 (신원정보 페이지)</li>
                <li>재학/졸업 증명서 (학교 발급)</li>
                <li>재직증명서 (회사 발급)</li>
              </ul>
              <div style={{ marginTop: '1rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span>⏱️</span>
                <span><strong>심사 기간:</strong> 3일 이내</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: '#78350f',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            💡 <strong>개인정보 보호</strong>: 제출하신 서류는 본인 확인 용도로만 사용되며, 심사 후 안전하게 폐기됩니다.
          </div>

          {/* Application Form */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              📝 신청서 작성
            </h3>

            {/* Application Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                신청 유형 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setApplicationType('domestic')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: applicationType === 'domestic' ? '#3b82f6' : '#f3f4f6',
                    color: applicationType === 'domestic' ? 'white' : '#374151',
                    border: applicationType === 'domestic' ? 'none' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🇰🇷 국내 거주자
                </button>
                <button
                  onClick={() => setApplicationType('international')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: applicationType === 'international' ? '#3b82f6' : '#f3f4f6',
                    color: applicationType === 'international' ? 'white' : '#374151',
                    border: applicationType === 'international' ? 'none' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🌍 해외 거주자
                </button>
              </div>
            </div>

            {/* Document Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                제출 서류 유형 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  background: 'white'
                }}
              >
                <option value="">선택하세요</option>
                {applicationType === 'domestic' ? (
                  <>
                    <option value="alien_card">외국인등록증 (앞/뒷면)</option>
                    <option value="graduation_cert">졸업증명서</option>
                    <option value="enrollment_cert">재학증명서</option>
                    <option value="student_id">학생증</option>
                  </>
                ) : (
                  <>
                    <option value="passport">여권 (신원정보 페이지)</option>
                    <option value="graduation_cert">재학/졸업 증명서</option>
                    <option value="employment_cert">재직증명서</option>
                  </>
                )}
              </select>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                성명 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="서류상의 이름을 정확히 입력해주세요"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                이메일 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="심사 결과를 받을 이메일"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                연락처 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Additional Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                추가 정보 (선택)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="전문 분야, 경력 등 추가로 알려주고 싶은 내용이 있다면 작성해주세요"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                서류 첨부 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                background: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <div style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {selectedFile ? selectedFile.name : '파일을 클릭하여 업로드'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    JPG, PNG, PDF (최대 10MB)
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '1rem',
                background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {uploading ? '제출 중...' : '✅ 신청 완료하기'}
            </button>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
