interface CreateNotificationPayload {
  targetUserId: string
  type: string
  title: string
  message: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  relatedId?: string | null
  relatedType?: string | null
  actionUrl?: string | null
  metadata?: Record<string, unknown>
}

async function createNotification(payload: CreateNotificationPayload) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_user_id: payload.targetUserId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority ?? 'medium',
        related_id: payload.relatedId ?? null,
        related_type: payload.relatedType ?? null,
        action_url: payload.actionUrl ?? null,
        metadata: payload.metadata ?? {}
      })
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)
      throw new Error(errorPayload?.error || 'Failed to create notification')
    }

    return true
  } catch (error) {
    console.error('[notification-manager] createNotification failed:', error)
    return false
  }
}

export async function notifyAnswerAccepted(options: {
  targetUserId: string
  questionId: string
  answerId: string
  questionTitle: string
}) {
  const { targetUserId, questionId, answerId, questionTitle } = options
  return createNotification({
    targetUserId,
    type: 'answer_accepted',
    title: '🎉 답변이 채택되었습니다!',
    message: `"${questionTitle}" 질문에 작성한 답변이 채택되었습니다.`,
    relatedId: answerId,
    relatedType: 'answer',
    actionUrl: `/questions/${questionId}#answer-${answerId}`,
    metadata: {
      questionId,
      answerId,
      questionTitle
    }
  })
}
