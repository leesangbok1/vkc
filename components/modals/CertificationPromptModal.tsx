'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'

interface CertificationPromptModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: 'first_answer' | 'third_answer' | 'manual'
}

export default function CertificationPromptModal({
  isOpen,
  onClose,
  trigger
}: CertificationPromptModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic')
  const STORAGE_KEY = 'certification_prompt_data'

  const upsertPromptState = (patch: Record<string, unknown>) => {
    if (typeof window === 'undefined') return
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY)
      const existing = existingRaw ? JSON.parse(existingRaw) : {}
      const next = {
        ...existing,
        ...patch,
        last_shown: new Date().toISOString(),
        trigger_type: trigger,
        completed: true,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('[CertificationPromptModal] failed to persist prompt state', error)
      const fallback = {
        ...patch,
        last_shown: new Date().toISOString(),
        trigger_type: trigger,
        completed: true,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      } catch (storageError) {
        console.warn('[CertificationPromptModal] unable to write fallback prompt state', storageError)
      }
    }
  }

  // Load user's residence from profile
  useEffect(() => {
    if (isOpen) {
      const profile = JSON.parse(localStorage.getItem('vietkconnect_profile') || '{}')
      if (profile.residence === 'korea') {
        setActiveTab('domestic')
      } else if (profile.residence === 'other') {
        setActiveTab('international')
      }
    }
  }, [isOpen])

  const handleApply = () => {
    // Save that user clicked certification prompt
    upsertPromptState({
      status: 'applied',
      dismissed: false,
    })

    // Redirect to experts apply page
    router.push('/experts/apply')
    onClose()
  }

  const handleSkip = () => {
    // Save skip action with 24-hour cooldown
    upsertPromptState({
      status: 'dismissed',
      dismissed: true,
    })
    onClose()
  }

  // Dynamic content based on trigger
  const getTriggerContent = () => {
    if (trigger === 'first_answer') {
      return {
        title: '첫 답변을 작성하셨네요! 🎉',
        subtitle: 'Certified User가 되어 더 많은 사람들에게 도움을 주세요',
        icon: '✍️'
      }
    } else if (trigger === 'third_answer') {
      return {
        title: '벌써 3개의 답변! 대단해요! 🌟',
        subtitle: '이제 Certified User 인증을 받아보시는 건 어떨까요?',
        icon: '🏆'
      }
    } else {
      return {
        title: 'Certified User 되기',
        subtitle: '신뢰받는 멘토로 활동하세요',
        icon: '✅'
      }
    }
  }

  const content = getTriggerContent()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleSkip}
      width="650px"
      adaptiveMode={true}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{content.icon}</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          {content.title}
        </h3>
        <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
          {content.subtitle}
        </p>
      </div>

      {/* Benefits Section */}
      <div style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
        borderRadius: '12px',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
          ✨ Certified User 혜택
        </h4>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span>🎯</span>
            <span>답변이 질문 페이지 상단에 우선 노출</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span>✅</span>
            <span>프로필에 Certified 배지 표시</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span>📊</span>
            <span>Trust Score 즉시 상승</span>
          </div>
        </div>
      </div>

      {/* Document Requirements - Tab System */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
          📄 인증 서류 안내
        </h4>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('domestic')}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: 'none',
              background: activeTab === 'domestic' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'domestic' ? '#ffffff' : '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇰🇷 국내 거주
          </button>
          <button
            onClick={() => setActiveTab('international')}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: 'none',
              background: activeTab === 'international' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'international' ? '#ffffff' : '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🌍 해외 거주
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'domestic' ? (
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#1f2937' }}>✅ 필수 서류 (택 1)</strong>
              </div>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
                <li>외국인등록증 (앞/뒷면)</li>
                <li>졸업증명서 또는 재학증명서</li>
                <li>학생증 (유효기간 내)</li>
              </ul>
              <div style={{ marginTop: '0.75rem' }}>
                <strong style={{ color: '#1f2937' }}>⏱️ 심사 기간</strong>
                <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                  3일 이내
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#1f2937' }}>✅ 필수 서류 (택 1)</strong>
              </div>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
                <li>여권 (신원정보 페이지)</li>
                <li>재학/졸업 증명서 (학교 발급)</li>
                <li>재직증명서 (회사 발급)</li>
              </ul>
              <div style={{ marginTop: '0.75rem' }}>
                <strong style={{ color: '#1f2937' }}>⏱️ 심사 기간</strong>
                <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                  3일 이내
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Process Timeline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
          🔄 인증 프로세스
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 0.5rem',
              background: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              📤
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937' }}>
              서류 제출
            </div>
            <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
              온라인 업로드
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', color: '#d1d5db' }}>→</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 0.5rem',
              background: '#8b5cf6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              🔍
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937' }}>
              관리자 심사
            </div>
            <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
              3-7일 소요
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', color: '#d1d5db' }}>→</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 0.5rem',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              ✅
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937' }}>
              인증 완료
            </div>
            <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
              배지 발급
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div style={{
        padding: '0.75rem 1rem',
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#78350f',
        lineHeight: '1.5',
        marginBottom: '1.5rem'
      }}>
        💡 <strong>개인정보 보호</strong>: 제출하신 서류는 본인 확인 용도로만 사용되며, 심사 후 안전하게 폐기됩니다.
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={handleSkip}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: '1px solid #d1d5db',
            background: 'white',
            color: '#374151',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          나중에
        </button>
        <button
          className="btn btn-primary"
          onClick={handleApply}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          지금 인증하기 →
        </button>
      </div>
    </BaseModal>
  )
}
