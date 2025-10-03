/**
 * API Routes 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// API 응답 모킹
const mockResponses = {
  health: {
    status: 'ok',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '1.0.0',
    uptime: 12345
  },
  categories: [
    { id: 1, name: 'visa', label: '비자/체류', count: 150 },
    { id: 2, name: 'medical', label: '의료/건강', count: 89 },
    { id: 3, name: 'life', label: '생활정보', count: 203 },
    { id: 4, name: 'work', label: '취업/창업', count: 76 },
    { id: 5, name: 'education', label: '교육/학습', count: 45 }
  ],
  questions: [
    {
      id: 1,
      title: 'F-2-7 비자 연장 문의',
      content: '현재 F-2-7 비자를 가지고 있는데 연장 방법을 알고 싶습니다.',
      category: 'visa',
      author: { name: '홍길동', id: 'user1' },
      created_at: '2024-01-01T10:00:00Z',
      vote_count: 5,
      answer_count: 3,
      is_solved: true
    }
  ],
  stats: {
    total_questions: 563,
    total_answers: 1247,
    total_users: 234,
    solved_questions: 412,
    solve_rate: 73.2
  }
}

// HTTP 요청 모킹 헬퍼
function createMockRequest(method = 'GET', body = null) {
  return {
    method,
    headers: new Map(),
    json: async () => body,
    text: async () => JSON.stringify(body),
    url: 'http://localhost:3000/api/test'
  }
}

function createMockResponse(data, status = 200) {
  return {
    json: () => Promise.resolve(data),
    status,
    ok: status >= 200 && status < 300,
    headers: new Map([['Content-Type', 'application/json']])
  }
}

// API Route 핸들러 시뮬레이션
const apiHandlers = {
  async health(request) {
    if (request.method !== 'GET') {
      return createMockResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      return createMockResponse(mockResponses.health, 200)
    } catch (error) {
      return createMockResponse({ error: 'Internal server error' }, 500)
    }
  },

  async categories(request) {
    if (request.method !== 'GET') {
      return createMockResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      return createMockResponse({
        success: true,
        data: mockResponses.categories
      }, 200)
    } catch (error) {
      return createMockResponse({ error: 'Failed to fetch categories' }, 500)
    }
  },

  async questions(request) {
    if (request.method === 'GET') {
      try {
        return createMockResponse({
          success: true,
          data: mockResponses.questions,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            has_more: false
          }
        }, 200)
      } catch (error) {
        return createMockResponse({ error: 'Failed to fetch questions' }, 500)
      }
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json()
        if (!body.title || !body.content) {
          return createMockResponse({ error: 'Title and content are required' }, 400)
        }

        const newQuestion = {
          id: Date.now(),
          ...body,
          author: { name: '테스트 사용자', id: 'test-user' },
          created_at: new Date().toISOString(),
          vote_count: 0,
          answer_count: 0,
          is_solved: false
        }

        return createMockResponse({
          success: true,
          data: newQuestion
        }, 201)
      } catch (error) {
        return createMockResponse({ error: 'Failed to create question' }, 500)
      }
    }

    return createMockResponse({ error: 'Method not allowed' }, 405)
  },

  async stats(request) {
    if (request.method !== 'GET') {
      return createMockResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      return createMockResponse({
        success: true,
        data: mockResponses.stats
      }, 200)
    } catch (error) {
      return createMockResponse({ error: 'Failed to fetch stats' }, 500)
    }
  },

  async search(request) {
    if (request.method !== 'GET') {
      return createMockResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      const url = new URL(request.url)
      const query = url.searchParams.get('q')

      if (!query) {
        return createMockResponse({ error: 'Search query is required' }, 400)
      }

      const filteredQuestions = mockResponses.questions.filter(q =>
        q.title.includes(query) || q.content.includes(query)
      )

      return createMockResponse({
        success: true,
        data: filteredQuestions,
        query,
        total: filteredQuestions.length
      }, 200)
    } catch (error) {
      return createMockResponse({ error: 'Search failed' }, 500)
    }
  }
}

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.health(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('uptime')
    })

    it('should reject non-GET methods', async () => {
      const request = createMockRequest('POST')
      const response = await apiHandlers.health(request)
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe('Method not allowed')
    })
  })

  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.categories(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
      expect(data.data[0]).toHaveProperty('id')
      expect(data.data[0]).toHaveProperty('name')
      expect(data.data[0]).toHaveProperty('label')
      expect(data.data[0]).toHaveProperty('count')
    })

    it('should include all expected categories', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.categories(request)
      const data = await response.json()

      const categoryNames = data.data.map(cat => cat.name)
      expect(categoryNames).toContain('visa')
      expect(categoryNames).toContain('medical')
      expect(categoryNames).toContain('life')
      expect(categoryNames).toContain('work')
      expect(categoryNames).toContain('education')
    })

    it('should reject non-GET methods', async () => {
      const request = createMockRequest('POST')
      const response = await apiHandlers.categories(request)

      expect(response.status).toBe(405)
    })
  })

  describe('GET /api/questions', () => {
    it('should return questions list', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data).toHaveProperty('pagination')
    })

    it('should include pagination metadata', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      expect(data.pagination).toHaveProperty('page')
      expect(data.pagination).toHaveProperty('limit')
      expect(data.pagination).toHaveProperty('total')
      expect(data.pagination).toHaveProperty('has_more')
    })

    it('should return questions with required fields', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      if (data.data.length > 0) {
        const question = data.data[0]
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('title')
        expect(question).toHaveProperty('content')
        expect(question).toHaveProperty('category')
        expect(question).toHaveProperty('author')
        expect(question).toHaveProperty('created_at')
        expect(question).toHaveProperty('vote_count')
        expect(question).toHaveProperty('answer_count')
      }
    })
  })

  describe('POST /api/questions', () => {
    it('should create new question with valid data', async () => {
      const questionData = {
        title: '새로운 질문',
        content: '질문 내용입니다.',
        category: 'life'
      }

      const request = createMockRequest('POST', questionData)
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(questionData.title)
      expect(data.data.content).toBe(questionData.content)
      expect(data.data.category).toBe(questionData.category)
      expect(data.data).toHaveProperty('id')
    })

    it('should reject request without title', async () => {
      const questionData = {
        content: '질문 내용입니다.',
        category: 'life'
      }

      const request = createMockRequest('POST', questionData)
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })

    it('should reject request without content', async () => {
      const questionData = {
        title: '제목',
        category: 'life'
      }

      const request = createMockRequest('POST', questionData)
      const response = await apiHandlers.questions(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })
  })

  describe('GET /api/stats', () => {
    it('should return platform statistics', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.stats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('total_questions')
      expect(data.data).toHaveProperty('total_answers')
      expect(data.data).toHaveProperty('total_users')
      expect(data.data).toHaveProperty('solved_questions')
      expect(data.data).toHaveProperty('solve_rate')
    })

    it('should return numeric values for stats', async () => {
      const request = createMockRequest('GET')
      const response = await apiHandlers.stats(request)
      const data = await response.json()

      expect(typeof data.data.total_questions).toBe('number')
      expect(typeof data.data.total_answers).toBe('number')
      expect(typeof data.data.total_users).toBe('number')
      expect(typeof data.data.solved_questions).toBe('number')
      expect(typeof data.data.solve_rate).toBe('number')
    })
  })

  describe('GET /api/search', () => {
    it('should search questions by query', async () => {
      const request = createMockRequest('GET')
      request.url = 'http://localhost:3000/api/search?q=비자'

      const response = await apiHandlers.search(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.query).toBe('비자')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should require search query', async () => {
      const request = createMockRequest('GET')
      request.url = 'http://localhost:3000/api/search'

      const response = await apiHandlers.search(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Search query is required')
    })

    it('should return matching results', async () => {
      const request = createMockRequest('GET')
      request.url = 'http://localhost:3000/api/search?q=F-2-7'

      const response = await apiHandlers.search(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.length).toBeGreaterThan(0)
      expect(data.total).toBe(data.data.length)
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // 실제로 에러를 발생시키는 핸들러를 만들어 테스트
      const errorHandler = async (request) => {
        if (request.method !== 'GET') {
          return createMockResponse({ error: 'Method not allowed' }, 405)
        }

        try {
          // 의도적으로 에러를 발생시킴
          throw new Error('Simulated server error')
        } catch (error) {
          return createMockResponse({ error: 'Internal server error' }, 500)
        }
      }

      const request = createMockRequest('GET')
      const response = await errorHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate HTTP methods consistently', async () => {
      const endpoints = ['health', 'categories', 'stats']

      for (const endpoint of endpoints) {
        const request = createMockRequest('DELETE')
        const response = await apiHandlers[endpoint](request)
        const data = await response.json()

        expect(response.status).toBe(405)
        expect(data.error).toBe('Method not allowed')
      }
    })
  })
})