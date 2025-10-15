'use client'

import { useState } from 'react'
import { Answer } from '@/lib/data/mockData'

interface AnswerItemProps {
  answer: Answer
  isQuestionAuthor: boolean
  onToggleHelpful: (answerId: string) => void
  onAcceptAnswer: (answerId: string) => void
  isHelpfulActive: boolean
  isAuthenticated: boolean
  onLoginRequired: () => void
}

export default function AnswerItem({
  answer,
  isQuestionAuthor,
  onToggleHelpful,
  onAcceptAnswer,
  isHelpfulActive,
  isAuthenticated,
  onLoginRequired
}: AnswerItemProps) {
  const [showAcceptModal, setShowAcceptModal] = useState(false)

  const handleAcceptClick = () => {
    if (!isAuthenticated) {
      onLoginRequired()
      return
    }
    setShowAcceptModal(true)
  }

  const handleConfirmAccept = () => {
    onAcceptAnswer(answer.id)
    setShowAcceptModal(false)
  }

  const handleHelpfulClick = () => {
    if (!isAuthenticated) {
      onLoginRequired()
      return
    }
    onToggleHelpful(answer.id)
  }

  // 채택된 답변 여부 (임시로 isExpert로 판단, 실제로는 accepted 필드 사용)
  const isAccepted = (answer as any).accepted || false

  return (
    <div
      className={`answer-card ${answer.isExpert ? 'expert-answer' : 'regular-answer'} ${isAccepted ? 'accepted-answer' : ''}`}
      style={{
        background: isAccepted
          ? 'linear-gradient(to right, #ecfdf5, #ffffff)'
          : answer.isExpert
            ? 'linear-gradient(to right, #f0fdf4, #ffffff)'
            : 'white',
        border: isAccepted
          ? '2px solid var(--color-green-600)'
          : answer.isExpert
            ? '2px solid var(--color-green-500)'
            : '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: isAccepted
          ? '0 4px 16px rgba(5, 150, 105, 0.3)'
          : answer.isExpert
            ? '0 4px 12px rgba(34, 197, 94, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
    >
      {/* 채택된 답변 배지 */}
      {isAccepted && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          right: '-1px',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          borderRadius: '0 12px 0 12px',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span style={{ fontSize: '1rem' }}>✅</span>
          채택된 답변
        </div>
      )}

      {/* Certified User 답변 배지 */}
      {answer.isExpert && !isAccepted && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          right: '-1px',
          background: 'linear-gradient(135deg, var(--color-green-500), var(--color-green-600))',
          color: 'white',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          borderRadius: '0 12px 0 12px',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span style={{ fontSize: '1rem' }}>✨</span>
          Certified User 답변
        </div>
      )}

      {/* 작성자 정보 */}
      <div className="author-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div
          className={`author-avatar ${answer.isExpert ? 'expert-avatar' : ''}`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isAccepted
              ? 'linear-gradient(135deg, #059669, #047857)'
              : answer.isExpert
                ? 'linear-gradient(135deg, #84cc16, #65a30d)'
                : 'linear-gradient(135deg, var(--color-blue-400), var(--color-blue-600))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '20px',
            border: answer.isExpert || isAccepted ? '3px solid white' : '2px solid white',
            boxShadow: isAccepted
              ? '0 4px 12px rgba(5, 150, 105, 0.4)'
              : answer.isExpert
                ? '0 4px 12px rgba(132, 204, 22, 0.4)'
                : '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
        >
          {answer.author.name[0]}
        </div>
        <div className="author-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{answer.author.name}</h3>
            {answer.isExpert && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'transparent',
                color: '#2563eb',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <span style={{ color: '#84cc16' }}>✅</span> Certified <span style={{ fontWeight: 700 }}>인증 완료</span>
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            {answer.author.role || '일반 회원'} • {new Date(answer.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* 답변 내용 */}
      <div className="answer-content" style={{ color: 'var(--foreground)', lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
        {answer.content}
      </div>

      {/* 액션 버튼들 */}
      <div className="question-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleHelpfulClick}
          className={`action-btn helpful-btn ${isHelpfulActive ? 'active' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: isHelpfulActive ? 'var(--color-blue-600)' : 'var(--muted-foreground)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            transition: 'all 0.2s',
            fontSize: '0.875rem'
          }}
        >
          <span>👍</span>
          <span>{answer.helpful}</span>
        </button>
        <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'all 0.2s', fontSize: '0.875rem' }}>
          <span>💬</span>
          <span>{answer.commentCount}</span>
        </button>
        <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'all 0.2s', fontSize: '0.875rem' }}>
          <span>🔖</span>
          <span>북마크</span>
        </button>

        {/* 채택하기 버튼 - 질문 작성자에게만 표시, 아직 채택되지 않은 경우 */}
        {isQuestionAuthor && !isAccepted && (
          <button
            onClick={handleAcceptClick}
            className="accept-btn"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.3)'
            }}
          >
            <span>✅</span>
            <span>이 답변을 채택하기</span>
          </button>
        )}
      </div>

      {/* 채택 확인 모달 */}
      {showAcceptModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAcceptModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
              이 답변을 채택하시겠습니까?
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginBottom: '2rem', lineHeight: 1.5 }}>
              채택 후에는 변경할 수 없습니다.<br />
              답변 작성자의 신뢰 점수가 증가합니다.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAcceptModal(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'white',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmAccept}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                채택하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
