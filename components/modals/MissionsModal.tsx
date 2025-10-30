'use client'

import { useEffect, useMemo, useState } from 'react'
import BaseModal from './BaseModal'

type MissionsModalProps = {
  isOpen: boolean
  onClose: () => void
}

type UserProgress = {
  certifiedAnswers: number
  normalAnswers: number
  activeDays: number
}

const DEFAULT_PROGRESS: UserProgress = {
  certifiedAnswers: 0,
  normalAnswers: 0,
  activeDays: 0,
}

const STORAGE_KEY = 'mission_progress'

export default function MissionsModal({ isOpen, onClose }: MissionsModalProps) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS)

  useEffect(() => {
    if (!isOpen) return
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const parsed = JSON.parse(stored)
        setProgress({
          certifiedAnswers: Number(parsed?.certifiedAnswers ?? 0),
          normalAnswers: Number(parsed?.normalAnswers ?? 0),
          activeDays: Number(parsed?.activeDays ?? 0),
        })
      } else {
        setProgress(DEFAULT_PROGRESS)
      }
    } catch {
      setProgress(DEFAULT_PROGRESS)
    }
  }, [isOpen])

  const missionSummary = useMemo(() => {
    const total = progress.certifiedAnswers + progress.normalAnswers
    return [
      {
        label: 'Certified 답변',
        value: progress.certifiedAnswers,
        target: 10,
      },
      {
        label: '일반 답변',
        value: progress.normalAnswers,
        target: 20,
      },
      {
        label: '연속 활동 일수',
        value: progress.activeDays,
        target: 10,
      },
      {
        label: '총 답변 수',
        value: total,
        target: 60,
      },
    ]
  }, [progress])

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="760px"
      fullScreenOnMobile={true}
      showBackButton={false}
      showCloseButton={true}
      title="베타 오픈 챌린지 미션"
    >
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          padding: '0 0 1rem',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}
      >
        <header
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '14px',
            padding: '2rem 1.75rem',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {new Date().getFullYear()} 베타 오픈 챌린지
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.92 }}>
            질문과 답변을 통해 커뮤니티에 기여하고, Certified User 보상까지 받아보세요.
          </p>
        </header>

        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            display: 'grid',
            gap: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>내 진행 상황</h3>
          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            }}
          >
            {missionSummary.map((mission) => {
              const ratio = mission.target > 0 ? Math.min(1, mission.value / mission.target) : 0
              return (
                <div
                  key={mission.label}
                  style={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{mission.label}</span>
                  <strong style={{ fontSize: '1.4rem', color: '#1f2937' }}>{mission.value}</strong>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      background: '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${ratio * 100}%`,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        height: '100%',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    목표 {mission.target}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'grid',
            gap: '0.8rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>이번 주 미션</h3>
          <ul style={{ paddingLeft: '1.25rem', color: '#475569', lineHeight: 1.7 }}>
            <li>Certified 답변 3개 작성하기</li>
            <li>일반 답변 5개 작성하기</li>
            <li>최소 3일 이상 활동 기록 남기기</li>
          </ul>
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '1.1rem',
              border: '1px dashed #cbd5f5',
              color: '#1d4ed8',
              fontWeight: 600,
            }}
          >
            🎁 모든 주간 미션을 완료한 Certified User 중 10명을 추첨해 네이버페이 10,000원을 드립니다.
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Certified User 혜택</h3>
          <ul style={{ paddingLeft: '1.25rem', color: '#475569', lineHeight: 1.7 }}>
            <li>답변이 상단에 고정되어 노출됩니다.</li>
            <li>프로필에 Certified 배지가 표시됩니다.</li>
            <li>Trust Score 상승으로 추가 이벤트 참여 기회가 제공됩니다.</li>
          </ul>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/experts/apply'
              }
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1.2rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Certified User 신청하기 →
          </button>
        </section>
      </div>
    </BaseModal>
  )
}
