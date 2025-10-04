import { createSupabaseServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// 알림 타입 정의
export enum NotificationType {
  NEW_ANSWER = 'new_answer',
  NEW_COMMENT = 'new_comment',
  ANSWER_ACCEPTED = 'answer_accepted',
  QUESTION_LIKED = 'question_liked',
  ANSWER_LIKED = 'answer_liked',
  COMMENT_LIKED = 'comment_liked',
  MENTION = 'mention',
  EXPERT_MATCH = 'expert_match',
  QUESTION_FEATURED = 'question_featured'
}

interface NotificationData {
  userId: string
  fromUserId: string
  type: NotificationType
  title: string
  message: string
  questionId?: string
  answerId?: string
  commentId?: string
  metadata?: Record<string, any>
}

export class NotificationService {
  private supabase = await createSupabaseServerClient()

  // 새 답변 알림
  async notifyNewAnswer(questionId: string, answerId: string, answerAuthorId: string) {
    try {
      // 질문 작성자 정보 조회
      const { data: question, error: questionError } = await this.supabase
        .from('questions')
        .select(`
          *,
          author:users!questions_author_id_fkey(
            id,
            display_name
          )
        `)
        .eq('id', questionId)
        .single()

      if (questionError || !question) {
        console.error('질문 조회 오류:', questionError)
        return
      }

      // 답변 작성자 정보 조회
      const { data: answerAuthor, error: authorError } = await this.supabase
        .from('users').select('display_name').eq('id', answerAuthorId).single() as any

      if (authorError || !answerAuthor) {
        console.error('답변 작성자 조회 오류:', authorError)
        return
      }

      // 질문 작성자에게 알림 전송 (자기 자신 제외)
      if (question.author_id !== answerAuthorId) {
        await this.createNotification({
          userId: question.author_id,
          fromUserId: answerAuthorId,
          type: NotificationType.NEW_ANSWER,
          title: '새로운 답변이 등록되었습니다',
          message: `${answerAuthor.display_name}님이 "${question.title}" 질문에 답변을 남겼습니다.`,
          questionId,
          answerId,
          metadata: {
            questionTitle: question.title,
            answerAuthorName: answerAuthor.display_name
          }
        })
      }

      // 같은 질문에 답변한 다른 사용자들에게도 알림
      await this.notifyOtherAnswerers(questionId, answerId, answerAuthorId, question.title)

    } catch (error) {
      console.error('새 답변 알림 오류:', error)
    }
  }

  // 같은 질문의 다른 답변자들에게 알림
  private async notifyOtherAnswerers(questionId: string, newAnswerId: string, newAnswerAuthorId: string, questionTitle: string) {
    try {
      // 같은 질문의 다른 답변자들 조회
      const { data: otherAnswers, error } = await this.supabase
        .from('answers')
        .select(`
          author_id,
          author:users!answers_author_id_fkey(
            display_name
          )
        `)
        .eq('question_id', questionId)
        .neq('id', newAnswerId)
        .neq('author_id', newAnswerAuthorId)

      if (error || !otherAnswers) return

      // 중복 제거
      const uniqueAnswerers = Array.from(
        new Map(otherAnswers.map(answer => [answer.author_id, answer])).values()
      )

      // 새 답변 작성자 이름 조회
      const { data: newAnswerAuthor } = await this.supabase
        .from('users').select('display_name').eq('id', newAnswerAuthorId).single() as any

      const newAnswerAuthorName = newAnswerAuthor?.display_name || '사용자'

      // 각 답변자에게 알림 전송
      for (const answerer of uniqueAnswerers) {
        await this.createNotification({
          userId: answerer.author_id,
          fromUserId: newAnswerAuthorId,
          type: NotificationType.NEW_ANSWER,
          title: '새로운 답변이 추가되었습니다',
          message: `${newAnswerAuthorName}님이 "${questionTitle}" 질문에 새로운 답변을 추가했습니다.`,
          questionId,
          answerId: newAnswerId,
          metadata: {
            questionTitle,
            answerAuthorName: newAnswerAuthorName
          }
        })
      }

    } catch (error) {
      console.error('다른 답변자 알림 오류:', error)
    }
  }

  // 새 댓글 알림
  async notifyNewComment(questionId: string, answerId: string | null, commentAuthorId: string, commentContent: string) {
    try {
      let targetUserId: string
      let title: string
      let message: string
      let questionTitle = ''

      if (answerId) {
        // 답변에 대한 댓글
        const { data: answer, error } = await this.supabase
          .from('answers')
          .select(`
            author_id,
            question:questions(
              title
            )
          `)
          .eq('id', answerId)
          .single()

        if (error || !answer) return

        targetUserId = answer.author_id
        questionTitle = answer.question?.title || ''
        title = '답변에 새 댓글이 달렸습니다'
        message = `"${questionTitle}" 질문의 답변에 새로운 댓글이 달렸습니다.`
      } else {
        // 질문에 대한 댓글
        const { data: question, error } = await this.supabase
          .from('questions').select('author_id, title').eq('id', questionId).single() as any

        if (error || !question) return

        targetUserId = question.author_id
        questionTitle = question.title
        title = '질문에 새 댓글이 달렸습니다'
        message = `"${questionTitle}" 질문에 새로운 댓글이 달렸습니다.`
      }

      // 댓글 작성자가 대상 사용자와 같지 않을 때만 알림
      if (targetUserId !== commentAuthorId) {
        await this.createNotification({
          userId: targetUserId,
          fromUserId: commentAuthorId,
          type: NotificationType.NEW_COMMENT,
          title,
          message,
          questionId,
          answerId,
          metadata: {
            questionTitle,
            commentContent: commentContent.substring(0, 100)
          }
        })
      }

    } catch (error) {
      console.error('새 댓글 알림 오류:', error)
    }
  }

  // 답변 채택 알림
  async notifyAnswerAccepted(questionId: string, answerId: string, questionAuthorId: string) {
    try {
      const { data: answer, error } = await this.supabase
        .from('answers')
        .select(`
          author_id,
          question:questions(
            title
          )
        `)
        .eq('id', answerId)
        .single()

      if (error || !answer) return

      // 답변 작성자에게 알림 (질문 작성자와 다를 때만)
      if (answer.author_id !== questionAuthorId) {
        await this.createNotification({
          userId: answer.author_id,
          fromUserId: questionAuthorId,
          type: NotificationType.ANSWER_ACCEPTED,
          title: '답변이 채택되었습니다! 🎉',
          message: `"${answer.question?.title}" 질문에 대한 답변이 채택되었습니다.`,
          questionId,
          answerId,
          metadata: {
            questionTitle: answer.question?.title
          }
        })
      }

    } catch (error) {
      console.error('답변 채택 알림 오류:', error)
    }
  }

  // 추천/좋아요 알림
  async notifyLike(targetType: 'question' | 'answer' | 'comment', targetId: string, likerUserId: string) {
    try {
      let targetUserId: string
      let title: string
      let message: string
      let questionId: string | undefined
      let answerId: string | undefined
      let commentId: string | undefined

      if (targetType === 'question') {
        const { data: question, error } = await this.supabase
          .from('questions').select('author_id, title').eq('id', targetId).single() as any

        if (error || !question) return

        targetUserId = question.author_id
        questionId = targetId
        title = '질문에 추천을 받았습니다 👍'
        message = `"${question.title}" 질문에 추천을 받았습니다.`

      } else if (targetType === 'answer') {
        const { data: answer, error } = await this.supabase
          .from('answers')
          .select(`
            author_id,
            question_id,
            question:questions(title)
          `)
          .eq('id', targetId)
          .single()

        if (error || !answer) return

        targetUserId = answer.author_id
        questionId = answer.question_id
        answerId = targetId
        title = '답변에 추천을 받았습니다 👍'
        message = `"${answer.question?.title}" 질문의 답변에 추천을 받았습니다.`

      } else { // comment
        const { data: comment, error } = await this.supabase
          .from('comments')
          .select(`
            author_id,
            question_id,
            answer_id,
            question:questions(title)
          `)
          .eq('id', targetId)
          .single()

        if (error || !comment) return

        targetUserId = comment.author_id
        questionId = comment.question_id
        answerId = comment.answer_id || undefined
        commentId = targetId
        title = '댓글에 추천을 받았습니다 👍'
        message = `"${comment.question?.title}" 질문의 댓글에 추천을 받았습니다.`
      }

      // 본인이 아닐 때만 알림
      if (targetUserId !== likerUserId) {
        await this.createNotification({
          userId: targetUserId,
          fromUserId: likerUserId,
          type: targetType === 'question' ? NotificationType.QUESTION_LIKED :
                targetType === 'answer' ? NotificationType.ANSWER_LIKED :
                NotificationType.COMMENT_LIKED,
          title,
          message,
          questionId,
          answerId,
          commentId
        })
      }

    } catch (error) {
      console.error('추천 알림 오류:', error)
    }
  }

  // AI 전문가 매칭 알림
  async notifyExpertMatch(questionId: string, userId: string, expertScore: number, matchReason: string) {
    try {
      const { data: question, error } = await this.supabase
        .from('questions').select('title').eq('id', questionId).single() as any

      if (error || !question) return

      await this.createNotification({
        userId,
        fromUserId: 'system', // 시스템 알림
        type: NotificationType.EXPERT_MATCH,
        title: '전문가로 매칭되었습니다! 🔍',
        message: `"${question.title}" 질문에 대한 전문가로 매칭되었습니다. (매칭도: ${Math.round(expertScore * 100)}%)`,
        questionId,
        metadata: {
          questionTitle: question.title,
          expertScore,
          matchReason
        }
      })

    } catch (error) {
      console.error('전문가 매칭 알림 오류:', error)
    }
  }

  // 핵심 알림 생성 메서드
  private async createNotification(data: NotificationData) {
    try {
      // Supabase에 알림 저장 (새로운 스키마에 맞춰 수정)
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: {
            fromUserId: data.fromUserId,
            questionId: data.questionId,
            answerId: data.answerId,
            commentId: data.commentId,
            ...data.metadata
          },
          created_by: data.fromUserId
        })
        .select()
        .single()

      if (error) {
        console.error('알림 저장 오류:', error)
        return
      }

      // Firebase 실시간 알림 전송
      await this.sendRealtimeNotification(notification)

      return notification

    } catch (error) {
      console.error('알림 생성 오류:', error)
    }
  }

  // Firebase 실시간 알림 전송
  private async sendRealtimeNotification(notification: any) {
    try {
      const firebase = await import('@/src/api/firebase.js')

      await firebase.addNotification(notification.user_id, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        from_user: notification.from_user,
        question: notification.question,
        created_at: notification.created_at,
        read: false,
        metadata: notification.metadata
      })

    } catch (error) {
      console.error('실시간 알림 전송 오류:', error)
    }
  }
}

// 싱글톤 인스턴스 생성
export const notificationService = new NotificationService()

// 편의 함수들
export const notify = {
  newAnswer: (questionId: string, answerId: string, answerAuthorId: string) =>
    notificationService.notifyNewAnswer(questionId, answerId, answerAuthorId),

  newComment: (questionId: string, answerId: string | null, commentAuthorId: string, commentContent: string) =>
    notificationService.notifyNewComment(questionId, answerId, commentAuthorId, commentContent),

  answerAccepted: (questionId: string, answerId: string, questionAuthorId: string) =>
    notificationService.notifyAnswerAccepted(questionId, answerId, questionAuthorId),

  like: (targetType: 'question' | 'answer' | 'comment', targetId: string, likerUserId: string) =>
    notificationService.notifyLike(targetType, targetId, likerUserId),

  expertMatch: (questionId: string, userId: string, expertScore: number, matchReason: string) =>
    notificationService.notifyExpertMatch(questionId, userId, expertScore, matchReason)
}