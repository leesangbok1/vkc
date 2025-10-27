import { Database } from '@/lib/supabase'
import { createServerLogger } from '@/lib/utils/server-logger'
import { BRAND_NAME } from '@/lib/constants/branding'

type Answer = Database['public']['Tables']['answers']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type User = Database['public']['Tables']['users']['Row']

const logger = createServerLogger('NotificationTriggers', 'system')

interface NotificationData {
  target_user_id: string
  type: string
  title: string
  message: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  related_id?: string
  related_type?: string
  action_url?: string
  metadata?: Record<string, any>
  channels?: string[]
}

class NotificationTriggers {
  private static instance: NotificationTriggers

  static getInstance(): NotificationTriggers {
    if (!NotificationTriggers.instance) {
      NotificationTriggers.instance = new NotificationTriggers()
    }
    return NotificationTriggers.instance
  }

  /**
   * 알림 전송
   */
  private async sendNotification(data: NotificationData): Promise<void> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('Failed to send notification', undefined, {
          action: 'sendNotification',
          statusCode: response.status,
          responseData: errorData,
          notificationData: data
        })
      }
    } catch (error) {
      logger.error('Notification sending error', error as Error, {
        action: 'sendNotification',
        notificationData: data
      })
    }
  }

  /**
   * 질문에 새로운 답변이 달렸을 때
   */
  async onNewAnswer(answer: Answer, question: Question, answerAuthor: User): Promise<void> {
    if (answer.author_id === question.author_id) {
      // 자신의 질문에 자신이 답변한 경우 알림 안함
      return
    }

    await this.sendNotification({
      target_user_id: question.author_id,
      type: 'new_answer',
      title: '새로운 답변이 도착했습니다',
      message: `${answerAuthor.name}님이 "${question.title}" 질문에 답변을 남겼습니다.`,
      priority: 'medium',
      related_id: answer.id,
      related_type: 'answer',
      action_url: `/questions/${question.id}#answer-${answer.id}`,
      metadata: {
        question_id: question.id,
        question_title: question.title,
        answer_author: answerAuthor.name
      },
      channels: ['in_app', 'email']
    })

    logger.info('New answer notification sent', {
      action: 'onNewAnswer',
      questionId: question.id,
      answerId: answer.id,
      targetUserId: question.author_id
    })
  }

  /**
   * 답변이 채택되었을 때
   */
  async onAnswerAccepted(answer: Answer, question: Question, answerAuthor: User): Promise<void> {
    await this.sendNotification({
      target_user_id: answer.author_id,
      type: 'answer_accepted',
      title: '답변이 채택되었습니다! 🎉',
      message: `"${question.title}" 질문에서 회원님의 답변이 채택되었습니다.`,
      priority: 'high',
      related_id: answer.id,
      related_type: 'answer',
      action_url: `/questions/${question.id}#answer-${answer.id}`,
      metadata: {
        question_id: question.id,
        question_title: question.title,
        reputation_reward: 15 // 채택 시 명성 점수
      },
      channels: ['in_app', 'email', 'push']
    })

    logger.info('Answer accepted notification sent', {
      action: 'onAnswerAccepted',
      questionId: question.id,
      answerId: answer.id,
      targetUserId: answer.author_id
    })
  }

  /**
   * 질문에 댓글이 달렸을 때
   */
  async onQuestionComment(comment: Comment, question: Question, commentAuthor: User): Promise<void> {
    if (comment.author_id === question.author_id) {
      // 자신의 질문에 자신이 댓글을 단 경우 알림 안함
      return
    }

    await this.sendNotification({
      target_user_id: question.author_id,
      type: 'question_commented',
      title: '질문에 댓글이 달렸습니다',
      message: `${commentAuthor.name}님이 "${question.title}" 질문에 댓글을 남겼습니다.`,
      priority: 'low',
      related_id: comment.id,
      related_type: 'comment',
      action_url: `/questions/${question.id}#comment-${comment.id}`,
      metadata: {
        question_id: question.id,
        question_title: question.title,
        comment_author: commentAuthor.name
      },
      channels: ['in_app']
    })

    logger.info('Question comment notification sent', {
      action: 'onQuestionComment',
      questionId: question.id,
      commentId: comment.id,
      targetUserId: question.author_id
    })
  }

  /**
   * 답변에 댓글이 달렸을 때
   */
  async onAnswerComment(comment: Comment, answer: Answer, question: Question, commentAuthor: User): Promise<void> {
    if (comment.author_id === answer.author_id) {
      // 자신의 답변에 자신이 댓글을 단 경우 알림 안함
      return
    }

    await this.sendNotification({
      target_user_id: answer.author_id,
      type: 'answer_commented',
      title: '답변에 댓글이 달렸습니다',
      message: `${commentAuthor.name}님이 회원님의 답변에 댓글을 남겼습니다.`,
      priority: 'low',
      related_id: comment.id,
      related_type: 'comment',
      action_url: `/questions/${question.id}#comment-${comment.id}`,
      metadata: {
        question_id: question.id,
        answer_id: answer.id,
        comment_author: commentAuthor.name
      },
      channels: ['in_app']
    })

    logger.info('Answer comment notification sent', {
      action: 'onAnswerComment',
      answerId: answer.id,
      commentId: comment.id,
      targetUserId: answer.author_id
    })
  }

  /**
   * 전문가 매칭 알림
   */
  async onExpertMatched(question: Question, expert: User): Promise<void> {
    await this.sendNotification({
      target_user_id: question.author_id,
      type: 'expert_matched',
      title: '전문가가 매칭되었습니다! 🎓',
      message: `${expert.name} 전문가님이 "${question.title}" 질문에 관심을 보였습니다.`,
      priority: 'high',
      related_id: question.id,
      related_type: 'question',
      action_url: `/questions/${question.id}`,
      metadata: {
        question_id: question.id,
        question_title: question.title,
        expert_name: expert.name,
        expert_specialty: expert.specialty_areas
      },
      channels: ['in_app', 'email', 'push']
    })

    // 전문가에게도 알림
    await this.sendNotification({
      target_user_id: expert.id,
      type: 'question_matched',
      title: '새로운 질문이 매칭되었습니다',
      message: `회원님의 전문 분야와 관련된 질문 "${question.title}"이 있습니다.`,
      priority: 'medium',
      related_id: question.id,
      related_type: 'question',
      action_url: `/questions/${question.id}`,
      metadata: {
        question_id: question.id,
        question_title: question.title
      },
      channels: ['in_app', 'email']
    })

    logger.info('Expert matching notifications sent', {
      action: 'onExpertMatched',
      questionId: question.id,
      expertId: expert.id,
      questionAuthorId: question.author_id
    })
  }

  /**
   * 질문/답변 추천 알림
   */
  async onVoteReceived(targetId: string, targetType: 'question' | 'answer', targetAuthorId: string, voteType: 'up' | 'down', voter: User): Promise<void> {
    if (voter.id === targetAuthorId) {
      // 자신이 자신의 게시물에 투표한 경우 알림 안함
      return
    }

    // 추천만 알림 (비추천은 알림 안함)
    if (voteType !== 'up') {
      return
    }

    const typeText = targetType === 'question' ? '질문' : '답변'

    await this.sendNotification({
      target_user_id: targetAuthorId,
      type: targetType === 'question' ? 'question_upvoted' : 'answer_upvoted',
      title: `${typeText}이 추천되었습니다! 👍`,
      message: `${voter.name}님이 회원님의 ${typeText}을 추천했습니다.`,
      priority: 'low',
      related_id: targetId,
      related_type: targetType,
      action_url: targetType === 'question' ? `/questions/${targetId}` : `/questions/${targetId}#answer-${targetId}`,
      metadata: {
        target_type: targetType,
        voter_name: voter.name,
        reputation_reward: targetType === 'question' ? 5 : 10
      },
      channels: ['in_app']
    })

    logger.info('Vote notification sent', {
      action: 'onVoteReceived',
      targetId,
      targetType,
      voteType,
      targetAuthorId
    })
  }

  /**
   * 멘션 알림
   */
  async onMention(mentionedUserId: string, content: string, contentType: 'question' | 'answer' | 'comment', contentId: string, mentioner: User): Promise<void> {
    if (mentioner.id === mentionedUserId) {
      // 자신을 언급한 경우 알림 안함
      return
    }

    const typeText = contentType === 'question' ? '질문' : contentType === 'answer' ? '답변' : '댓글'

    await this.sendNotification({
      target_user_id: mentionedUserId,
      type: 'mention',
      title: '회원님이 언급되었습니다',
      message: `${mentioner.name}님이 ${typeText}에서 회원님을 언급했습니다.`,
      priority: 'medium',
      related_id: contentId,
      related_type: contentType,
      action_url: contentType === 'question' ? `/questions/${contentId}` : `/questions/${contentId}#${contentType}-${contentId}`,
      metadata: {
        content_type: contentType,
        mentioner_name: mentioner.name,
        content_preview: content.substring(0, 100)
      },
      channels: ['in_app', 'email']
    })

    logger.info('Mention notification sent', {
      action: 'onMention',
      mentionedUserId,
      contentType,
      contentId,
      mentionerId: mentioner.id
    })
  }

  /**
   * 주간 요약 알림
   */
  async sendWeeklyDigest(userId: string, digestData: {
    newQuestions: number
    yourAnswers: number
    acceptedAnswers: number
    reputation: number
    topQuestions: Array<{ id: string; title: string; votes: number }>
  }): Promise<void> {
    await this.sendNotification({
      target_user_id: userId,
      type: 'weekly_digest',
      title: `이번 주 ${BRAND_NAME} 활동 요약 📊`,
      message: `이번 주에 ${digestData.newQuestions}개의 새로운 질문이 있었고, 회원님의 답변 ${digestData.acceptedAnswers}개가 채택되었습니다.`,
      priority: 'low',
      action_url: '/dashboard',
      metadata: digestData,
      channels: ['email']
    })

    logger.info('Weekly digest sent', {
      action: 'sendWeeklyDigest',
      userId,
      digestData
    })
  }

  /**
   * 시스템 공지사항
   */
  async sendSystemAnnouncement(userIds: string[], title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<void> {
    const promises = userIds.map(userId =>
      this.sendNotification({
        target_user_id: userId,
        type: 'system_announcement',
        title,
        message,
        priority,
        action_url: '/announcements',
        channels: priority === 'urgent' ? ['in_app', 'email', 'push'] : ['in_app', 'email']
      })
    )

    await Promise.all(promises)

    logger.info('System announcement sent', {
      action: 'sendSystemAnnouncement',
      userCount: userIds.length,
      priority
    })
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationTriggers = NotificationTriggers.getInstance()

// 편의 함수들
export const triggerNewAnswerNotification = notificationTriggers.onNewAnswer.bind(notificationTriggers)
export const triggerAnswerAcceptedNotification = notificationTriggers.onAnswerAccepted.bind(notificationTriggers)
export const triggerQuestionCommentNotification = notificationTriggers.onQuestionComment.bind(notificationTriggers)
export const triggerAnswerCommentNotification = notificationTriggers.onAnswerComment.bind(notificationTriggers)
export const triggerExpertMatchedNotification = notificationTriggers.onExpertMatched.bind(notificationTriggers)
export const triggerVoteNotification = notificationTriggers.onVoteReceived.bind(notificationTriggers)
export const triggerMentionNotification = notificationTriggers.onMention.bind(notificationTriggers)
export const sendWeeklyDigest = notificationTriggers.sendWeeklyDigest.bind(notificationTriggers)
export const sendSystemAnnouncement = notificationTriggers.sendSystemAnnouncement.bind(notificationTriggers)
