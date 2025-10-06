import { NextRequest, NextResponse } from 'next/server'
import { WebVitalsMetric, PerformanceEntry } from '@/lib/performance/web-vitals'

// POST /api/monitoring/web-vitals - Core Web Vitals 데이터 수집
export async function POST(request: NextRequest) {
  try {
    const body: PerformanceEntry = await request.json()

    // 기본 유효성 검사
    if (!body.metrics || !Array.isArray(body.metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      )
    }

    // Web Vitals 메트릭 처리
    const processedMetrics = body.metrics.map(metric => ({
      ...metric,
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.deviceInfo.userAgent,
      connection: body.deviceInfo.connection,
      memory: body.deviceInfo.memory
    }))

    // 실제 구현에서는 데이터베이스나 분석 서비스로 전송
    // 여기서는 로깅만 수행
    console.log('[Web Vitals] Received metrics:', {
      url: body.url,
      timestamp: new Date(body.timestamp).toISOString(),
      metrics: processedMetrics.map(m => ({
        name: m.name,
        value: m.value,
        rating: m.rating
      }))
    })

    // 성능 임계값 확인 및 알림
    const poorMetrics = processedMetrics.filter(m => m.rating === 'poor')
    if (poorMetrics.length > 0) {
      console.warn('[Web Vitals] Poor performance detected:', poorMetrics)

      // 실제 구현에서는 알림 시스템 트리거
      // await sendPerformanceAlert(poorMetrics)
    }

    // 집계 데이터 업데이트 (실시간 대시보드용)
    await updatePerformanceAggregates(processedMetrics)

    return NextResponse.json({
      success: true,
      processed: processedMetrics.length
    })

  } catch (error) {
    console.error('Web Vitals API error:', error)
    return NextResponse.json(
      { error: 'Failed to process web vitals data' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/web-vitals - 집계된 성능 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '24h' // 24h, 7d, 30d
    const page = searchParams.get('page') || '/'

    // 집계 데이터 조회 (실제 구현에서는 데이터베이스에서)
    const mockAggregateData = {
      timeRange,
      page,
      summary: {
        totalSamples: 1250,
        lastUpdated: new Date().toISOString(),
        averages: {
          CLS: { value: 0.08, rating: 'good', trend: 'improving' },
          FID: { value: 85, rating: 'good', trend: 'stable' },
          FCP: { value: 1650, rating: 'good', trend: 'improving' },
          LCP: { value: 2200, rating: 'good', trend: 'stable' },
          TTFB: { value: 650, rating: 'good', trend: 'improving' }
        },
        percentiles: {
          CLS: { p50: 0.06, p75: 0.09, p95: 0.15 },
          FID: { p50: 65, p75: 95, p95: 180 },
          FCP: { p50: 1400, p75: 1800, p95: 2500 },
          LCP: { p50: 1900, p75: 2400, p95: 3200 },
          TTFB: { p50: 550, p75: 750, p95: 1100 }
        }
      },
      trends: {
        hourly: generateHourlyTrends(timeRange),
        byDevice: {
          mobile: { samples: 750, avgLCP: 2400, avgFID: 95 },
          desktop: { samples: 500, avgLCP: 1900, avgFID: 65 }
        },
        byConnection: {
          '4g': { samples: 800, avgLCP: 2100, avgTTFB: 600 },
          '3g': { samples: 300, avgLCP: 3200, avgTTFB: 900 },
          'wifi': { samples: 150, avgLCP: 1600, avgTTFB: 400 }
        }
      },
      alerts: [
        {
          type: 'warning',
          metric: 'LCP',
          threshold: 2500,
          currentValue: 2800,
          affectedPages: ['/questions', '/search'],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    }

    return NextResponse.json(mockAggregateData)

  } catch (error) {
    console.error('Web Vitals GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web vitals data' },
      { status: 500 }
    )
  }
}

// 성능 집계 데이터 업데이트 (메모리 기반 - 실제로는 Redis/DB)
const performanceAggregates = new Map<string, any>()

async function updatePerformanceAggregates(metrics: any[]) {
  try {
    const now = new Date()
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`

    // 시간별 집계 업데이트
    if (!performanceAggregates.has(hourKey)) {
      performanceAggregates.set(hourKey, {
        samples: 0,
        metrics: {}
      })
    }

    const hourlyData = performanceAggregates.get(hourKey)
    hourlyData.samples += metrics.length

    // 메트릭별 집계
    metrics.forEach(metric => {
      if (!hourlyData.metrics[metric.name]) {
        hourlyData.metrics[metric.name] = {
          values: [],
          sum: 0,
          count: 0
        }
      }

      const metricData = hourlyData.metrics[metric.name]
      metricData.values.push(metric.value)
      metricData.sum += metric.value
      metricData.count += 1

      // 최근 1000개 값만 유지 (메모리 관리)
      if (metricData.values.length > 1000) {
        metricData.values = metricData.values.slice(-1000)
      }
    })

    performanceAggregates.set(hourKey, hourlyData)

    // 24시간 이상 된 데이터 정리
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    for (const [key] of performanceAggregates) {
      const [year, month, day, hour] = key.split('-').map(Number)
      const keyTime = new Date(year, month, day, hour)
      if (keyTime < cutoffTime) {
        performanceAggregates.delete(key)
      }
    }

  } catch (error) {
    console.error('Failed to update performance aggregates:', error)
  }
}

function generateHourlyTrends(range: string): Array<{
  timestamp: string
  LCP: number
  FID: number
  CLS: number
  samples: number
}> {
  const hours = range === '24h' ? 24 : range === '7d' ? 168 : 720
  const trends: Array<{
    timestamp: string
    LCP: number
    FID: number
    CLS: number
    samples: number
  }> = []

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000)
    trends.push({
      timestamp: timestamp.toISOString(),
      LCP: Math.random() * 1000 + 1500, // 1.5-2.5초
      FID: Math.random() * 50 + 50,      // 50-100ms
      CLS: Math.random() * 0.1 + 0.05,   // 0.05-0.15
      samples: Math.floor(Math.random() * 50) + 10
    })
  }

  return trends
}