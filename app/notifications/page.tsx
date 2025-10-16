'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { MOCK_QUESTIONS, MOCK_POSTS } from '@/lib/data/mockData'

type Notification = {
  id: string
  type: 'answer' | 'comment' | 'vote' | 'system'
  title: string
  message: string
  relatedUrl?: string
  relatedId?: string  // 질문 또는 게시글 ID
  createdAt: string
  isRead: boolean
  icon: string
}

// 실제 게시글 기반 Mock 알림 데이터 생성
function generateNotifications(): Notification[] {
  const notifications: Notification[] = []

  // 최근 질문들에 대한 답변 알림 (실제 질문 ID 사용)
  if (MOCK_QUESTIONS.length >= 3) {
    notifications.push({
      id: 'n1',
      type: 'answer',
      title: '새로운 답변이 달렸습니다',
      message: `${MOCK_QUESTIONS[0].author.name}님이 "${MOCK_QUESTIONS[0].title.substring(0, 30)}..."에 답변을 남겼습니다.`,
      relatedUrl: `/questions/${MOCK_QUESTIONS[0].id}`,
      relatedId: MOCK_QUESTIONS[0].id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      icon: '💬'
    })

    notifications.push({
      id: 'n2',
      type: 'answer',
      title: '답변 채택됨',
      message: `"${MOCK_QUESTIONS[1].title.substring(0, 30)}..."에서 회원님의 답변이 채택되었습니다!`,
      relatedUrl: `/questions/${MOCK_QUESTIONS[1].id}`,
      relatedId: MOCK_QUESTIONS[1].id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      icon: '✓'
    })

    notifications.push({
      id: 'n3',
      type: 'comment',
      title: '새로운 댓글',
      message: `${MOCK_QUESTIONS[2].author.name}님이 회원님의 답변에 댓글을 남겼습니다.`,
      relatedUrl: `/questions/${MOCK_QUESTIONS[2].id}`,
      relatedId: MOCK_QUESTIONS[2].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      icon: '💭'
    })
  }

  // 게시글에 대한 추천 알림
  if (MOCK_POSTS.length >= 1) {
    notifications.push({
      id: 'n4',
      type: 'vote',
      title: '추천을 받았습니다',
      message: `8명이 "${MOCK_POSTS[0].title.substring(0, 30)}..." 게시글을 추천했습니다.`,
      relatedUrl: `/posts/${MOCK_POSTS[0].id}`,
      relatedId: MOCK_POSTS[0].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      icon: '👍'
    })
  }

  // 시스템 알림
  notifications.push({
    id: 'n5',
    type: 'system',
    title: '🎉 베타 오픈 이벤트 참여하세요!',
    message: 'Certified User 답변 10개 작성하고 네이버페이 10,000원 받아가세요!',
    relatedUrl: '/',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    icon: '🎁'
  })

  return notifications
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'answer' | 'comment' | 'vote' | 'system'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // localStorage에서 알림 로드 또는 초기화
  useEffect(() => {
    const stored = localStorage.getItem('vietkconnect_notifications')
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (e) {
        // localStorage 파싱 실패 시 새로 생성
        const newNotifications = generateNotifications()
        setNotifications(newNotifications)
        localStorage.setItem('vietkconnect_notifications', JSON.stringify(newNotifications))
      }
    } else {
      // 첫 방문 시 알림 생성
      const newNotifications = generateNotifications()
      setNotifications(newNotifications)
      localStorage.setItem('vietkconnect_notifications', JSON.stringify(newNotifications))
    }
  }, [])

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.isRead).length

  function markAllAsRead() {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    setNotifications(updated)
    localStorage.setItem('vietkconnect_notifications', JSON.stringify(updated))
  }

  function markAsRead(id: string) {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    )
    setNotifications(updated)
    localStorage.setItem('vietkconnect_notifications', JSON.stringify(updated))
  }

  function deleteNotification(id: string) {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    localStorage.setItem('vietkconnect_notifications', JSON.stringify(updated))
  }

  function getTimeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diff = now.getTime() - past.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  return (
    <PageLayout variant="centered">
      <div className="notifications-page-container">
        {/* Page Header */}
        <div className="section notifications-page-header">
          <div className="notifications-header-top">
            <div>
              <h1 className="section-title notifications-page-title">
                🔔 알림 센터
              </h1>
              <p className="notifications-subtitle">
                {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림이 있습니다` : '모든 알림을 확인했습니다'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-secondary notifications-mark-read-btn"
                onClick={markAllAsRead}
              >
                모두 읽음 처리
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="category-tabs notifications-filter-tabs">
            <button
              className={`category-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체
            </button>
            <button
              className={`category-tab ${filter === 'answer' ? 'active' : ''}`}
              onClick={() => setFilter('answer')}
            >
              답변
            </button>
            <button
              className={`category-tab ${filter === 'comment' ? 'active' : ''}`}
              onClick={() => setFilter('comment')}
            >
              댓글
            </button>
            <button
              className={`category-tab ${filter === 'vote' ? 'active' : ''}`}
              onClick={() => setFilter('vote')}
            >
              추천
            </button>
            <button
              className={`category-tab ${filter === 'system' ? 'active' : ''}`}
              onClick={() => setFilter('system')}
            >
              시스템
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="section notifications-empty-state">
            <div className="notifications-empty-icon">🔔</div>
            <h3 className="notifications-empty-title">
              알림이 없습니다
            </h3>
            <p className="notifications-empty-message">
              새로운 활동이 있으면 알림이 표시됩니다
            </p>
            <Link href="/">
              <button className="btn btn-primary">
                홈으로 돌아가기
              </button>
            </Link>
          </div>
        ) : (
          <div className="section notifications-list">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.isRead ? 'notification-card-unread' : ''}`}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.relatedUrl) {
                    window.location.href = notification.relatedUrl
                  }
                }}
              >
                {/* Icon */}
                <div className={`notification-icon-circle ${!notification.isRead ? 'notification-icon-circle-unread' : ''}`}>
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="notification-card-content">
                  <h3 className={`notification-card-title ${!notification.isRead ? 'notification-card-title-unread' : ''}`}>
                    {notification.title}
                  </h3>
                  <p className="notification-card-message">
                    {notification.message}
                  </p>
                  <span className="notification-card-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  className="notification-delete-btn"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
