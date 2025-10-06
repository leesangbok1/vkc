import { NextRequest, NextResponse } from 'next/server'
import { QueryPerformanceMonitor, VietnameseCommunityCache, performHealthCheck } from '@/lib/database-optimization'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHealthCheck = searchParams.get('health') === 'true'

    const monitor = QueryPerformanceMonitor.getInstance()
    const cacheStats = VietnameseCommunityCache.getStats()

    const response = {
      timestamp: new Date().toISOString(),
      query_performance: {
        statistics: monitor.getAllStats(),
        summary: {
          total_queries: Object.keys(monitor.getAllStats()).length,
          slow_queries: Object.entries(monitor.getAllStats())
            .filter(([_, stats]: [string, any]) => stats && stats.avg > 500)
            .map(([name]) => name),
          fastest_queries: Object.entries(monitor.getAllStats())
            .filter(([_, stats]: [string, any]) => stats && stats.avg < 100)
            .map(([name]) => name)
        }
      },
      cache_performance: {
        stats: cacheStats,
        efficiency: {
          hit_rate: cacheStats.size > 0 ? 'Available' : 'No data',
          recommendations: [
            cacheStats.size > 500 ? 'Consider cache cleanup' : 'Cache usage is optimal',
            'Monitor cache hit rates for popular endpoints'
          ]
        }
      },
      recommendations: [] as string[]
    }

    // 성능 추천사항 생성
    const slowQueries = response.query_performance.summary.slow_queries
    if (slowQueries.length > 0) {
      response.recommendations.push(
        `Optimize slow queries: ${slowQueries.join(', ')}`
      )
    }

    if (cacheStats.size > 1000) {
      response.recommendations.push('Consider implementing cache eviction policies')
    }

    if (cacheStats.size === 0) {
      response.recommendations.push('Enable caching for better performance')
    }

    // 옵션: 전체 건강도 체크 포함
    if (includeHealthCheck) {
      const healthCheck = await performHealthCheck()
      return NextResponse.json({
        ...response,
        health_check: healthCheck
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('DB Performance API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch performance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}