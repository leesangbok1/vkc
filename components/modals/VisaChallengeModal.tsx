'use client'

import BaseModal from './BaseModal'

type VisaChallengeModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function VisaChallengeModal({ isOpen, onClose }: VisaChallengeModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="760px"
      fullScreenOnMobile={true}
      showBackButton={false}
      showCloseButton={true}
      title="아하 답변 작성 챌린지"
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
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '14px',
            padding: '2.5rem 1.75rem',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            아하 답변 작성 챌린지 이벤트
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.65rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            ⏰ 9월 15일 ~ 10월 31일
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gap: '1.25rem',
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>이벤트 안내</h3>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            Certified User와 일반 사용자 모두 참여할 수 있는 답변 작성 미션입니다. 기간 내 미션을 달성하면
            네이버페이·상품권 등의 혜택을 받을 수 있어요.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gap: '1rem',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Certified User 미션</h3>
          {[
            {
              step: '1',
              title: '전문가 답변 10개 작성하기',
              reward: '네이버페이 10,000원 지급',
            },
            {
              step: '2',
              title: '전문가 답변 20개 작성하기',
              reward: '20명 추첨, 네이버페이 10,000원 지급',
            },
            {
              step: '3',
              title: '10일 이상 활동 & 60개 답변 작성',
              reward: '40명 추첨, 신세계 상품권 50,000원 지급',
            },
          ].map((mission) => (
            <div
              key={mission.step}
              style={{
                background: '#f1f5f9',
                borderRadius: '10px',
                padding: '1.1rem',
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#1d4ed8',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {mission.step}
                </div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{mission.title}</span>
              </div>
              <div style={{ color: '#2563eb', fontWeight: 600, paddingLeft: '3rem' }}>
                💰 {mission.reward}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
            Certified User가 되는 방법
          </h3>
          <ol style={{ paddingLeft: '1.25rem', color: '#475569', lineHeight: 1.7 }}>
            <li>전문 분야 정보를 등록하고 인증 서류를 업로드합니다.</li>
            <li>관리자 심사를 통과하면 Certified 배지를 받을 수 있습니다.</li>
            <li>답변 활동을 통해 Trust Score를 꾸준히 쌓아보세요.</li>
          </ol>
        </section>

        <section
          style={{
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>유의 사항</h3>
          <ul style={{ paddingLeft: '1.25rem', color: '#475569', lineHeight: 1.7 }}>
            <li>모든 미션은 이벤트 기간 내 달성해야 혜택 대상자가 됩니다.</li>
            <li>부적절한 답변이나 도용 사례는 보상에서 제외될 수 있습니다.</li>
            <li>혜택은 이벤트 종료 후 3일 이내에 이메일로 안내드립니다.</li>
          </ul>
        </section>
      </div>
    </BaseModal>
  )
}
