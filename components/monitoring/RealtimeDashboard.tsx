'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { QueryErrorBoundary } from '@/components/error-boundary/QueryErrorBoundary'

interface SystemHealth {
  timestamp: string
  overall: 'healthy' | 'warning' | 'critical'
  services: {
    database: ServiceHealth
    cache: ServiceHealth
    api: ServiceHealth
    frontend: ServiceHealth
  }
  metrics: {
    response_time: number
    memory_usage: string
    cache_hit_rate: number
    error_rate: number
    active_connections: number
  }
  uptime: number
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded'
  response_time?: number
  last_check: string
  errors?: string[]
}

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

export function RealtimeDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds

  const fetchHealthData = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health')
      if (!response.ok) throw new Error(`Health API error: ${response.status}`)
      const data = await response.json()
      setHealth(data.data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch health data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch health data')
    }
  }, [])

  const fetchMetricsData = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/metrics?timeframe=1h')
      if (!response.ok) throw new Error(`Metrics API error: ${response.status}`)
      const data = await response.json()
      setMetrics(data.data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch metrics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics data')
    }
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchHealthData(), fetchMetricsData()])
    } finally {
      setLoading(false)
    }
  }, [fetchHealthData, fetchMetricsData])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-500'
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500'
      case 'critical':
      case 'down':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return '정상'
      case 'warning':
      case 'degraded':
        return '경고'
      case 'critical':
      case 'down':
        return '위험'
      default:
        return '알 수 없음'
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (loading && !health && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">실시간 모니터링 대시보드</h1>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <QueryErrorBoundary onRetry={refreshData}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">실시간 모니터링 대시보드</h1>
            <p className="text-gray-600">
              마지막 업데이트: {health ? new Date(health.timestamp).toLocaleTimeString('ko-KR') : '-'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? '자동 새로고침 ON' : '자동 새로고침 OFF'}
            </Button>
            <Button onClick={refreshData} size="sm" disabled={loading}>
              {loading ? '새로고침 중...' : '새로고침'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* System Health Overview */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getStatusColor(health.overall)}`}></span>
                시스템 상태: {getStatusText(health.overall)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(health.services).map(([service, status]) => (
                  <div key={service} className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(status.status)}`}></div>
                    <p className="text-sm font-medium capitalize">{service}</p>
                    <p className="text-xs text-gray-500">
                      {status.response_time ? `${status.response_time}ms` : '-'}
                    </p>
                    {status.errors && status.errors.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">{status.errors[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{health.metrics.response_time}ms</div>
                  <p className="text-xs text-gray-500">평균 응답 시간</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{Math.round(health.metrics.cache_hit_rate * 100)}%</div>
                  <p className="text-xs text-gray-500">캐시 히트율</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{health.metrics.active_connections}</div>
                  <p className="text-xs text-gray-500">활성 연결</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
                  <p className="text-xs text-gray-500">가동 시간</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Performance */}
            <Card>
              <CardHeader>
                <CardTitle>API 성능</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">평균 응답시간</p>
                    <p className="text-lg font-semibold">{metrics.api.response_times.avg}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">P95 응답시간</p>
                    <p className="text-lg font-semibold">{metrics.api.response_times.p95}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">분당 요청</p>
                    <p className="text-lg font-semibold">{metrics.api.requests_per_minute}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">오류율</p>
                    <p className="text-lg font-semibold">{metrics.api.error_rate}%</p>
                  </div>
                </div>

                {metrics.api.endpoints.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">주요 엔드포인트</h4>
                    <div className="space-y-2">
                      {metrics.api.endpoints.slice(0, 5).map((endpoint, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            <Badge variant="outline" className="mr-2">{endpoint.method}</Badge>
                            {endpoint.path}
                          </span>
                          <span className="font-medium">{endpoint.avg_response_time}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle>시스템 리소스</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">CPU 사용률</span>
                    <span className="text-sm font-medium">{metrics.system.cpu_usage}%</span>
                  </div>
                  <Progress value={metrics.system.cpu_usage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">메모리 사용률</span>
                    <span className="text-sm font-medium">
                      {metrics.system.memory_usage.used}MB / {metrics.system.memory_usage.total}MB
                    </span>
                  </div>
                  <Progress value={metrics.system.memory_usage.percentage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">디스크 사용률</span>
                    <span className="text-sm font-medium">
                      {metrics.system.disk_usage.used}GB / {metrics.system.disk_usage.total}GB
                    </span>
                  </div>
                  <Progress value={metrics.system.disk_usage.percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-gray-500">네트워크 입력</p>
                    <p className="text-sm font-semibold">{formatBytes(metrics.system.network.bytes_in)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">네트워크 출력</p>
                    <p className="text-sm font-semibold">{formatBytes(metrics.system.network.bytes_out)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Performance */}
            <Card>
              <CardHeader>
                <CardTitle>캐시 성능</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">히트율</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.cache.hit_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">미스율</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.cache.miss_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">캐시 항목</p>
                    <p className="text-lg font-semibold">{metrics.cache.entries.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">메모리 사용량</p>
                    <p className="text-lg font-semibold">{metrics.cache.memory_usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>사용자 활동</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">활성 사용자</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.user_activity.active_users}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">페이지 뷰</p>
                    <p className="text-2xl font-bold">{metrics.user_activity.page_views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">순 방문자</p>
                    <p className="text-lg font-semibold">{metrics.user_activity.unique_visitors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">이탈률</p>
                    <p className="text-lg font-semibold">{metrics.user_activity.bounce_rate}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">평균 세션 시간</p>
                  <p className="text-lg font-semibold">{Math.round(metrics.user_activity.avg_session_duration / 60)}분</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </QueryErrorBoundary>
  )
}