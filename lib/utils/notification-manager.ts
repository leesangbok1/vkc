/**
 * Notification Management Utility
 * Handles localStorage-based notification system
 */

export interface Notification {
  id: string
  type: 'answer' | 'comment' | 'acceptance' | 'helpful' | 'follow' | 'mention'
  title: string
  message: string
  data: {
    question_id?: string
    answer_id?: string
    user_id?: string
    url?: string
  }
  is_read: boolean
  created_at: string
}

const NOTIFICATIONS_KEY = 'vietkconnect_notifications'

export function getNotifications(): Notification[] {
  try {
    const notificationsStr = localStorage.getItem(NOTIFICATIONS_KEY)
    return notificationsStr ? JSON.parse(notificationsStr) : []
  } catch (error) {
    console.error('Failed to load notifications:', error)
    return []
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>): boolean {
  try {
    const notifications = getNotifications()

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString()
    }

    notifications.unshift(newNotification)

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100)
    }

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
    return true
  } catch (error) {
    console.error('Failed to add notification:', error)
    return false
  }
}

export function markAsRead(notificationId: string): boolean {
  try {
    const notifications = getNotifications()
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    )

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return false
  }
}

export function markAllAsRead(): boolean {
  try {
    const notifications = getNotifications()
    const updated = notifications.map(n => ({ ...n, is_read: true }))

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return false
  }
}

export function deleteNotification(notificationId: string): boolean {
  try {
    const notifications = getNotifications()
    const filtered = notifications.filter(n => n.id !== notificationId)

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return false
  }
}

export function getUnreadCount(): number {
  const notifications = getNotifications()
  return notifications.filter(n => !n.is_read).length
}

export function clearAllNotifications(): boolean {
  try {
    localStorage.removeItem(NOTIFICATIONS_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear notifications:', error)
    return false
  }
}

// Helper function to create notification for answer posted
export function notifyAnswerPosted(questionId: string, questionTitle: string, answererName: string) {
  addNotification({
    type: 'answer',
    title: '새로운 답변이 등록되었습니다',
    message: `${answererName}님이 "${questionTitle}" 질문에 답변했습니다`,
    data: {
      question_id: questionId,
      url: `/questions/${questionId}`
    }
  })
}

// Helper function to create notification for answer accepted
export function notifyAnswerAccepted(questionId: string, answerId: string, questionTitle: string) {
  addNotification({
    type: 'acceptance',
    title: '🎉 답변이 채택되었습니다!',
    message: `"${questionTitle}" 질문에 작성한 답변이 채택되었습니다`,
    data: {
      question_id: questionId,
      answer_id: answerId,
      url: `/questions/${questionId}#answer-${answerId}`
    }
  })
}

// Helper function to create notification for helpful mark
export function notifyHelpfulMark(answerId: string, questionTitle: string) {
  addNotification({
    type: 'helpful',
    title: '답변이 도움이 되었습니다',
    message: `"${questionTitle}" 질문의 답변이 도움이 되었다고 표시되었습니다`,
    data: {
      answer_id: answerId,
      url: `/questions/${answerId.split('_')[0]}`
    }
  })
}

// Helper function to create notification for new follower
export function notifyNewFollower(followerName: string, followerId: string) {
  addNotification({
    type: 'follow',
    title: '새로운 팔로워',
    message: `${followerName}님이 회원님을 팔로우하기 시작했습니다`,
    data: {
      user_id: followerId,
      url: `/users/${followerId}`
    }
  })
}
