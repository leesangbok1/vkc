import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '@services/AuthContext'
import { useRealtime } from '@services/RealtimeContext'

const ChatSystem = ({
  chatType = 'general', // 'general' | 'expert' | 'private'
  targetUserId = null,
  postId = null,
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  const { user } = useAuth()
  const { isConnected } = useRealtime()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const chatInputRef = useRef(null)

  // 채팅방 ID 생성
  const getChatRoomId = () => {
    if (chatType === 'private' && targetUserId) {
      // 프라이빗 채팅: 두 사용자 ID를 정렬하여 일관된 ID 생성
      const userIds = [user.uid, targetUserId].sort()
      return `private_${userIds.join('_')}`
    } else if (chatType === 'expert') {
      return 'expert_room'
    } else if (postId) {
      return `post_${postId}`
    } else {
      return 'general_room'
    }
  }

  const chatRoomId = getChatRoomId()

  useEffect(() => {
    if (user && isConnected) {
      loadChatHistory()
      setupRealtimeListeners()
    }

    return () => {
      cleanup()
    }
  }, [user, isConnected, chatRoomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      // TODO: Firebase에서 채팅 기록 로드
      // 임시 데이터
      const mockMessages = [
        {
          id: 1,
          senderId: 'expert01',
          senderName: '김민준 행정사',
          senderAvatar: '/images/expert1.png',
          content: '안녕하세요! 비자 관련 질문이 있으시면 언제든 문의해주세요.',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          type: 'text'
        },
        {
          id: 2,
          senderId: 'user01',
          senderName: 'Nguyen Van A',
          senderAvatar: '/images/default-avatar.png',
          content: 'F-2-R 비자 신청 시 필요한 서류가 궁금합니다.',
          timestamp: new Date(Date.now() - 20000).toISOString(),
          type: 'text'
        }
      ]

      setMessages(mockMessages)
      setOnlineUsers([
        { id: 'expert01', name: '김민준 행정사', avatar: '/images/expert1.png', status: 'online' },
        { id: 'user02', name: 'Tran Thi B', avatar: '/images/default-avatar.png', status: 'online' }
      ])
    } catch (err) {
      console.error('채팅 기록 로드 실패:', err)
      setError('채팅을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeListeners = () => {
    // TODO: Firebase 실시간 리스너 설정
    console.log('🔥 실시간 채팅 리스너 설정:', chatRoomId)
  }

  const cleanup = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    // TODO: Firebase 리스너 정리
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const messageData = {
      id: Date.now(),
      senderId: user.uid,
      senderName: user.name,
      senderAvatar: user.profilePic || '/images/default-avatar.png',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    try {
      // 즉시 UI 업데이트 (낙관적 업데이트)
      setMessages(prev => [...prev, messageData])
      setNewMessage('')

      // TODO: Firebase에 메시지 저장
      console.log('💬 메시지 전송:', messageData)

      // 타이핑 상태 해제
      setIsTyping(false)
      stopTypingIndicator()

    } catch (err) {
      console.error('메시지 전송 실패:', err)
      // 실패 시 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== messageData.id))
      setError('메시지 전송에 실패했습니다.')
    }
  }

  const handleTyping = (value) => {
    setNewMessage(value)

    if (!isTyping && value.trim()) {
      setIsTyping(true)
      // TODO: 타이핑 상태를 다른 사용자에게 알림
    }

    // 타이핑 중지 타이머 재설정
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTypingIndicator()
    }, 1000)
  }

  const stopTypingIndicator = () => {
    // TODO: 타이핑 상태 해제를 다른 사용자에게 알림
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return '오늘'
    }

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
      return '어제'
    }

    return date.toLocaleDateString('ko-KR')
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}

    messages.forEach(message => {
      const date = formatDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const getChatTitle = () => {
    switch (chatType) {
      case 'expert':
        return '🏆 전문가 상담'
      case 'private':
        return `💬 개인 채팅`
      case 'general':
      default:
        return '💬 일반 채팅'
    }
  }

  if (isLoading) {
    return (
      <div className="chat-system loading">
        <div className="chat-header">
          <h3>{getChatTitle()}</h3>
        </div>
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <span>채팅을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-system error">
        <div className="chat-header">
          <h3>{getChatTitle()}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="chat-error">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={loadChatHistory}>다시 시도</button>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className={`chat-system ${chatType} ${isMinimized ? 'minimized' : ''}`}>
      {/* 채팅 헤더 */}
      <div className="chat-header">
        <div className="chat-info">
          <h3>{getChatTitle()}</h3>
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? '연결됨' : '연결 끊김'}</span>
          </div>
        </div>

        <div className="chat-controls">
          {onlineUsers.length > 0 && (
            <div className="online-count" title="온라인 사용자">
              <i className="fa-solid fa-users"></i>
              <span>{onlineUsers.length}</span>
            </div>
          )}

          {onToggleMinimize && (
            <button className="minimize-btn" onClick={onToggleMinimize}>
              <i className={`fa-solid fa-${isMinimized ? 'maximize' : 'minimize'}`}></i>
            </button>
          )}

          {onClose && (
            <button className="close-btn" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 온라인 사용자 목록 */}
          {onlineUsers.length > 0 && (
            <div className="online-users">
              <div className="users-list">
                {onlineUsers.map(onlineUser => (
                  <div key={onlineUser.id} className="user-item">
                    <img src={onlineUser.avatar} alt={onlineUser.name} />
                    <span>{onlineUser.name}</span>
                    <div className={`status-indicator ${onlineUser.status}`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div className="chat-messages">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="message-group">
                <div className="date-separator">
                  <span>{date}</span>
                </div>

                {dateMessages.map((message, index) => {
                  const isOwn = message.senderId === user?.uid
                  const showAvatar = index === 0 ||
                    dateMessages[index - 1].senderId !== message.senderId

                  return (
                    <div key={message.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && showAvatar && (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="message-avatar"
                        />
                      )}

                      <div className="message-content">
                        {!isOwn && showAvatar && (
                          <div className="message-sender">{message.senderName}</div>
                        )}

                        <div className="message-bubble">
                          <p>{message.content}</p>
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-avatar">
                  <img src="/images/default-avatar.png" alt="typing" />
                </div>
                <div className="typing-content">
                  <div className="typing-bubble">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <span className="typing-text">
                    {typingUsers.join(', ')}님이 입력 중...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 메시지 입력 영역 */}
          <form className="chat-input" onSubmit={sendMessage}>
            <div className="input-wrapper">
              <input
                ref={chatInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={!isConnected}
                maxLength={1000}
              />

              <div className="input-actions">
                <button type="button" className="emoji-btn" title="이모지">
                  <i className="fa-solid fa-smile"></i>
                </button>

                <button type="button" className="attach-btn" title="파일 첨부">
                  <i className="fa-solid fa-paperclip"></i>
                </button>

                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim() || !isConnected}
                  title="전송"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>

            <div className="input-status">
              {!isConnected && (
                <span className="connection-warning">
                  <i className="fa-solid fa-wifi-slash"></i>
                  연결이 끊어졌습니다
                </span>
              )}

              <span className="char-count">
                {newMessage.length}/1000
              </span>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

// CSS Styles
const styles = `
/* Chat System Styles */
.chat-system {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.chat-system.minimized {
  height: 60px;
}

.chat-system.expert {
  border-left: 4px solid #ffc107;
}

.chat-system.private {
  border-left: 4px solid #28a745;
}

.chat-system.general {
  border-left: 4px solid #007bff;
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-dot.connected {
  background: #28a745;
  animation: pulse 2s infinite;
}

.chat-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.online-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.minimize-btn,
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.minimize-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Online Users */
.online-users {
  background: #f8f9fa;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.users-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 6px 10px;
  border-radius: 15px;
  white-space: nowrap;
  font-size: 12px;
  position: relative;
  border: 1px solid #e0e0e0;
}

.user-item img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #28a745;
  border: 1px solid white;
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
}

.message-group {
  margin-bottom: 20px;
}

.date-separator {
  text-align: center;
  margin: 20px 0;
}

.date-separator span {
  background: white;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
}

.message {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-end;
  gap: 8px;
}

.message.own {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message.own .message-content {
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.message-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  border: 1px solid #e0e0e0;
  word-wrap: break-word;
}

.message.own .message-bubble {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.message-bubble p {
  margin: 0;
  line-height: 1.4;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.typing-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.typing-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #007bff;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-text {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 4px;
}

/* Chat Input */
.chat-input {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 12px 16px;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: #333;
}

.input-wrapper input::placeholder {
  color: #999;
}

.input-wrapper input:disabled {
  opacity: 0.6;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.emoji-btn,
.attach-btn,
.send-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover,
.attach-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.send-btn {
  background: #007bff;
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.input-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.connection-warning {
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-count {
  color: #999;
}

/* Loading/Error States */
.chat-loading,
.chat-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.chat-error i {
  font-size: 2rem;
  color: #dc3545;
  margin-bottom: 12px;
}

.chat-error button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-system {
    height: 400px;
    border-radius: 0;
  }

  .chat-system.minimized {
    height: 50px;
  }

  .chat-header {
    padding: 10px 12px;
  }

  .chat-messages {
    padding: 12px;
  }

  .message-content {
    max-width: 85%;
  }

  .online-users {
    padding: 6px 12px;
  }

  .chat-input {
    padding: 10px 12px;
  }
}

/* Dark mode support */
[data-theme="dark"] .chat-system {
  background: #2d2d2d;
  border-color: #555;
}

[data-theme="dark"] .chat-messages {
  background: #1a1a1a;
}

[data-theme="dark"] .message-bubble {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .message.own .message-bubble {
  background: #007bff;
  color: white;
}

[data-theme="dark"] .input-wrapper {
  background: #404040;
  border-color: #555;
}

[data-theme="dark"] .input-wrapper input {
  color: #ffffff;
}

[data-theme="dark"] .date-separator span {
  background: #404040;
  border-color: #555;
  color: #cccccc;
}

[data-theme="dark"] .online-users {
  background: #404040;
  border-bottom-color: #555;
}

[data-theme="dark"] .user-item {
  background: #555;
  border-color: #666;
  color: #ffffff;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

ChatSystem.propTypes = {
  chatType: PropTypes.oneOf(['general', 'expert', 'private']),
  targetUserId: PropTypes.string,
  postId: PropTypes.string,
  isMinimized: PropTypes.bool,
  onToggleMinimize: PropTypes.func,
  onClose: PropTypes.func
}

export default ChatSystem