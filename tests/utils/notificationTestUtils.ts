import { vi } from 'vitest'
import type { NotificationData } from '@/lib/services/notification-service'
import type { NotificationPriority } from '@/lib/services/notification-preferences'

export interface SerializedNotificationFixture {
  id: string
  user_id: string
  type: NotificationData['type']
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_id: string | null
  related_type: string | null
  channels: string[]
  priority: NotificationPriority
  action_url: string | null
  metadata: Record<string, unknown>
}

const BASE_SERIALIZED_NOTIFICATIONS: SerializedNotificationFixture[] = [
  {
    id: 'notif-1',
    user_id: 'user-test',
    type: 'answer',
    title: '새로운 답변이 도착했습니다',
    message: 'Certified User가 남긴 답변을 확인해보세요.',
    is_read: false,
    created_at: '2024-10-25T09:00:00.000Z',
    related_id: 'answer-1',
    related_type: 'answer',
    channels: ['in_app', 'email'],
    priority: 'high',
    action_url: '/questions/question-1#answer-answer-1',
    metadata: {
      question_id: 'question-1',
      answer_id: 'answer-1'
    }
  },
  {
    id: 'notif-2',
    user_id: 'user-test',
    type: 'info',
    title: '주간 요약이 도착했습니다',
    message: '이번 주 활동 요약을 확인해보세요.',
    is_read: true,
    created_at: '2024-10-24T15:30:00.000Z',
    related_id: null,
    related_type: null,
    channels: ['in_app'],
    priority: 'low',
    action_url: null,
    metadata: {}
  }
]

export const createSerializedNotifications = (): SerializedNotificationFixture[] =>
  BASE_SERIALIZED_NOTIFICATIONS.map((notification) => ({
    ...notification,
    channels: [...notification.channels],
    metadata: { ...notification.metadata }
  }))

export const convertToClientNotification = (
  notification: SerializedNotificationFixture
): NotificationData => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  priority: notification.priority,
  isRead: notification.is_read,
  createdAt: notification.created_at,
  actionUrl: notification.action_url ?? undefined,
  metadata: { ...notification.metadata }
})

export const createClientNotifications = (): NotificationData[] =>
  createSerializedNotifications().map(convertToClientNotification)

export const createNotificationServiceMock = (options?: {
  notifications?: NotificationData[]
  unreadCount?: number
}) => {
  const notifications = options?.notifications ?? createClientNotifications()
  const unreadCount =
    options?.unreadCount ?? notifications.filter((notification) => !notification.isRead).length

  return {
    getNotifications: vi.fn().mockResolvedValue(notifications),
    getUnreadCount: vi.fn().mockResolvedValue(unreadCount),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    unsubscribe: vi.fn(),
    requestNotificationPermission: vi.fn().mockResolvedValue<'granted'>('granted'),
    setClientPreferences: vi.fn(),
    resetPreferenceCache: vi.fn(),
    showBrowserNotification: vi.fn()
  }
}
