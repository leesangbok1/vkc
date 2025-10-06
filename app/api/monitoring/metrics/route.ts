import { NextRequest, NextResponse } from 'next/server'
import { systemMetrics } from '@/lib/monitoring/system-metrics'

// Node.js 런타임 사용 (system metrics를 위해 필요)
export const runtime = 'nodejs'

interface PerformanceMetrics {
  timestamp: string
  api: {
    response_times: {
      avg: number
      p50: number
      p95: number
      p99: number
    }
    requests_per_minute: number
    error_rate: number
    endpoints: Array<{
      path: string
      method: string
      avg_response_time: number
      requests_count: number
      error_count: number
    }>
  }
  cache: {
    hit_rate: number
    miss_rate: number
    size: number
    entries: number
    memory_usage: string
  }
  system: {
    cpu_usage: number
    memory_usage: {
      used: number
      total: number
      percentage: number
    }
    disk_usage: {
      used: number
      total: number
      percentage: number
    }
    network: {
      bytes_in: number
      bytes_out: number
    }
  }
  user_activity: {
    active_users: number
    page_views: number
    unique_visitors: number
    bounce_rate: number
    avg_session_duration: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1h'

    // Get system metrics
    const sysMetrics = await systemMetrics.getSystemMetrics()
    const apiMetrics = systemMetrics.getApiMetrics(timeframe)
    const userActivity = systemMetrics.getUserActivityMetrics()

    // Get cache metrics (mock data for now)
    const cacheMetrics = {
      hit_rate: 85.5,
      miss_rate: 14.5,
      size: 256,
      entries: 1250,
      memory_usage: '12.5MB'
    }

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      api: apiMetrics,
      cache: cacheMetrics,
      system: {
        cpu_usage: sysMetrics.cpu.usage,
        memory_usage: {
          used: sysMetrics.memory.used,
          total: sysMetrics.memory.total,
          percentage: sysMetrics.memory.percentage
        },
        disk_usage: {
          used: sysMetrics.disk.used,
          total: sysMetrics.disk.total,
          percentage: sysMetrics.disk.percentage
        },
        network: {
          bytes_in: sysMetrics.network.bytes_in,
          bytes_out: sysMetrics.network.bytes_out
        }
      },
      user_activity: userActivity
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timeframe
    })
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}