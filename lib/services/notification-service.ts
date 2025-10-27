'use client'

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/supabase'
import { createLogger } from '@/lib/utils/error-logger'

type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'question' | 'answer' | 'comment'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  expiresAt?: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface NotificationSubscriptionOptions {
  userId: string
  onNotification?: (notification: NotificationData) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

class NotificationService {
  private static instance: NotificationService
  private supabase = createSupabaseBrowserClient()
  private logger = createLogger('NotificationService', 'system')
  private channels = new Map<string, RealtimeChannel>()
  private subscribers = new Map<string, NotificationSubscriptionOptions>()
  private isInitialized = false

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.isInitialized) return

    try {
      // Supabase 연결 상태 확인
      const { data: { session } } = await this.supabase.auth.getSession()

      if (session) {
        this.logger.info('NotificationService initialized', {
          userId: session.user.id
        })
      }

      this.isInitialized = true
    } catch (error) {
      this.logger.error('Failed to initialize NotificationService', error as Error)
    }
  }

  /**
   * 사용자 알림 구독
   */
  subscribe(options: NotificationSubscriptionOptions): () => void {
    const { userId } = options

    if (this.subscribers.has(userId)) {
      this.logger.warn('User already subscribed to notifications', { userId })
      return this.unsubscribe.bind(this, userId)
    }

    this.subscribers.set(userId, options)

    // Realtime 채널 생성
    const channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          this.handleNewNotification(payload, options)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          this.handleNotificationUpdate(payload, options)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.logger.info('Successfully subscribed to notifications', { userId })
          options.onConnect?.()
        } else if (status === 'CHANNEL_ERROR') {
          this.logger.error('Failed to subscribe to notifications', undefined, { userId })
          options.onError?.(new Error('Failed to subscribe to notifications'))
        } else if (status === 'TIMED_OUT') {
          this.logger.error('Notification subscription timed out', undefined, { userId })
          options.onError?.(new Error('Subscription timed out'))
        }
      })

    this.channels.set(userId, channel)

    // 구독 해제 함수 반환
    return () => this.unsubscribe(userId)
  }

  /**
   * 구독 해제
   */
  unsubscribe(userId: string): void {
    const channel = this.channels.get(userId)
    const options = this.subscribers.get(userId)

    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(userId)
    }

    if (options) {
      this.subscribers.delete(userId)
      options.onDisconnect?.()
    }

    this.logger.info('Unsubscribed from notifications', { userId })
  }

  /**
   * 새로운 알림 처리
   */
  private handleNewNotification(
    payload: RealtimePostgresChangesPayload<NotificationRow>,
    options: NotificationSubscriptionOptions
  ) {
    try {
      const notificationRow = payload.new as NotificationRow
      const notification = this.transformNotification(notificationRow)

      this.logger.info('New notification received', {
        notificationId: notification.id,
        type: notification.type,
        userId: options.userId
      })

      options.onNotification?.(notification)

      // 브라우저 알림 표시 (권한이 있는 경우)
      if ('Notification' in window && Notification.permission === 'granted') {
        this.showBrowserNotification(notification)
      }

    } catch (error) {
      this.logger.error('Failed to handle new notification', error as Error)
      options.onError?.(error as Error)
    }
  }

  /**
   * 알림 업데이트 처리
   */
  private handleNotificationUpdate(
    payload: RealtimePostgresChangesPayload<NotificationRow>,
    options: NotificationSubscriptionOptions
  ) {
    try {
      const notificationRow = payload.new as NotificationRow
      const notification = this.transformNotification(notificationRow)

      this.logger.info('Notification updated', {
        notificationId: notification.id,
        isRead: notification.isRead,
        userId: options.userId
      })

      options.onNotification?.(notification)

    } catch (error) {
      this.logger.error('Failed to handle notification update', error as Error)
      options.onError?.(error as Error)
    }
  }

  /**
   * 브라우저 알림 표시
   */
  private showBrowserNotification(notification: NotificationData) {
    if (notification.isRead) {
      return // 읽은 알림은 브라우저 알림 안함
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'medium'
    })

    // 클릭 시 해당 페이지로 이동
    browserNotification.onclick = () => {
      if (notification.actionUrl) {
        window.open(notification.actionUrl, '_blank')
      }
      browserNotification.close()
    }

    // 5초 후 자동 닫기 (urgent가 아닌 경우)
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        browserNotification.close()
      }, 5000)
    }
  }

  /**
   * DB row를 NotificationData로 변환
   */
  private transformNotification(row: NotificationRow): NotificationData {
    return {
      id: row.id,
      title: row.title,
      message: row.message || '',
      type: row.type as NotificationData['type'],
      priority: (row as any).priority || 'medium',
      isRead: row.is_read,
      createdAt: row.created_at,
      expiresAt: (row as any).expires_at || undefined,
      actionUrl: (row as any).action_url || undefined,
      metadata: (row as any).metadata || {}
    }
  }

  /**
   * 사용자의 읽지 않은 알림 수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch('/api/notifications/count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        this.logger.error('Failed to get unread count', undefined, {
          userId,
          statusCode: response.status,
          responseData: errorData
        })
        return 0
      }

      const data = await response.json()
      return data.unread_count || 0
    } catch (error) {
      this.logger.error('Failed to get unread count', error as Error, { userId })
      return 0
    }
  }

  /**
   * 알림을 읽음으로 표시
   */
  async markAsRead(notificationIds: string[]): Promise<void> {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: notificationIds })
      })

      if (!response.ok) {
        const errorData = await response.text()
        this.logger.error('Failed to mark notifications as read', undefined, {
          notificationIds,
          statusCode: response.status,
          responseData: errorData
        })
      }
    } catch (error) {
      this.logger.error('Failed to mark notifications as read', error as Error, {
        notificationIds
      })
    }
  }

  /**
   * 모든 알림을 읽음으로 표시
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        this.logger.error('Failed to mark all notifications as read', undefined, {
          userId,
          statusCode: response.status,
          responseData: errorData
        })
      }
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', error as Error, { userId })
    }
  }

  /**
   * 사용자의 알림 목록 조회
   */
  async getNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      includeRead?: boolean
    } = {}
  ): Promise<NotificationData[]> {
    try {
      const { limit = 20, offset = 0, includeRead = true } = options

      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!includeRead) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) {
        this.logger.error('Failed to get notifications', error as Error, { userId, options })
        return []
      }

      return (data || []).map(this.transformNotification)
    } catch (error) {
      this.logger.error('Failed to get notifications', error as Error, { userId, options })
      return []
    }
  }

  /**
   * 브라우저 알림 권한 요청
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      this.logger.warn('Browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.logger.info('Notification permission requested', { permission })
      return permission
    }

    return Notification.permission
  }

  /**
   * 정리
   */
  cleanup(): void {
    for (const [userId] of this.subscribers) {
      this.unsubscribe(userId)
    }

    this.logger.info('NotificationService cleaned up')
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationService = NotificationService.getInstance()