'use client'

import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'

interface CertificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CertificationModal({ isOpen, onClose }: CertificationModalProps) {
  const router = useRouter()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="600px"
      adaptiveMode={true}
    >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Certified User 신청
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem'
            }}>
              검증된 전문가로 인정받고 커뮤니티에 기여하세요
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✨ Certified User 혜택
            </h3>
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.95rem', lineHeight: '2' }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎯</span>
                  <span style={{ fontWeight: '500' }}>답변 우선 노출</span>
                </div>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🔄 인증 프로세스
            </h3>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#374151' }}>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>1</span>
                  <span>서류 제출</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.25rem' }}>온라인 업로드</div>
              </div>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#8b5cf6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>2</span>
                  <span>관리자 심사</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.25rem' }}>3일 이내 완료</div>
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#10b981', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>3</span>
                  <span>인증 완료</span>
                </div>
                <div style={{ color: '#6b7280', marginLeft: '2.25rem' }}>배지 발급 및 활동 시작</div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              📋 신청 요구사항
            </h3>

            {/* Domestic Requirements */}
            <div style={{
              padding: '1rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              marginBottom: '0.75rem'
            }}>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                🇰🇷 국내 거주자 필수 서류 (택 1)
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#075985', fontSize: '0.8125rem', lineHeight: '1.8' }}>
                <li>외국인등록증 (앞/뒷면)</li>
                <li>졸업증명서 또는 재학증명서</li>
                <li>학생증 (유효기간 내)</li>
              </ul>
              <div style={{ marginTop: '0.75rem', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span>⏱️</span>
                <span><strong>심사 기간:</strong> 3일 이내</span>
              </div>
            </div>

            {/* International Requirements */}
            <div style={{
              padding: '1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                🌍 해외 거주자 필수 서류 (택 1)
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#047857', fontSize: '0.8125rem', lineHeight: '1.8' }}>
                <li>여권 (신원정보 페이지)</li>
                <li>재학/졸업 증명서 (학교 발급)</li>
                <li>재직증명서 (회사 발급)</li>
              </ul>
              <div style={{ marginTop: '0.75rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span>⏱️</span>
                <span><strong>심사 기간:</strong> 3일 이내</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{
            padding: '0.875rem',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            color: '#78350f',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            💡 <strong>개인정보 보호</strong>: 제출하신 서류는 본인 확인 용도로만 사용되며, 심사 후 안전하게 폐기됩니다.
          </div>

          {/* Contact Admin Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => alert('관리자 문의는 이메일 support@vietkconnect.com으로 연락주세요')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              관리자에게 신청 문의하기
            </button>
            <p style={{
              marginTop: '0.75rem',
              fontSize: '0.8125rem',
              color: '#6b7280'
            }}>
              서류를 준비하신 후 이메일로 신청해주세요
            </p>
          </div>
        </BaseModal>
  )
}
