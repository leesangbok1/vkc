import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QuestionCard } from '@/components/questions/QuestionCard'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>
}))

vi.mock('@/components/trust/TrustBadge', () => ({
  default: ({ user }: { user: any }) => <span data-testid="trust-badge">신뢰도: {user.trust_score}</span>
}))

vi.mock('@/components/trust/VisaTypeDisplay', () => ({
  default: ({ visaType }: { visaType: string }) => <span data-testid="visa-type">{visaType}</span>
}))

vi.mock('@/components/trust/SpecialtyTags', () => ({
  default: ({ specialties }: { specialties: string[] }) => (
    <div data-testid="specialty-tags">
      {specialties.map((tag, index) => <span key={index}>{tag}</span>)}
    </div>
  )
}))

vi.mock('lucide-react', () => ({
  MessageCircle: () => <span>💬</span>,
  User: () => <span>👤</span>,
  Clock: () => <span>🕐</span>,
  ChevronUp: () => <span>↑</span>
}))

const mockQuestion = {
  id: '1',
  title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
  content: '회사에서 E-7 비자 신청을 도와준다고 하는데, 제가 준비해야 할 서류들이 무엇인지 알고 싶습니다.',
  author_id: 'user1',
  category_id: 1,
  tags: ['E-7비자', '서류', '취업'],
  ai_category_confidence: 0.95,
  ai_tags: ['E-7비자', '서류', '취업'],
  urgency: 'high',
  matched_experts: [],
  expert_notifications_sent: false,
  view_count: 45,
  answer_count: 3,
  helpful_count: 8,
  upvote_count: 12,
  downvote_count: 0,
  status: 'open' as const,
  is_pinned: false,
  is_featured: false,
  is_reported: false,
  is_approved: true,
  moderated_by: null,
  moderated_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  last_activity_at: '2024-01-15T10:00:00Z',
  resolved_at: null,
  search_vector: null,
  author: {
    id: 'user1',
    email: 'test@example.com',
    name: '레투안',
    avatar_url: null,
    bio: null,
    provider: null,
    provider_id: null,
    role: 'user' as const,
    verification_status: 'approved' as const,
    verification_type: 'work' as const,
    visa_type: 'E-7',
    company: 'Tech Corp',
    years_in_korea: 3,
    region: '서울',
    specialty_areas: ['기술', '개발'],
    preferred_language: 'ko',
    verified_at: '2024-01-01T00:00:00Z',
    verification_expires_at: '2025-01-01T00:00:00Z',
    is_verified: true,
    verification_date: '2024-01-01T00:00:00Z',
    trust_score: 324,
    badges: {
      verified: true,
      expert: false,
      helpful: true
    },
    question_count: 5,
    answer_count: 12,
    helpful_answer_count: 8,
    last_active: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  category: {
    id: 1,
    name: '비자/법률',
    slug: 'visa',
    description: '비자 및 법률 관련 질문',
    icon: '🛂',
    color: '#3B82F6',
    parent_id: null,
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
}

describe('QuestionCard Component', () => {
  it('should render question title and content preview', () => {
    render(<QuestionCard question={mockQuestion} />)

    expect(screen.getByText('E-7 비자 신청 시 필요한 서류가 궁금합니다')).toBeInTheDocument()
    expect(screen.getByText(/회사에서 E-7 비자 신청을 도와준다고/)).toBeInTheDocument()
  })

  it('should display author information', () => {
    render(<QuestionCard question={mockQuestion} />)

    expect(screen.getByText('레투안')).toBeInTheDocument()
    expect(screen.getByTestId('trust-badge')).toBeInTheDocument()
    expect(screen.getByText('신뢰도: 324')).toBeInTheDocument()
  })

  it('should show category and tags', () => {
    render(<QuestionCard question={mockQuestion} />)

    expect(screen.getByText('🛂')).toBeInTheDocument()
    expect(screen.getByText('비자/법률')).toBeInTheDocument()
    expect(screen.getByTestId('specialty-tags')).toBeInTheDocument()
    expect(screen.getByText('E-7비자')).toBeInTheDocument()
  })

  it('should display vote count and answer count', () => {
    render(<QuestionCard question={mockQuestion} />)

    expect(screen.getByText('+12')).toBeInTheDocument() // upvote count with +
    expect(screen.getByText('3')).toBeInTheDocument() // answer count
  })

  it('should show urgency indicator for high priority questions', () => {
    const urgentQuestion = { ...mockQuestion, urgency: 'high' as const }
    render(<QuestionCard question={urgentQuestion} />)

    expect(screen.getByText('높음')).toBeInTheDocument()
  })

  it('should not show urgency indicator for normal priority', () => {
    const normalQuestion = { ...mockQuestion, urgency: 'normal' as const }
    render(<QuestionCard question={normalQuestion} />)

    expect(screen.queryByText('높음')).not.toBeInTheDocument()
  })

  it('should display resolved status', () => {
    const resolvedQuestion = { ...mockQuestion, status: 'resolved' as const }
    render(<QuestionCard question={resolvedQuestion} />)

    expect(screen.getByText('✓ 해결됨')).toBeInTheDocument()
  })

  it('should show relative time', () => {
    render(<QuestionCard question={mockQuestion} />)

    // time 요소가 있는지 확인 (아이콘 대신 실제 시간 표시)
    const timeElement = screen.getByRole('time')
    expect(timeElement).toBeInTheDocument()
  })

  it('should be clickable and link to question detail', () => {
    render(<QuestionCard question={mockQuestion} />)

    const titleLink = screen.getByRole('link', { name: mockQuestion.title })
    expect(titleLink).toHaveAttribute('href', '/questions/1')
  })

  it('should handle questions without tags', () => {
    const questionWithoutTags = { ...mockQuestion, tags: [] }
    render(<QuestionCard question={questionWithoutTags} />)

    expect(screen.queryByTestId('specialty-tags')).not.toBeInTheDocument()
  })

  it('should handle long content with truncation', () => {
    const longContent = 'a'.repeat(500)
    const questionWithLongContent = { ...mockQuestion, content: longContent }
    render(<QuestionCard question={questionWithLongContent} />)

    const contentElement = screen.getByText(/aaa/)
    expect(contentElement).toBeInTheDocument()
  })

  it('should show author initial avatar', () => {
    render(<QuestionCard question={mockQuestion} />)

    // 이제 Avatar 컴포넌트 대신 이니셜을 보여주는 div가 있는지 확인
    const avatarInitial = screen.getByText('레'.charAt(0).toUpperCase())
    expect(avatarInitial).toBeInTheDocument()
    // Check the actual structure - it seems to be in a flex container
    expect(avatarInitial.closest('.flex')).toBeInTheDocument()
  })

  it('should handle zero vote and answer counts', () => {
    const newQuestion = {
      ...mockQuestion,
      upvote_count: 0,
      answer_count: 0
    }
    render(<QuestionCard question={newQuestion} />)

    // Vote score 영역에서 0 찾기
    const voteScore = screen.getByRole('status', { name: /총 투표 점수/ })
    expect(voteScore).toHaveTextContent('0')

    // Answer count 영역에서 0 찾기
    const answerCount = screen.getByRole('status', { name: /답변 수/ })
    expect(answerCount).toHaveTextContent('0')
  })
})