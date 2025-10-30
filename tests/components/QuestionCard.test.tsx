import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QuestionCard } from '@/components/questions/QuestionCard'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
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

const actionBarMock = vi.hoisted(() => vi.fn()) as ReturnType<typeof vi.fn>

vi.mock('@/components/common/ActionBar', () => ({
  __esModule: true,
  default: (props: any) => {
    actionBarMock(props)
    return <div data-testid="action-bar" />
  }
}))

vi.mock('@/components/modals/LoginPromptModal', () => ({
  __esModule: true,
  default: () => null
}))

vi.mock('@/components/modals/ReportContentModal', () => ({
  __esModule: true,
  default: () => null
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoading: false,
    isLoggedIn: false,
    user: null,
    checkAuth: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn()
  })
}))

const mockQuestion: any = {
  id: '1',
  title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
  content: '회사에서 E-7 비자 신청을 도와준다고 하는데, 제가 준비해야 할 서류들이 무엇인지 알고 싶습니다.',
  author_id: 'user1',
  category_id: 1,
  tags: ['E-7비자', '서류', '취업'],
  ai_category_confidence: 0.95,
  ai_tags: ['E-7비자', '서류', '취업'],
  urgency: 'high',
  matched_certified_users: [] as string[],
  certified_notifications_sent: false,
  matched_experts: [],
  expert_notifications_sent: false,
  view_count: 45,
  answer_count: 3,
  helpful_count: 8,
  upvote_count: 12,
  downvote_count: 0,
  status: 'open',
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
    admin_yn: 'N' as const,
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
  beforeEach(() => {
    actionBarMock.mockClear()
  })

  const renderCard = (overrides: Partial<typeof mockQuestion> = {}) =>
    render(<QuestionCard question={{ ...mockQuestion, ...overrides }} />)

  it('renders question title and content preview', () => {
    renderCard()

    expect(screen.getByRole('heading', { name: mockQuestion.title })).toBeInTheDocument()
    expect(screen.getByText(/E-7 비자 신청을 도와준다고/)).toBeInTheDocument()
  })

  it('shows author and topic metadata', () => {
    renderCard()

    expect(screen.getByText('레투안')).toBeInTheDocument()
    expect(screen.getByText('비자/법률')).toBeInTheDocument()
    expect(screen.getByText('E-7, 한국 3년차')).toBeInTheDocument()
  })

  it('displays answer statistics', () => {
    renderCard()

    expect(screen.getByText('답변 3개')).toBeInTheDocument()
  })

  it('passes helpful state to ActionBar', () => {
    renderCard()

    expect(actionBarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        targetId: '1',
        targetType: 'question',
        helpfulCount: 8,
      })
    )
  })

  it('renders resolved badge when status is resolved', () => {
    renderCard({ status: 'resolved' })

    expect(screen.getByText('✓ 해결됨')).toBeInTheDocument()
  })

  it('renders pending badge when question is open', () => {
    renderCard({ status: 'open' })

    expect(screen.getByRole('status', { name: '미채택' })).toBeInTheDocument()
  })

  it('handles zero answer count gracefully', () => {
    renderCard({ answer_count: 0 })

    expect(screen.getByText('답변 0개')).toBeInTheDocument()
  })
})
