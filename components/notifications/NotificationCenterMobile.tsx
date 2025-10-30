'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Settings } from 'lucide-react'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { notificationService, NotificationData } from '@/lib/services/notification-service'
import { Button } from '@/components/ui/button'
import { useErrorLogger } from '@/lib/utils/error-logger'
import { cn } from '@/lib/utils'

interface NotificationCenterMobileProps {
  className?: string
}

export default function NotificationCenterMobile({ className }: NotificationCenterMobileProps) {
  const { user } = useSafeAuth()
  const logger = useErrorLogger('NotificationCenterMobile', 'ui')

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<NotificationPermission>('default')

  // 알림 구독 및 초기 데이터 로드
  useEffect(() => {
    if (!user) return

    let unsubscribe: (() => void) | null = null

    const initializeNotifications = async () => {
      try {
        setLoading(true)

        // 브라우저 알림 권한 확인
        const permission = await notificationService.requestNotificationPermission()
        setHasPermission(permission)

        // 초기 알림 목록 로드
        const initialNotifications = await notificationService.getNotifications(user.id, {
          limit: 50,
          includeRead: false
        })
        setNotifications(initialNotifications)

        // 읽지 않은 알림 수 로드
        const count = await notificationService.getUnreadCount(user.id)
        setUnreadCount(count)

        // 실시간 구독 설정
        unsubscribe = notificationService.subscribe({
          userId: user.id,
          onNotification: (notification) => {
            setNotifications(prev => [notification, ...prev])
            if (!notification.isRead) {
              setUnreadCount(prev => prev + 1)
            }
            setError(null)
          },
          onError: (error) => {
            logger.error('Notification subscription error', error)
            setError('실시간 알림 연결에 문제가 발생했습니다.')
          },
          onConnect: () => {
            setError(null)
            logger.info('Notification real-time connection established')
          },
          onDisconnect: () => {
            setError('알림 연결이 끊어졌습니다. 새로고침해주세요.')
          }
        })

      } catch (error) {
        logger.error('Failed to initialize notifications', error as Error)
        setError('알림을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializeNotifications()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, logger])

  // 알림을 읽음으로 표시
  const markAsRead = async (notificationIds: string[]) => {
    try {
      await notificationService.markAsRead(notificationIds)
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      )
      // Count only notifications that were actually unread
      const unreadBeingMarked = notifications.filter(n =>
        notificationIds.includes(n.id) && !n.isRead
      ).length
      setUnreadCount(prev => Math.max(0, prev - unreadBeingMarked))
      setError(null)
    } catch (error) {
      logger.error('Failed to mark notifications as read', error as Error)
      setError('알림을 읽음으로 표시하는 중 오류가 발생했습니다.')
    }
  }

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    if (!user) return

    try {
      setActionLoading('markAll')
      await notificationService.markAllAsRead(user.id)
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
      setError(null)
    } catch (error) {
      logger.error('Failed to mark all notifications as read', error as Error)
      setError('모든 알림을 읽음으로 표시하는 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'question':
        return '❓'
      case 'answer':
        return '💬'
      case 'comment':
        return '💭'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '📢'
    }
  }

  // 알림 우선순위별 스타일
  const getPriorityStyle = (priority: NotificationData['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50'
      default:
        return 'border-l-4 border-gray-300 bg-gray-50'
    }
  }

  // 상대 시간 포맷
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  if (!user) return null

  return (
    <div className={cn('relative', className)}>
      {/* 알림 벨 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`알림 ${unreadCount}개`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* 모바일 전체화면 오버레이 & 데스크톱 드롭다운 */}
      {isOpen && (
        <>
          {/* 모바일 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* 알림 패널 */}
          <div className={cn(
            // 모바일: 전체화면 하단 슬라이드업
            "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-2xl",
            "transform transition-transform duration-300 ease-out",
            "md:absolute md:right-0 md:top-full md:mt-2 md:w-96 md:left-auto md:bottom-auto",
            "md:rounded-lg md:shadow-lg md:transform-none",
            "max-h-[80vh] md:max-h-96",
            "flex flex-col"
          )}>
            {/* 모바일 드래그 핸들 */}
            <div className="md:hidden flex justify-center py-2 bg-gray-50 rounded-t-xl">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 md:p-4 border-b border-gray-200 bg-gray-50 md:bg-white flex-shrink-0">
              <h3 className="font-semibold text-gray-900 text-lg md:text-base">알림</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading || actionLoading === 'markAll'}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    {actionLoading === 'markAll' ? '처리중...' : '모두 읽음'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 ml-2 p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* 브라우저 알림 권한 요청 */}
            {hasPermission === 'default' && (
              <div className="p-4 bg-blue-50 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">브라우저 알림을 받으시겠습니까?</p>
                    <p className="text-xs text-blue-600 mt-1">
                      중요한 업데이트를 놓치지 마세요!
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const permission = await notificationService.requestNotificationPermission()
                        setHasPermission(permission)
                      } catch (error) {
                        logger.error('Failed to request notification permission', error as Error)
                        setError('브라우저 알림 권한 요청에 실패했습니다.')
                      }
                    }}
                    className="ml-2"
                  >
                    허용
                  </Button>
                </div>
              </div>
            )}

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">알림을 불러오는 중...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 md:p-8 text-center">
                  <Bell className="h-12 w-12 md:h-8 md:w-8 text-gray-400 mx-auto mb-4 md:mb-2" />
                  <p className="text-base md:text-sm text-gray-500">새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                        'active:bg-gray-100 md:active:bg-gray-50 touch-manipulation',
                        !notification.isRead && 'bg-blue-50',
                        getPriorityStyle(notification.priority)
                      )}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead([notification.id])
                        }
                        if (notification.actionUrl) {
                          setIsOpen(false) // 모바일에서 링크 클릭 시 패널 닫기
                          window.open(notification.actionUrl, '_blank')
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-xl md:text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className={cn(
                              'text-base md:text-sm font-medium pr-2 leading-tight',
                              notification.isRead ? 'text-gray-700' : 'text-gray-900'
                            )}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className={cn(
                            'text-sm leading-relaxed',
                            notification.isRead ? 'text-gray-500' : 'text-gray-700'
                          )}>
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <div className="flex items-center justify-between mt-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                새 알림
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead([notification.id])
                                }}
                                disabled={loading}
                                className="text-xs h-8 md:h-6 px-3"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                읽음
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            {notifications.length > 0 && (
              <div className="p-4 md:p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 h-10 md:h-8"
                  onClick={() => {
                    setIsOpen(false)
                    const returnTo = typeof window !== 'undefined'
                      ? `${window.location.pathname}${window.location.search}`
                      : '/'
                    window.location.href = `/settings/notifications?returnTo=${encodeURIComponent(returnTo)}`
                  }}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  알림 설정
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
