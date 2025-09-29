import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']
type Answer = Database['public']['Tables']['answers']['Row']
type AnswerInsert = Database['public']['Tables']['answers']['Insert']

export interface QuestionWithDetails extends Question {
  users: {
    id: string
    name: string | null
    avatar_url: string | null
    role: 'user' | 'admin' | 'moderator'
  }
  answers?: AnswerWithUser[]
  answer_count: number
  vote_count: number
}

export interface AnswerWithUser extends Answer {
  users: {
    id: string
    name: string | null
    avatar_url: string | null
    role: 'user' | 'admin' | 'moderator'
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  sortBy?: 'created_at' | 'view_count' | 'vote_count'
  sortOrder?: 'asc' | 'desc'
}

export class QuestionsApi {
  private supabase = createClientComponentClient<Database>()

  /**
   * 질문 목록 조회 (페이지네이션 지원)
   */
  async getAll(params: PaginationParams = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    let query = this.supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `, { count: 'exact' })

    // 검색 필터
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // 카테고리 필터
    if (category) {
      query = query.eq('category', category)
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      questions: data as QuestionWithDetails[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  /**
   * 질문 상세 조회 (답변 포함)
   */
  async getById(id: string) {
    const { data: question, error: questionError } = await this.supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .eq('id', id)
      .single()

    if (questionError) throw questionError
    if (!question) return null

    // 답변 조회
    const { data: answers, error: answersError } = await this.supabase
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
      .eq('question_id', id)
      .order('created_at', { ascending: true })

    if (answersError) throw answersError

    return {
      ...question,
      answers: answers as AnswerWithUser[],
      answer_count: answers?.length || 0,
      vote_count: 0 // TODO: 추후 투표 시스템 구현 시 계산
    } as QuestionWithDetails
  }

  /**
   * 질문 생성
   */
  async create(questionData: QuestionInsert) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert([questionData])
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
    return data as QuestionWithDetails
  }

  /**
   * 질문 수정
   */
  async update(id: string, updates: QuestionUpdate) {
    const { data, error } = await this.supabase
      .from('questions')
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
    return data as QuestionWithDetails
  }

  /**
   * 질문 삭제
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string) {
    const { error } = await this.supabase.rpc('increment_view_count', {
      question_id: id
    })

    if (error) {
      // RPC 함수가 없는 경우 직접 업데이트
      const { data: question } = await this.supabase
        .from('questions')
        .select('view_count')
        .eq('id', id)
        .single()

      if (question) {
        await this.supabase
          .from('questions')
          .update({ view_count: question.view_count + 1 })
          .eq('id', id)
      }
    }
  }

  /**
   * 홈페이지용 최신 질문 조회
   */
  async getRecentQuestions(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as QuestionWithDetails[]
  }

  /**
   * 인기 질문 조회 (조회수 기준)
   */
  async getTrendingQuestions(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as QuestionWithDetails[]
  }

  /**
   * 사용자별 질문 조회
   */
  async getByUserId(userId: string, params: PaginationParams = {}) {
    const { page = 1, limit = 10 } = params

    let query = this.supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      questions: data as QuestionWithDetails[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

// 싱글톤 인스턴스 생성
export const questionsApi = new QuestionsApi()