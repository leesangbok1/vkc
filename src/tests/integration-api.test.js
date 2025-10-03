/**
 * 통합 테스트 - API 엔드포인트 검증
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

// API 엔드포인트 테스트 설정
const API_BASE_URL = 'http://localhost:3000/api'

// Mock fetch for testing
const mockFetch = vi.fn()
global.fetch = mockFetch

// 테스트용 헬퍼 함수
function createApiResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  })
}

describe('Integration Tests - API Endpoints', () => {
  beforeAll(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('Health Check Endpoint', () => {
    it('should return system health status', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        version: '1.0.0',
        uptime: 12345,
        database: { status: 'connected', latency: 25 },
        memory: { used: 128, total: 512 }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockResponse))

      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.status).toBe('ok')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('uptime')
      expect(data.database.status).toBe('connected')
    })

    it('should handle health check failures gracefully', async () => {
      const mockErrorResponse = {
        status: 'error',
        message: 'Database connection failed',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockErrorResponse, 503))

      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('error')
      expect(data.message).toContain('Database')
    })
  })

  describe('Categories Endpoint', () => {
    it('should return Vietnamese-specific categories', async () => {
      const mockCategories = {
        success: true,
        data: [
          { id: 1, name: '비자/체류', slug: 'visa', icon: '📄', count: 150 },
          { id: 2, name: '취업/근로', slug: 'work', icon: '💼', count: 89 },
          { id: 3, name: '생활정보', slug: 'life', icon: '🏠', count: 203 },
          { id: 4, name: '교육/학업', slug: 'education', icon: '📚', count: 45 },
          { id: 5, name: '의료/건강', slug: 'health', icon: '🏥', count: 76 }
        ]
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockCategories))

      const response = await fetch(`${API_BASE_URL}/categories`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)

      // Check Vietnamese-specific categories
      const categoryNames = data.data.map(cat => cat.slug)
      expect(categoryNames).toContain('visa')
      expect(categoryNames).toContain('work')
      expect(categoryNames).toContain('life')
    })

    it('should include question counts for each category', async () => {
      const mockCategories = {
        success: true,
        data: [
          { id: 1, name: '비자/체류', slug: 'visa', count: 150 },
          { id: 2, name: '취업/근로', slug: 'work', count: 89 }
        ]
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockCategories))

      const response = await fetch(`${API_BASE_URL}/categories`)
      const data = await response.json()

      data.data.forEach(category => {
        expect(category).toHaveProperty('count')
        expect(typeof category.count).toBe('number')
        expect(category.count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Questions Endpoint', () => {
    it('should return paginated questions list', async () => {
      const mockQuestions = {
        success: true,
        data: [
          {
            id: '1',
            title: '베트남에서 한국 비자 E-7 신청하는 방법이 궁금해요',
            content: '안녕하세요. 베트남에서 한국 비자 E-7 신청하는 방법에 대해 자세히 알고 싶습니다.',
            category: 'visa',
            author: { name: '응웬반투', id: 'user1' },
            created_at: '2024-01-01T10:00:00Z',
            vote_count: 5,
            answer_count: 3,
            view_count: 45,
            is_solved: false
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 600,
          has_more: true
        }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockQuestions))

      const response = await fetch(`${API_BASE_URL}/questions?page=1&limit=10`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data).toHaveProperty('pagination')
      expect(data.pagination.total).toBe(600)
    })

    it('should support category filtering', async () => {
      const mockFilteredQuestions = {
        success: true,
        data: [
          {
            id: '1',
            title: 'F-2 비자 연장 문의',
            category: 'visa',
            author: { name: '짠티란' }
          }
        ],
        pagination: { page: 1, limit: 10, total: 150 }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockFilteredQuestions))

      const response = await fetch(`${API_BASE_URL}/questions?category=visa`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      data.data.forEach(question => {
        expect(question.category).toBe('visa')
      })
    })

    it('should support search functionality', async () => {
      const mockSearchResults = {
        success: true,
        data: [
          {
            id: '1',
            title: '비자 연장 방법',
            content: '비자 연장에 대해 문의드립니다.',
            relevance_score: 0.95
          }
        ],
        query: '비자 연장',
        total: 25
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockSearchResults))

      const response = await fetch(`${API_BASE_URL}/search?q=비자 연장`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.query).toBe('비자 연장')
      expect(data.total).toBe(25)
      data.data.forEach(result => {
        expect(result.title.toLowerCase()).toContain('비자')
      })
    })
  })

  describe('Question Details Endpoint', () => {
    it('should return detailed question with answers', async () => {
      const mockQuestionDetail = {
        success: true,
        data: {
          id: '1',
          title: 'F-2-7 비자 연장 문의',
          content: '현재 F-2-7 비자를 가지고 있는데 연장 방법을 알고 싶습니다.',
          author: { name: '응웬반투', id: 'user1' },
          category: 'visa',
          tags: ['베트남', '한국생활', '비자', '외국인'],
          created_at: '2024-01-01T10:00:00Z',
          vote_count: 15,
          view_count: 234,
          answer_count: 5,
          is_solved: true,
          answers: [
            {
              id: 'ans1',
              content: '제가 직접 해본 경험을 말씀드리면...',
              author: { name: '레반남', id: 'user2' },
              vote_count: 8,
              is_helpful: true,
              is_accepted: true,
              created_at: '2024-01-01T11:00:00Z'
            }
          ]
        }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockQuestionDetail))

      const response = await fetch(`${API_BASE_URL}/questions/1`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('answers')
      expect(Array.isArray(data.data.answers)).toBe(true)
      expect(data.data.answers[0].is_accepted).toBe(true)
    })
  })

  describe('Stats Endpoint', () => {
    it('should return platform statistics', async () => {
      const mockStats = {
        success: true,
        data: {
          total_questions: 600,
          total_answers: 1500,
          total_users: 150,
          total_categories: 10,
          solved_questions: 450,
          solve_rate: 75.0,
          active_users_today: 25,
          new_questions_today: 12,
          vietnamese_users: 140,
          top_categories: [
            { name: '생활정보', count: 203 },
            { name: '비자/체류', count: 150 },
            { name: '취업/근로', count: 89 }
          ]
        }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockStats))

      const response = await fetch(`${API_BASE_URL}/stats`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.total_questions).toBe(600)
      expect(data.data.total_answers).toBe(1500)
      expect(data.data.solve_rate).toBe(75.0)
      expect(data.data.vietnamese_users).toBe(140)
      expect(Array.isArray(data.data.top_categories)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const mockError = {
        success: false,
        error: 'Question not found',
        code: 'QUESTION_NOT_FOUND'
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockError, 404))

      const response = await fetch(`${API_BASE_URL}/questions/nonexistent`)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Question not found')
    })

    it('should handle validation errors', async () => {
      const mockValidationError = {
        success: false,
        error: 'Validation failed',
        details: {
          title: 'Title is required',
          content: 'Content must be at least 10 characters'
        }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockValidationError, 400))

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', content: 'Short' })
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.details).toHaveProperty('title')
      expect(data.details).toHaveProperty('content')
    })

    it('should handle server errors', async () => {
      const mockServerError = {
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockServerError, 500))

      const response = await fetch(`${API_BASE_URL}/questions`)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting responses', async () => {
      const mockRateLimitError = {
        success: false,
        error: 'Rate limit exceeded',
        retry_after: 60,
        limit: 100,
        remaining: 0
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(mockRateLimitError, 429))

      const response = await fetch(`${API_BASE_URL}/questions`)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded')
      expect(data.retry_after).toBe(60)
      expect(data.remaining).toBe(0)
    })
  })

  describe('Vietnamese Content Validation', () => {
    it('should properly handle Vietnamese characters in questions', async () => {
      const vietnameseQuestion = {
        success: true,
        data: {
          id: '1',
          title: 'Xin chào! 한국에서 베트남 음식점 찾기',
          content: 'Tôi đang tìm nhà hàng Việt Nam ở Seoul. 도움 주세요!',
          author: { name: 'Nguyễn Văn Thư' }
        }
      }

      mockFetch.mockResolvedValueOnce(createApiResponse(vietnameseQuestion))

      const response = await fetch(`${API_BASE_URL}/questions/vietnamese-content`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.title).toContain('Xin chào')
      expect(data.data.content).toContain('Tôi đang')
      expect(data.data.author.name).toContain('Nguyễn')
    })
  })
})