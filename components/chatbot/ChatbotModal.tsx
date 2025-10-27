'use client'

import { useState, useEffect, useRef } from 'react'
import { BRAND_NAME } from '@/lib/constants/branding'

interface Message {
  id: string
  sender: 'bot' | 'user'
  content: string
  timestamp: string
  quickButtons?: QuickButton[]
}

interface QuickButton {
  id: string
  label: string
  icon: string
  action: () => void
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 초기 메시지와 퀵 버튼 로드
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadInitialMessages()
    }
  }, [isOpen])

  // 메시지 추가 시 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function loadInitialMessages() {
    const welcomeMessage: Message = {
      id: '1',
      sender: 'bot',
      content: '안녕하세요 회원님! 아래에서 궁금한 사항을 선택해 주세요!',
      timestamp: new Date().toISOString(),
      quickButtons: getQuickButtons()
    }

    const operatingHoursMessage: Message = {
      id: '2',
      sender: 'bot',
      content: `☕ 상담 운영시간\n• [평일] 오전 10시 ~ 오후 6시\n\n💌 문의 접수 시 참고 사항\n• 문의가 많은 경우 영업일 기준 최대 1~2일이 소요될 수 있는 점 양해의 말씀 드립니다.\n• 문의를 여러번 남겨주시는 경우 채팅창이 누락될 수 있어요. 문의는 한번만 남겨주세요.\n• 문의를 남긴 뒤 전화번호를 입력해주시면, 채팅창을 나가서도 나중에 문자로 알림을 받으실 수 있어요!`,
      timestamp: new Date().toISOString()
    }

    setMessages([welcomeMessage, operatingHoursMessage])
  }

  function getQuickButtons(): QuickButton[] {
    return [
      {
        id: 'service-intro',
        label: `${BRAND_NAME}는 어떤 서비스인가요?`,
        icon: '😊',
        action: () => handleQuickButtonClick('service-intro', `${BRAND_NAME}는 어떤 서비스인가요?`)
      },
      {
        id: 'login-account',
        label: '로그인·계정 관련 문의',
        icon: '🔑',
        action: () => handleQuickButtonClick('login-account', '로그인·계정 관련 문의')
      },
      {
        id: 'qa-question',
        label: 'Q&A 관련 문의',
        icon: '❓',
        action: () => handleQuickButtonClick('qa-question', 'Q&A 관련 문의')
      },
      {
        id: 'certified-user',
        label: 'Certified User 관련 문의',
        icon: '✅',
        action: () => handleQuickButtonClick('certified-user', 'Certified User 관련 문의')
      },
      {
        id: 'rewards',
        label: '보상·리워드 관련 문의',
        icon: '💰',
        action: () => handleQuickButtonClick('rewards', '보상·리워드 관련 문의')
      },
      {
        id: 'missions',
        label: '미션 관련 문의',
        icon: '🎯',
        action: () => handleQuickButtonClick('missions', '미션 관련 문의')
      },
      {
        id: 'bookmarks',
        label: '북마크·스크랩 관련 문의',
        icon: '🔖',
        action: () => handleQuickButtonClick('bookmarks', '북마크·스크랩 관련 문의')
      },
      {
        id: 'events',
        label: '이벤트 관련 문의',
        icon: '🎉',
        action: () => handleQuickButtonClick('events', '이벤트 관련 문의')
      },
      {
        id: 'bug-report',
        label: '서비스 오류 제보',
        icon: '🛠️',
        action: () => handleQuickButtonClick('bug-report', '서비스 오류 제보')
      },
      {
        id: 'policy-report',
        label: '이용정책·신고 제보',
        icon: '📋',
        action: () => handleQuickButtonClick('policy-report', '이용정책·신고 제보')
      }
    ]
  }

  function handleQuickButtonClick(buttonId: string, label: string) {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: label,
      timestamp: new Date().toISOString()
    }

    // 봇 응답 (Mock)
    const botResponse: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      content: `"${label}"에 대한 문의를 접수했습니다. 잠시만 기다려주세요!\n\n실제 챗봇 기능은 곧 추가될 예정입니다. 현재는 UI 프리뷰 모드입니다.`,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage, botResponse])
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    const botResponse: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      content: '메시지를 받았습니다! 실제 챗봇 기능은 곧 추가될 예정입니다.',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage, botResponse])
    setInputValue('')
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-modal">
      {/* Header */}
      <div className="chatbot-header">
        <button
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
            <h2 className="chatbot-header-title" translate="no" data-no-translate="true">Q&A 커뮤니티 {BRAND_NAME}</h2>
            <p className="chatbot-header-subtitle">내일 오전 10:00부터 운영해요</p>
          </div>
        </div>
        <button
          className="chatbot-home-btn"
          onClick={onClose}
          aria-label="홈으로 가기"
        >
          🏠
        </button>
      </div>

      {/* Messages Area */}
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chatbot-message ${message.sender === 'bot' ? 'chatbot-message-bot' : 'chatbot-message-user'}`}
          >
            {message.sender === 'bot' && (
              <div className="chatbot-message-avatar">
                <div className="chatbot-avatar-circle">🤖</div>
              </div>
            )}

            <div className="chatbot-message-content">
              <div className={`chatbot-message-bubble ${message.sender === 'bot' ? 'chatbot-bubble-bot' : 'chatbot-bubble-user'}`}>
                {message.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div className="chatbot-message-time">{formatTime(message.timestamp)}</div>

              {/* Quick Buttons */}
              {message.quickButtons && message.quickButtons.length > 0 && (
                <div className="chatbot-quick-buttons">
                  {message.quickButtons.map((button) => (
                    <button
                      key={button.id}
                      className="chatbot-quick-button"
                      onClick={button.action}
                    >
                      <span className="chatbot-quick-icon">{button.icon}</span>
                      <span className="chatbot-quick-label">{button.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chatbot-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chatbot-input"
          placeholder="메시지를 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          className="chatbot-send-btn"
          disabled={!inputValue.trim()}
          aria-label="메시지 전송"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
