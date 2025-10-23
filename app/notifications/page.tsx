'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'

type NotificationCategory = 'all' | 'answer' | 'comment' | 'vote' | 'system'

interface NotificationItem {
  id: string
  type: NotificationCategory
  title: string
  message: string
  relatedUrl?: string
  createdAt: string
  isRead: boolean
  icon: string
}

const TYPE_ICON_MAP: Record<NotificationCategory, string> = {
  all: '🔔',
  answer: '💬',
  comment: '💭',
  vote: '👍',
  system: '🛎️'
}

function determineCategory(type: string): NotificationCategory {
  const normalized = type.toLowerCase()
  if (normalized.includes('answer')) return 'answer'
  if (normalized.includes('comment')) return 'comment'
  if (normalized.includes('vote') || normalized.includes('like')) return 'vote'
  if (normalized.includes('system') || normalized.includes('announcement')) return 'system'
  return 'system'
}

function buildRelatedUrl(actionUrl?: string | null, relatedType?: string | null, relatedId?: string | null): string | undefined {
  if (actionUrl && actionUrl.startsWith('/')) return actionUrl
  if (relatedType === 'question' && relatedId) return `/questions/${relatedId}`
  if (relatedType === 'answer' && relatedId) return `/answers/${relatedId}`
  if (relatedType === 'post' && relatedId) return `/posts/${relatedId}`
  return undefined
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationCategory>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/notifications?limit=50', { cache: 'no-store' })
      if (res.status === 401) {
        window.location.href = '/auth/login?redirectTo=/notifications'
        return
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '알림을 불러오지 못했습니다.')
      }

      const payload = await res.json()
      const items = Array.isArray(payload?.notifications)
        ? payload.notifications
        : (payload?.data ?? [])

      const mapped: NotificationItem[] = items.map((notification: any) => {
        const category = determineCategory(String(notification?.type || 'system'))
        return {
          id: String(notification.id),
          type: category,
          title: String(notification.title || '알림'),
          message: String(notification.message || ''),
          relatedUrl: buildRelatedUrl(notification.action_url, notification.related_type, notification.related_id),
          createdAt: typeof notification.created_at === 'string'
            ? notification.created_at
            : new Date().toISOString(),
          isRead: Boolean(notification.is_read),
          icon: TYPE_ICON_MAP[category] || '🔔'
        }
      })

      setNotifications(mapped)
    } catch (err: any) {
      console.error('[NotificationsPage] loadNotifications failed:', err)
      setError(err?.message || '알림을 불러오지 못했습니다.')
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications
    return notifications.filter(item => item.type === filter)
  }, [notifications, filter])

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  async function markAllAsRead() {
    setProcessing(true)
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '모든 알림을 읽음 처리하지 못했습니다.')
      }
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })))
    } catch (err: any) {
      console.error('[NotificationsPage] markAllAsRead failed:', err)
      alert(err?.message || '모든 알림을 읽음 처리하지 못했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: [id] })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '알림을 읽음 처리하지 못했습니다.')
      }

      setNotifications(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item))
    } catch (err: any) {
      console.error('[NotificationsPage] markAsRead failed:', err)
      alert(err?.message || '알림을 읽음 처리하지 못했습니다.')
    }
  }

  async function deleteNotification(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '알림을 삭제하지 못했습니다.')
      }

      setNotifications(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      console.error('[NotificationsPage] deleteNotification failed:', err)
      alert(err?.message || '알림을 삭제하지 못했습니다.')
    }
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
        <div className="section notifications-page-header">
          <div className="notifications-header-top">
            <div>
              <h1 className="section-title notifications-page-title">🔔 알림 센터</h1>
              {error ? (
                <p className="notifications-error">{error}</p>
              ) : (
                <p className="notifications-subtitle">
                  {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림이 있습니다` : '모든 알림을 확인했습니다'}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-secondary notifications-mark-read-btn"
                onClick={markAllAsRead}
                disabled={processing}
              >
                {processing ? '처리 중...' : '모두 읽음 처리'}
              </button>
            )}
          </div>

          <div className="category-tabs notifications-filter-tabs">
            {(['all', 'answer', 'comment', 'vote', 'system'] as NotificationCategory[]).map((category) => (
              <button
                key={category}
                className={`category-tab ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {TYPE_ICON_MAP[category]} {category === 'all' ? '전체' : category === 'answer' ? '답변' : category === 'comment' ? '댓글' : category === 'vote' ? '추천' : '시스템'}
              </button>
            ))}
          </div>
        </div>

        <div className="notifications-list section">
          {isLoading ? (
            <div className="notifications-loading">알림을 불러오는 중입니다...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty-state">
              <div className="notifications-empty-icon">📭</div>
              <h3>알림이 없습니다</h3>
              <p>새로운 활동이 발생하면 여기에서 확인할 수 있습니다.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.isRead ? '' : 'unread'}`}
                onMouseEnter={(e) => {
                  e.currentTarget.classList.add('hovering')
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove('hovering')
                }}
              >
                <div className="notification-icon">{notification.icon}</div>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>
                    <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                  </div>
                  <p>{notification.message}</p>
                  {notification.relatedUrl && (
                    <Link href={notification.relatedUrl} className="notification-link">
                      바로가기 →
                    </Link>
                  )}
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button onClick={() => markAsRead(notification.id)}>읽음</button>
                  )}
                  <button onClick={() => deleteNotification(notification.id)}>삭제</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}
