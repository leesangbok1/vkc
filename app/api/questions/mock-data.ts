type MockAuthor = {
  id: string
  name: string
  role: string
  avatar_url?: string | null
}

type MockCategory = {
  id: number
  slug: string
  name: string
}

export type MockQuestion = {
  id: string
  title: string
  content: string
  category: MockCategory
  author: MockAuthor
  answer_count: number
  upvote_count: number
  view_count: number
  helpful_count: number
  created_at: string
  updated_at: string
  last_activity_at?: string
  tags: string[]
  metrics?: {
    score: number
    breakdown: Record<string, number>
    recent_answer_count: number
    accepted_answer_count: number
  }
}

export type MockAnswer = {
  id: string
  content: string
  question_id: string
  author_id: string
  is_accepted: boolean
  helpful_count: number
  upvote_count: number
  downvote_count: number
  comment_count?: number
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    avatar_url: string | null
    trust_score: number
    badges: Record<string, unknown>
    visa_type: string | null
    company: string | null
    years_in_korea: number
    region: string | null
    answer_count: number
    helpful_answer_count: number
  }
}

export const mockQuestions: MockQuestion[] = [
  {
    id: 'mock-question-visa',
    title: 'E-7 비자 연장 시 필요한 서류는 무엇인가요?',
    content: '한국에서 E-7 비자를 연장하려면 어떤 서류와 절차가 필요한지 궁금합니다.',
    category: { id: 1, slug: 'visa', name: '한국 비자·체류' },
    author: { id: 'mock-author-1', name: '응우옌 반 민', role: 'verified' },
    answer_count: 3,
    upvote_count: 12,
    view_count: 120,
    helpful_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    tags: ['E-7', '비자', '서류'],
    metrics: {
      score: 0.85,
      breakdown: {
        views: 0.3,
        answers: 0.4,
        accepted: 0.1,
        helpful: 0.05,
        recentAnswers: 0.05,
        recency: 0.05,
        activity: 0.05,
        following: 0.2,
        interest: 0.1,
      },
      recent_answer_count: 1,
      accepted_answer_count: 0,
    },
  },
  {
    id: 'mock-question-employment',
    title: '한국 IT 회사 면접에서 자주 묻는 질문은?',
    content: '다음 주에 IT 회사 면접이 있습니다. 어떤 질문이 나올지 조언 부탁드립니다.',
    category: { id: 2, slug: 'employment', name: '한국 직장생활' },
    author: { id: 'mock-author-2', name: '팜 티 란', role: 'user' },
    answer_count: 2,
    upvote_count: 8,
    view_count: 90,
    helpful_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['면접', '취업', 'IT'],
    metrics: {
      score: 0.74,
      breakdown: {
        views: 0.25,
        answers: 0.35,
        accepted: 0.05,
        helpful: 0.04,
        recentAnswers: 0.04,
        recency: 0.06,
        activity: 0.05,
        following: 0.15,
        interest: 0.1,
      },
      recent_answer_count: 1,
      accepted_answer_count: 0,
    },
  },
  {
    id: 'mock-question-housing',
    title: '서울에서 원룸 구할 때 주의할 점이 있을까요?',
    content: '서울에서 원룸을 구하려고 하는데, 전세/월세 계약 시 주의할 점이 궁금합니다.',
    category: { id: 4, slug: 'housing', name: '한국에서 집 구하기' },
    author: { id: 'mock-author-3', name: '레 반 투안', role: 'user' },
    answer_count: 1,
    upvote_count: 5,
    view_count: 75,
    helpful_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    tags: ['원룸', '전세', '계약'],
    metrics: {
      score: 0.62,
      breakdown: {
        views: 0.2,
        answers: 0.3,
        accepted: 0,
        helpful: 0.03,
        recentAnswers: 0.02,
        recency: 0.05,
        activity: 0.04,
        following: 0.1,
        interest: 0.08,
      },
      recent_answer_count: 0,
      accepted_answer_count: 0,
    },
  },
]

export const isMockModeEnabled = () =>
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')

export function getMockQuestionById(id: string): MockQuestion {
  const found = mockQuestions.find((question) => question.id === id)
  if (found) {
    return found
  }

  const now = new Date().toISOString()
  return {
    id,
    title: '샘플 질문 (Mock)',
    content: '이 항목은 목업 데이터로 제공됩니다. 실제 데이터가 준비되면 자동으로 대체됩니다.',
    category: { id: 0, slug: 'general', name: '일반 문의' },
    author: { id: 'mock-author-generic', name: '커뮤니티 멤버', role: 'user' },
    answer_count: 0,
    upvote_count: 0,
    view_count: 0,
    helpful_count: 0,
    created_at: now,
    updated_at: now,
    last_activity_at: now,
    tags: [],
    metrics: {
      score: 0.3,
      breakdown: {},
      recent_answer_count: 0,
      accepted_answer_count: 0,
    },
  }
}

export function buildMockAnswers(questionId: string): MockAnswer[] {
  return [
    {
      id: 'mock-answer-1',
      content: '비자 연장은 출입국관리소에서 가능합니다. 필요 서류를 미리 준비하세요.',
      question_id: questionId,
      author_id: 'user2',
      is_accepted: true,
      helpful_count: 15,
      upvote_count: 12,
      downvote_count: 0,
      comment_count: 2,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      author: {
        id: 'user2',
        name: '김영수',
        avatar_url: null,
        trust_score: 85,
        badges: {},
        visa_type: 'E-7',
        company: 'LG전자',
        years_in_korea: 3,
        region: null,
        answer_count: 42,
        helpful_answer_count: 18,
      },
    },
    {
      id: 'mock-answer-2',
      content: '공식 사이트에서 최신 안내를 확인하고, 만료 2개월 전에 준비를 시작하는 것이 좋습니다.',
      question_id: questionId,
      author_id: 'user3',
      is_accepted: false,
      helpful_count: 7,
      upvote_count: 5,
      downvote_count: 0,
      comment_count: 0,
      created_at: '2024-01-16T08:30:00Z',
      updated_at: '2024-01-16T08:30:00Z',
      author: {
        id: 'user3',
        name: '이수진',
        avatar_url: null,
        trust_score: 72,
        badges: {},
        visa_type: null,
        company: '현대자동차',
        years_in_korea: 2,
        region: '서울',
        answer_count: 18,
        helpful_answer_count: 9,
      },
    },
  ]
}
