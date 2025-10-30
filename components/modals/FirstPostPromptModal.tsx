'use client'

import BaseModal from './BaseModal'

interface FirstPostPromptModalProps {
  isOpen: boolean
  userEmail?: string | null
  onSetup: () => void
  onLater: () => void
}

export default function FirstPostPromptModal({
  isOpen,
  userEmail,
  onSetup,
  onLater
}: FirstPostPromptModalProps) {
  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onLater}
      width="620px"
      adaptiveMode={true}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          첫 게시글 등록을 축하드려요!
        </h3>
        <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.98rem', lineHeight: 1.6 }}>
          커뮤니티에서 받은 댓글과 활동 소식을 빠르게 확인하려면 알림을 켜두는 것이 좋아요.
          <br />
          이메일 주소를 확인하고 알림을 허용해 주세요.
        </p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 100%)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#1d4ed8',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem'
          }}>
            🔔
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '1rem' }}>알림이 필요한 이유</div>
            <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
              댓글과 좋아요, 신규 질문 알림을 놓치지 않고 받아볼 수 있어요.
            </div>
          </div>
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          color: '#374151',
          fontSize: '0.95rem',
          textAlign: 'left',
          lineHeight: 1.6
        }}>
          <li>내 게시글에 달린 댓글과 좋아요 안내</li>
          <li>관심 주제의 새로운 질문 소식</li>
          <li>중요한 커뮤니티 알림 및 이벤트 정보</li>
        </ul>
      </div>

      <div style={{
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        textAlign: 'left',
        marginBottom: '1.75rem',
        border: '1px solid #e5e7eb'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          등록된 이메일
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
          {userEmail && userEmail.trim().length > 0 ? userEmail : '이메일 정보가 없습니다'}
        </span>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          이메일이 없다면 설정에서 추가 입력 후 알림을 허용해주세요.
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onLater}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#6b7280',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          나중에 할게요
        </button>
        <button
          type="button"
          onClick={onSetup}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          알림 설정하러 가기
        </button>
      </div>
    </BaseModal>
  )
}
