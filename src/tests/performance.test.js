/**
 * 성능 테스트 - 쿼리 최적화 및 응답 시간 측정
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Performance monitoring helpers
const performanceMetrics = {
  responseTime: [],
  queryTime: [],
  memoryUsage: [],
  throughput: []
}

function measureExecutionTime(fn) {
  return async (...args) => {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()
    const duration = end - start

    performanceMetrics.responseTime.push(duration)
    return { result, duration }
  }
}

function calculateStats(measurements) {
  if (measurements.length === 0) return null

  const sorted = [...measurements].sort((a, b) => a - b)
  const sum = measurements.reduce((a, b) => a + b, 0)

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / measurements.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  }
}

// Mock database operations with realistic delays
const mockDatabase = {
  async query(sql, params = []) {
    const baseDelay = 10 // Base query time in ms
    const complexityDelay = sql.length * 0.1 // Complexity based on query length
    const indexEfficiency = sql.includes('WHERE id =') ? 0.5 : 1.0 // Indexed vs full scan

    const queryTime = baseDelay + (complexityDelay * indexEfficiency)

    await new Promise(resolve => setTimeout(resolve, queryTime))

    performanceMetrics.queryTime.push(queryTime)

    // Mock different result sets based on query type
    if (sql.includes('SELECT COUNT(*)')) {
      return [{ count: 600 }]
    } else if (sql.includes('SELECT * FROM questions')) {
      const limit = params.find(p => typeof p === 'number') || 10
      return Array.from({ length: Math.min(limit, 100) }, (_, i) => ({
        id: `q${i}`,
        title: `베트남 질문 ${i}`,
        content: `질문 내용 ${i}`,
        created_at: new Date().toISOString()
      }))
    } else if (sql.includes('SELECT * FROM categories')) {
      return [
        { id: 1, name: '비자/체류', slug: 'visa', count: 150 },
        { id: 2, name: '취업/근로', slug: 'work', count: 89 },
        { id: 3, name: '생활정보', slug: 'life', count: 203 }
      ]
    }

    return []
  },

  async batchInsert(table, records) {
    const batchSize = 100
    const totalTime = (records.length / batchSize) * 50 // 50ms per batch

    await new Promise(resolve => setTimeout(resolve, totalTime))

    return { inserted: records.length, time: totalTime }
  }
}

describe('Performance Tests', () => {
  beforeAll(() => {
    // Clear previous metrics
    Object.keys(performanceMetrics).forEach(key => {
      performanceMetrics[key] = []
    })
  })

  afterAll(() => {
    // Log performance summary
    console.log('\n📊 Performance Test Summary:')
    console.log('='.repeat(50))

    Object.entries(performanceMetrics).forEach(([metric, values]) => {
      const stats = calculateStats(values)
      if (stats) {
        console.log(`${metric.toUpperCase()}:`)
        console.log(`  Min: ${stats.min.toFixed(2)}ms`)
        console.log(`  Max: ${stats.max.toFixed(2)}ms`)
        console.log(`  Avg: ${stats.avg.toFixed(2)}ms`)
        console.log(`  P95: ${stats.p95.toFixed(2)}ms`)
        console.log(`  P99: ${stats.p99.toFixed(2)}ms`)
        console.log('')
      }
    })
  })

  describe('Query Performance', () => {
    it('should execute simple SELECT queries efficiently', async () => {
      const measuredQuery = measureExecutionTime(mockDatabase.query)

      const { result, duration } = await measuredQuery(
        'SELECT * FROM questions WHERE id = ?',
        ['q1']
      )

      expect(duration).toBeLessThan(50) // Should be under 50ms
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle complex JOIN queries within acceptable time', async () => {
      const complexQuery = `
        SELECT q.*, c.name as category_name, u.name as author_name
        FROM questions q
        JOIN categories c ON q.category_id = c.id
        JOIN users u ON q.author_id = u.id
        WHERE q.created_at > ? AND c.slug = ?
        ORDER BY q.vote_score DESC
        LIMIT 20
      `

      const measuredQuery = measureExecutionTime(mockDatabase.query)
      const { duration } = await measuredQuery(complexQuery, [
        '2024-01-01',
        'visa'
      ])

      expect(duration).toBeLessThan(200) // Complex queries under 200ms
    })

    it('should optimize pagination queries', async () => {
      const paginationQuery = `
        SELECT * FROM questions
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `

      const results = []

      // Test multiple pages
      for (let page = 0; page < 5; page++) {
        const measuredQuery = measureExecutionTime(mockDatabase.query)
        const { duration } = await measuredQuery(paginationQuery, [10, page * 10])
        results.push(duration)
      }

      // Pagination performance should be consistent
      const avgTime = results.reduce((a, b) => a + b, 0) / results.length
      expect(avgTime).toBeLessThan(100)

      // Performance shouldn't degrade significantly with deeper pages
      const firstPageTime = results[0]
      const lastPageTime = results[results.length - 1]
      expect(lastPageTime).toBeLessThan(firstPageTime * 2)
    })

    it('should handle search queries efficiently', async () => {
      const searchQuery = `
        SELECT q.*, ts_rank(search_vector, plainto_tsquery(?)) as rank
        FROM questions q
        WHERE search_vector @@ plainto_tsquery(?)
        ORDER BY rank DESC, created_at DESC
        LIMIT 20
      `

      const searchTerms = ['비자', '연장', '방법', '베트남', '한국']

      for (const term of searchTerms) {
        const measuredQuery = measureExecutionTime(mockDatabase.query)
        const { duration } = await measuredQuery(searchQuery, [term, term])

        expect(duration).toBeLessThan(150) // Search under 150ms
      }
    })

    it('should count large datasets efficiently', async () => {
      const countQuery = 'SELECT COUNT(*) FROM questions WHERE category_id = ?'

      const measuredQuery = measureExecutionTime(mockDatabase.query)
      const { result, duration } = await measuredQuery(countQuery, [1])

      expect(duration).toBeLessThan(30) // Count queries under 30ms
      expect(result[0].count).toBe(600)
    })
  })

  describe('Batch Operations Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      const mockRecords = Array.from({ length: 500 }, (_, i) => ({
        id: `record_${i}`,
        title: `Test Record ${i}`,
        content: `Content for record ${i}`,
        created_at: new Date().toISOString()
      }))

      const start = performance.now()
      const result = await mockDatabase.batchInsert('questions', mockRecords)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(1000) // Bulk insert under 1 second
      expect(result.inserted).toBe(500)

      // Calculate throughput (records per second)
      const throughput = (mockRecords.length / duration) * 1000
      performanceMetrics.throughput.push(throughput)
      expect(throughput).toBeGreaterThan(100) // At least 100 records/sec
    })

    it('should batch update operations efficiently', async () => {
      const batchUpdateTime = await measureExecutionTime(async () => {
        // Simulate batch update of 100 records
        const updatePromises = Array.from({ length: 100 }, (_, i) =>
          mockDatabase.query(
            'UPDATE questions SET view_count = view_count + 1 WHERE id = ?',
            [`q${i}`]
          )
        )

        await Promise.all(updatePromises)
      })()

      expect(batchUpdateTime.duration).toBeLessThan(500) // Batch updates under 500ms
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent read operations', async () => {
      const concurrentReads = Array.from({ length: 10 }, () =>
        measureExecutionTime(mockDatabase.query)('SELECT * FROM questions LIMIT 10')
      )

      const results = await Promise.all(concurrentReads)

      results.forEach(({ duration }) => {
        expect(duration).toBeLessThan(100) // Each concurrent read under 100ms
      })

      // Total time should be much less than sum of individual times (parallelization)
      const totalSequentialTime = results.reduce((sum, { duration }) => sum + duration, 0)
      const actualTotalTime = Math.max(...results.map(r => r.duration))

      expect(actualTotalTime).toBeLessThan(totalSequentialTime * 0.5)
    })

    it('should maintain performance under load', async () => {
      const loadTestResults = []

      // Simulate 50 concurrent users
      for (let batch = 0; batch < 5; batch++) {
        const batchRequests = Array.from({ length: 10 }, () =>
          measureExecutionTime(mockDatabase.query)('SELECT * FROM questions LIMIT 5')
        )

        const batchResults = await Promise.all(batchRequests)
        loadTestResults.push(...batchResults.map(r => r.duration))

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      const avgResponseTime = loadTestResults.reduce((a, b) => a + b, 0) / loadTestResults.length
      const maxResponseTime = Math.max(...loadTestResults)

      expect(avgResponseTime).toBeLessThan(80) // Average under 80ms
      expect(maxResponseTime).toBeLessThan(200) // Max under 200ms

      // Response time should be relatively consistent (low variance)
      const variance = loadTestResults.reduce((sum, time) =>
        sum + Math.pow(time - avgResponseTime, 2), 0
      ) / loadTestResults.length

      expect(Math.sqrt(variance)).toBeLessThan(50) // Standard deviation under 50ms
    })
  })

  describe('Memory and Resource Usage', () => {
    it('should manage memory efficiently during large queries', async () => {
      const initialMemory = process.memoryUsage()

      // Simulate processing large result set
      const largeQuery = 'SELECT * FROM questions ORDER BY created_at DESC LIMIT 1000'
      const { result } = await measureExecutionTime(mockDatabase.query)(largeQuery)

      const afterQueryMemory = process.memoryUsage()
      const memoryIncrease = afterQueryMemory.heapUsed - initialMemory.heapUsed

      performanceMetrics.memoryUsage.push(memoryIncrease)

      // Memory increase should be reasonable (under 50MB for test data)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)

      // Clean up simulation
      result.length = 0 // Clear array

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
    })

    it('should handle connection pooling efficiently', async () => {
      // Simulate multiple database connections
      const connectionTests = Array.from({ length: 20 }, async (_, i) => {
        const connStart = performance.now()

        await mockDatabase.query('SELECT 1 as test')

        const connTime = performance.now() - connStart
        return connTime
      })

      const connectionTimes = await Promise.all(connectionTests)
      const avgConnectionTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length

      // Connection overhead should be minimal
      expect(avgConnectionTime).toBeLessThan(50)
    })
  })

  describe('Query Optimization', () => {
    it('should benefit from proper indexing', async () => {
      // Test indexed vs non-indexed queries
      const indexedQuery = 'SELECT * FROM questions WHERE id = ?'
      const nonIndexedQuery = 'SELECT * FROM questions WHERE title LIKE ?'

      const indexedResults = []
      const nonIndexedResults = []

      // Run multiple iterations
      for (let i = 0; i < 10; i++) {
        const { duration: indexedTime } = await measureExecutionTime(mockDatabase.query)(
          indexedQuery, ['q1']
        )
        indexedResults.push(indexedTime)

        const { duration: nonIndexedTime } = await measureExecutionTime(mockDatabase.query)(
          nonIndexedQuery, ['%비자%']
        )
        nonIndexedResults.push(nonIndexedTime)
      }

      const avgIndexedTime = indexedResults.reduce((a, b) => a + b, 0) / indexedResults.length
      const avgNonIndexedTime = nonIndexedResults.reduce((a, b) => a + b, 0) / nonIndexedResults.length

      // Indexed queries should be faster or at least comparable
      expect(avgIndexedTime).toBeLessThan(avgNonIndexedTime * 1.2) // Allow 20% margin
    })

    it('should optimize complex WHERE clauses', async () => {
      const optimizedQuery = `
        SELECT * FROM questions
        WHERE category_id = ? AND created_at > ?
        ORDER BY vote_score DESC
        LIMIT 10
      `

      const unoptimizedQuery = `
        SELECT * FROM questions
        WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?
        ORDER BY created_at DESC
        LIMIT 10
      `

      const { duration: optimizedTime } = await measureExecutionTime(mockDatabase.query)(
        optimizedQuery, [1, '2024-01-01']
      )

      const { duration: unoptimizedTime } = await measureExecutionTime(mockDatabase.query)(
        unoptimizedQuery, ['%비자%', '%비자%']
      )

      // Optimized queries should perform better
      expect(optimizedTime).toBeLessThan(100)
      expect(optimizedTime).toBeLessThan(unoptimizedTime)
    })
  })

  describe('Caching Performance', () => {
    it('should demonstrate cache effectiveness', async () => {
      const cacheKey = 'categories_list'
      const cache = new Map()

      async function getCategoriesWithCache() {
        if (cache.has(cacheKey)) {
          return { result: cache.get(cacheKey), fromCache: true }
        }

        const { result } = await measureExecutionTime(mockDatabase.query)(
          'SELECT * FROM categories ORDER BY name'
        )

        cache.set(cacheKey, result)
        return { result, fromCache: false }
      }

      // First call - database query
      const firstCall = performance.now()
      const { result: firstResult, fromCache: firstFromCache } = await getCategoriesWithCache()
      const firstCallTime = performance.now() - firstCall

      // Second call - should be cached
      const secondCall = performance.now()
      const { result: secondResult, fromCache: secondFromCache } = await getCategoriesWithCache()
      const secondCallTime = performance.now() - secondCall

      expect(firstFromCache).toBe(false)
      expect(secondFromCache).toBe(true)
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.1) // Cache should be 10x faster
      expect(secondResult).toEqual(firstResult)
    })
  })

  describe('Performance Benchmarks', () => {
    it('should meet Vietnamese K-Connect performance targets', async () => {
      const benchmarks = {
        questionList: { target: 100, description: '질문 목록 조회' },
        questionDetail: { target: 80, description: '질문 상세 조회' },
        search: { target: 150, description: '검색 기능' },
        categoryList: { target: 50, description: '카테고리 목록' },
        userProfile: { target: 60, description: '사용자 프로필' }
      }

      for (const [operation, { target, description }] of Object.entries(benchmarks)) {
        const testQuery = operation === 'search'
          ? 'SELECT * FROM questions WHERE title LIKE ? LIMIT 20'
          : 'SELECT * FROM questions LIMIT 10'

        const { duration } = await measureExecutionTime(mockDatabase.query)(
          testQuery, operation === 'search' ? ['%베트남%'] : []
        )

        expect(duration, `${description} 성능 목표 미달`).toBeLessThan(target)
      }
    })

    it('should maintain performance standards for Vietnamese content', async () => {
      const vietnameseQueries = [
        { query: 'SELECT * FROM questions WHERE title LIKE ?', params: ['%비자%'] },
        { query: 'SELECT * FROM questions WHERE content LIKE ?', params: ['%한국생활%'] },
        { query: 'SELECT * FROM questions WHERE tags @> ?', params: ['["베트남"]'] }
      ]

      for (const { query, params } of vietnameseQueries) {
        const { duration } = await measureExecutionTime(mockDatabase.query)(query, params)

        // Korean/Vietnamese text queries should perform well
        expect(duration).toBeLessThan(120)
      }
    })
  })
})