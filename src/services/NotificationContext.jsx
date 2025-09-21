import React, { createContext, useContext, useState, useEffect } from 'react'
import { notificationService } from '../services/notification-service.js'
import { useAuth } from './AuthContext'

// 알림 컨텍스트 생성
const NotificationContext = createContext()

// 알림 훅
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// 알림 제공자 컴포넌트
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true
  })

  // 알림 권한 및 설정 초기화
  useEffect(() => {
    const initializeNotifications = async () => {
      const permission = notificationService.isPermissionGranted()
      setIsPermissionGranted(permission)

      const currentSettings = notificationService.getSettings()
      setSettings(currentSettings)
    }

    initializeNotifications()
  }, [])

  // 사용자 로그인 시 알림 구독
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // 사용자 알림 구독
    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.id,
      (userNotifications) => {
        setNotifications(userNotifications)
        const unread = userNotifications.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    )

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [user])

  // 알림 권한 요청
  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission()
      setIsPermissionGranted(granted)
      return granted
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    if (!user) return false

    try {
      const success = await notificationService.markAsRead(notificationId, user.id)
      if (success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return success
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      return false
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!user) return false

    try {
      const success = await notificationService.markAllAsRead(user.id)
      if (success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        )
        setUnreadCount(0)
      }
      return success
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error)
      return false
    }
  }

  // 알림 설정 업데이트
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    notificationService.updateSettings(updatedSettings)
  }

  // 새 알림 생성 (관리자/시스템용)
  const createNotification = async (recipientId, notificationData) => {
    try {
      return await notificationService.createNotification(recipientId, notificationData)
    } catch (error) {
      console.error('알림 생성 실패:', error)
      return null
    }
  }

  // 특정 타입의 알림 필터링
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type)
  }

  // 최근 알림 가져오기
  const getRecentNotifications = (count = 5) => {
    return notifications
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)
  }

  // 컨텍스트 값
  const value = {
    notifications,
    unreadCount,
    isPermissionGranted,
    settings,
    requestPermission,
    markAsRead,
    markAllAsRead,
    updateSettings,
    createNotification,
    getNotificationsByType,
    getRecentNotifications,
    notificationService
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}