'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BRAND_NAME } from '@/lib/constants/branding'

type QuickAction = {
  id: string
  icon: string
  label: string
  prompt: string
  reply: string
}

type ChatbotMessage = {
  id: string
  role: 'bot' | 'user'
  text: string
  timestamp: string
  quickButtons?: QuickAction[]
}

type ChatbotModalProps = {
  isOpen: boolean
  onClose: () => void
}

function formatTimestamp() {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: 'numeric'
  })
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'popular-questions',
    icon: '📝',
    label: '인기 질문 보기',
    prompt: '최근 인기 있는 질문을 알려줘',
    reply: '최근 인기 질문은 홈 화면 상단의 인기 탭에서 확인할 수 있어요. 자주 묻는 질문을 모아두었으니 참고해 보세요!'
  },
  {
    id: 'categories',
    icon: '🧭',
    label: '카테고리 추천',
    prompt: '내게 맞는 카테고리를 추천해줘',
    reply: '관심 주제를 고르면 맞춤 피드를 보여드릴 수 있어요. 상단 메뉴의 “토픽 둘러보기”에서 취향에 맞는 카테고리를 선택해 보세요.'
  },
  {
    id: 'verification',
    icon: '🤝',
    label: '인증 방법 알려줘',
    prompt: '인증된 사용자가 되는 방법을 알려줘',
    reply: '프로필 설정에서 인증 신청을 하면 관리자가 확인 후 verified 배지를 드립니다. 신청 내역은 마이페이지에서 확인할 수 있어요.'
  },
  {
    id: 'updates',
    icon: '📢',
    label: '최근 업데이트 소식',
    prompt: '최근 업데이트 소식을 알려줘',
    reply: '최근에는 챗봇과 모바일 화면을 개선했어요. 앞으로도 커뮤니티 공지를 통해 새로운 기능을 계속 공유드릴 예정입니다.'
  }
]

function buildInitialMessages(): ChatbotMessage[] {
  return [
    {
      id: 'welcome',
      role: 'bot',
      text: `${BRAND_NAME} 챗봇에 오신 것을 환영합니다!\n궁금한 점이 있다면 아래 빠른 질문을 눌러보거나 직접 입력해 주세요.`,
      timestamp: formatTimestamp(),
      quickButtons: QUICK_ACTIONS
    },
    {
      id: 'info',
      role: 'bot',
      text: [
        '☕ 상담 운영 시간',
        '• 평일 오전 10시 ~ 오후 6시',
        '',
        '💡 TIP',
        '• 질문하기 버튼을 눌러 커뮤니티에 바로 질문을 올릴 수 있어요.',
        '• 프로필을 업데이트하면 더 정확한 답변을 받는 데 도움이 됩니다.'
      ].join('\n'),
      timestamp: formatTimestamp()
    }
  ]
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => buildInitialMessages())
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const hasConversation = useMemo(() => messages.length > 0, [messages])

  function appendMessage(partial: Omit<ChatbotMessage, 'id' | 'timestamp'>) {
    setMessages((prev) => [
      ...prev,
      {
        ...partial,
        id: `${partial.role}-${Date.now()}`,
        timestamp: formatTimestamp()
      }
    ])
  }

  function clearQuickButtons() {
    setMessages((prev) =>
      prev.map((message) =>
        message.quickButtons ? { ...message, quickButtons: undefined } : message
      )
    )
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return

    clearQuickButtons()
    appendMessage({ role: 'user', text: trimmed })
    setInputValue('')

    window.setTimeout(() => {
      appendMessage({
        role: 'bot',
        text: [
          '문의 감사합니다! 현재는 간단한 안내만 제공되고 있어요.',
          '홈 화면의 “질문하기” 버튼을 눌러 커뮤니티에 직접 질문을 올리면 더 빠르게 답변을 받을 수 있습니다.'
        ].join(' ')
      })
    }, 550)
  }

  function handleQuickAction(action: QuickAction) {
    clearQuickButtons()
    appendMessage({ role: 'user', text: action.prompt })
    window.setTimeout(() => {
      appendMessage({ role: 'bot', text: action.reply })
    }, 350)
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-modal" role="dialog" aria-modal="true" aria-label={`${BRAND_NAME} 챗봇`}>
      <div className="chatbot-modal-overlay" onClick={onClose} aria-hidden="true" />

      <div className="chatbot-modal-panel" role="document">
        <div className="chatbot-header">
          <button
            type="button"
            className="chatbot-back-btn"
            onClick={onClose}
            aria-label="챗봇 닫기"
          >
            ←
          </button>

          <div className="chatbot-header-content">
            <div className="chatbot-header-logo">
              <div className="chatbot-logo-circle">VK</div>
            </div>
            <div className="chatbot-header-text">
              <h2 className="chatbot-header-title" translate="no" data-no-translate="true">
                Q&A 커뮤니티 {BRAND_NAME}
              </h2>
              <p className="chatbot-header-subtitle">무엇을 도와드릴까요?</p>
            </div>
          </div>

          <button
            type="button"
            className="chatbot-home-btn"
            onClick={onClose}
            aria-label="홈으로 이동"
          >
            🏠
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message) => {
            const isBot = message.role === 'bot'
            return (
              <div
                key={message.id}
                className={`chatbot-message ${isBot ? 'chatbot-message-bot' : 'chatbot-message-user'}`}
              >
                {isBot && (
                  <div className="chatbot-message-avatar">
                    <div className="chatbot-avatar-circle">🤖</div>
                  </div>
                )}

                <div className="chatbot-message-content">
                  <div className={`chatbot-message-bubble ${isBot ? 'chatbot-bubble-bot' : 'chatbot-bubble-user'}`}>
                    {message.text.split('\n').map((line, index) => (
                      <div key={`${message.id}-${index}`}>{line}</div>
                    ))}
                  </div>
                  <div className="chatbot-message-time">{message.timestamp}</div>

                  {message.quickButtons && (
                    <div className="chatbot-quick-buttons">
                      {message.quickButtons.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          className="chatbot-quick-button"
                          onClick={() => handleQuickAction(action)}
                        >
                          <span className="chatbot-quick-icon">{action.icon}</span>
                          <span className="chatbot-quick-label">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {hasConversation && <div ref={messagesEndRef} />}
        </div>

        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="질문을 입력하세요..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button
            type="submit"
            className="chatbot-send-btn"
            disabled={inputValue.trim().length === 0}
            aria-label="메시지 전송"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  )
}
