import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/questions/route'
import { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn()
}))

describe('Questions API', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
  })

  describe('GET /api/questions', () => {
    it('should return questions list', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/questions')
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
    })

    it('should include Vietnamese-specific questions', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/questions')
      const response = await GET(mockRequest)
      const data = await response.json()

      const questions = data.data
      const vietnameseQuestion = questions.find((q: any) =>
        q.title.includes('비자') || q.title.includes('취업') || q.category === 'visa'
      )

      expect(vietnameseQuestion).toBeDefined()
    })

    it('should support filtering by category', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/questions?category=visa')
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      if (data.data.length > 0) {
        data.data.forEach((question: any) => {
          expect(question.category.slug).toBe('visa')
        })
      }
    })

    it('should support pagination', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/questions?page=1&limit=5')
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBeLessThanOrEqual(5)
      expect(data).toHaveProperty('pagination')
    })

    it('should include question metadata', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/questions')
      const response = await GET(mockRequest)
      const data = await response.json()

      const question = data.data[0]
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('title')
      expect(question).toHaveProperty('content')
      expect(question).toHaveProperty('category')
      expect(question).toHaveProperty('author')
      expect(question).toHaveProperty('created_at')
      expect(question).toHaveProperty('upvote_count')
      expect(question).toHaveProperty('answer_count')
    })
  })

  describe('POST /api/questions', () => {
    it('should create new question successfully', async () => {
      const questionData = {
        title: '베트남인 E-7 비자 연장 문의',
        content: 'E-7 비자 연장할 때 필요한 서류와 절차에 대해 알고 싶습니다.',
        category_id: 1,
        tags: ['E-7', '비자연장', '서류']
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(questionData.title)
      expect(data.data.content).toBe(questionData.content)
      expect(data.data.category_id).toBe(questionData.category_id)
      expect(data.data.id).toBeDefined()
    })

    it('should validate required fields', async () => {
      const incompleteData = {
        title: '제목만 있는 질문'
        // content와 category_id 누락
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        body: JSON.stringify(incompleteData)
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('필수')
    })

    it('should sanitize and validate content', async () => {
      const questionData = {
        title: '제목이 너무 길면 어떻게 될까요? '.repeat(15), // 매우 긴 제목 (200자 초과)
        content: '<script>alert("xss")</script>정상적인 내용입니다.', // XSS 시도
        category_id: 1
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      if (response.status === 201) {
        // 성공했다면 제목이 적절히 잘렸는지 확인
        expect(data.data.title.length).toBeLessThan(questionData.title.length)
        // XSS 스크립트가 제거되었는지 확인
        expect(data.data.content).not.toContain('<script>')
      } else {
        // 실패했다면 적절한 에러 메시지가 있는지 확인
        expect(data.error).toBeDefined()
      }
    })

    it('should auto-generate question ID', async () => {
      const questionData = {
        title: 'ID 생성 테스트',
        content: '자동으로 ID가 생성되는지 확인하는 테스트입니다.',
        category_id: 1
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.id).toBeDefined()
      expect(typeof data.data.id).toBe('string')
      expect(data.data.id.length).toBeGreaterThan(0)
    })

    it('should set initial values correctly', async () => {
      const questionData = {
        title: '초기값 확인 테스트',
        content: '새 질문의 초기값들이 올바르게 설정되는지 확인합니다.',
        category_id: 1
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.upvote_count).toBe(0)
      expect(data.data.answer_count).toBe(0)
      expect(data.data.view_count).toBe(0)
      expect(data.data.created_at).toBeDefined()
      expect(data.data.updated_at).toBeDefined()
      expect(data.data.is_answered).toBe(false)
    })
  })
})