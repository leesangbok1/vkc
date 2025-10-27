import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('Health API', () => {
  it('should return healthy status', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.service).toBe('viet-kconnect-api')
    expect(data.version).toBe('1.0.0')
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp)).toBeInstanceOf(Date)
  })

  it('should return proper response structure', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('service')
    expect(data).toHaveProperty('version')
  })

  it('should return timestamp in ISO format', async () => {
    const response = await GET()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})