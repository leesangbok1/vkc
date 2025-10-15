'use client'

import { useState } from 'react'
import ChatbotModal from './ChatbotModal'

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <>
      {/* Floating Button */}
      <button
        className="chatbot-button"
        onClick={() => setIsOpen(true)}
        aria-label="챗봇 열기"
        title="궁금한 점이 있으신가요?"
      >
        <span className="chatbot-icon">💬</span>
        {unreadCount > 0 && (
          <span className="chatbot-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
