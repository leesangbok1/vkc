import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

type Answer = Database['public']['Tables']['answers']['Row']
type AnswerInsert = Database['public']['Tables']['answers']['Insert']
type AnswerUpdate = Database['public']['Tables']['answers']['Update']

export interface AnswerWithUser extends Answer {
  users: {
    id: string
    name: string | null
    avatar_url: string | null
    role: 'user' | 'admin' | 'moderator'
  }
}

export class AnswersApi {
  private supabase = createClientComponentClient<Database>()

  /**
   * 특정 질문의 답변 목록 조회
   */
  async getByQuestionId(questionId: string) {
    const { data, error } = await this.supabase
      .from('answers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as AnswerWithUser[]
  }

  /**
   * 답변 생성
   */
  async create(answerData: AnswerInsert) {
    const { data, error } = await this.supabase
      .from('answers')
      .insert([answerData])
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .single()

    if (error) throw error

    // 질문의 답변 수 업데이트
    await this.updateQuestionAnswerCount(answerData.question_id)

    return data as AnswerWithUser
  }

  /**
   * 답변 수정
   */
  async update(id: string, updates: AnswerUpdate) {
    const { data, error } = await this.supabase
      .from('answers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .single()

    if (error) throw error
    return data as AnswerWithUser
  }

  /**
   * 답변 삭제
   */
  async delete(id: string) {
    // 먼저 답변 정보를 가져와서 질문 ID를 얻음
    const { data: answer, error: fetchError } = await this.supabase
      .from('answers')
      .select('question_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { error } = await this.supabase
      .from('answers')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 질문의 답변 수 업데이트
    if (answer) {
      await this.updateQuestionAnswerCount(answer.question_id)
    }
  }

  /**
   * 답변 채택
   */
  async acceptAnswer(id: string, questionId: string) {
    // 먼저 해당 질문의 모든 답변을 채택 해제
    await this.supabase
      .from('answers')
      .update({ is_accepted: false })
      .eq('question_id', questionId)

    // 선택된 답변만 채택
    const { data, error } = await this.supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', id)
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .single()

    if (error) throw error
    return data as AnswerWithUser
  }

  /**
   * 사용자별 답변 조회
   */
  async getByUserId(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit

    const { data, error, count } = await this.supabase
      .from('answers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        ),
        questions:question_id (
          id,
          title
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      answers: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  /**
   * 질문의 답변 수 업데이트
   */
  private async updateQuestionAnswerCount(questionId: string) {
    // 현재 답변 수 계산
    const { count, error } = await this.supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId)

    if (error) throw error

    // 질문 테이블 업데이트 (만약 answer_count 컬럼이 있다면)
    // 현재 스키마에는 없지만 추후 추가될 수 있음
    /*
    await this.supabase
      .from('questions')
      .update({ answer_count: count || 0 })
      .eq('id', questionId)
    */
  }
}

// 싱글톤 인스턴스 생성
export const answersApi = new AnswersApi()