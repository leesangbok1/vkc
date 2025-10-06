import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, PUT } from '@/app/api/auth/profile/route'
import { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn()
}))

describe('Auth Profile API', () => {
  beforeEach(() => {
    // 테스트 환경에서 MOCK_MODE 활성화
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
  })

  describe('GET /api/auth/profile', () => {
    it('should return mock profile data', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile')
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.id).toBe('user_mock_123')
      expect(data.data.email).toBe('letuan@example.com')
      expect(data.data.name).toBe('레투안')
    })

    it('should include Vietnamese-specific information', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile')
      const response = await GET(mockRequest)
      const data = await response.json()

      const profile = data.data
      expect(profile).toHaveProperty('visa_type')
      expect(profile).toHaveProperty('company')
      expect(profile).toHaveProperty('years_in_korea')
      expect(profile).toHaveProperty('region')
      expect(profile).toHaveProperty('preferred_language')
      expect(profile.languages).toHaveProperty('vietnamese', 'native')
      expect(profile.languages).toHaveProperty('korean')
    })

    it('should include trust system data', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile')
      const response = await GET(mockRequest)
      const data = await response.json()

      const profile = data.data
      expect(profile).toHaveProperty('trust_score')
      expect(profile).toHaveProperty('badges')
      expect(profile.badges).toHaveProperty('verified')
      expect(profile.badges).toHaveProperty('helpful')
      expect(typeof profile.trust_score).toBe('number')
    })

    it('should include activity statistics', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile')
      const response = await GET(mockRequest)
      const data = await response.json()

      const profile = data.data
      expect(profile).toHaveProperty('question_count')
      expect(profile).toHaveProperty('answer_count')
      expect(profile).toHaveProperty('helpful_answer_count')
      expect(typeof profile.question_count).toBe('number')
    })
  })

  describe('PUT /api/auth/profile', () => {
    it('should update profile with valid fields', async () => {
      const updateData = {
        name: '업데이트된 이름',
        bio: '새로운 자기소개입니다. 충분히 길게 작성하여 trust score 보너스를 받아보겠습니다.',
        visa_type: 'F-5',
        specialties: ['IT', '웹개발', 'React']
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(updateData.name)
      expect(data.data.bio).toBe(updateData.bio)
      expect(data.data.visa_type).toBe(updateData.visa_type)
    })

    it('should calculate trust score bonus correctly', async () => {
      const updateData = {
        bio: '이것은 50자 이상의 충분히 긴 자기소개입니다. Trust score 보너스를 받기 위해 작성했습니다.',
        visa_type: 'E-7',
        company: '새로운 회사',
        specialties: ['프로그래밍', 'AI'],
        languages: { korean: 'advanced', english: 'intermediate' }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.trust_bonus).toContain('+')
      expect(data.data.trust_score).toBeGreaterThan(324)
    })

    it('should filter out non-allowed fields', async () => {
      const updateData = {
        name: '허용된 필드',
        email: 'hacker@evil.com', // 허용되지 않은 필드
        trust_score: 9999, // 허용되지 않은 필드
        id: 'fake-id', // 허용되지 않은 필드
        bio: '허용된 자기소개'
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.name).toBe(updateData.name)
      expect(data.data.bio).toBe(updateData.bio)
      // 허용되지 않은 필드들은 포함되지 않아야 함
      expect(data.data).not.toHaveProperty('email')
      expect(data.data.trust_score).not.toBe(9999)
      expect(data.data.id).not.toBe('fake-id')
    })

    it('should update timestamp on profile change', async () => {
      const updateData = { name: '타임스탬프 테스트' }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.updated_at).toBeDefined()

      const updatedTime = new Date(data.data.updated_at)
      const now = new Date()
      const diffSeconds = Math.abs(now.getTime() - updatedTime.getTime()) / 1000

      // 업데이트 시간이 현재 시간과 1초 이내 차이여야 함
      expect(diffSeconds).toBeLessThan(1)
    })
  })
})