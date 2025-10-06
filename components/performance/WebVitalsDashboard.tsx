'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Clock,
  Eye,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useWebVitals } from '@/lib/performance/web-vitals'

interface WebVitalsData {
  summary: {
    totalSamples: number
    lastUpdated: string
    averages: Record<string, {
      value: number
      rating: 'good' | 'needs-improvement' | 'poor'
      trend: 'improving' | 'stable' | 'degrading'
    }>
    percentiles: Record<string, {
      p50: number
      p75: number
      p95: number
    }>
  }
  trends: {
    hourly: Array<{
      timestamp: string
      LCP: number
      FID: number
      CLS: number
      samples: number
    }>
    byDevice: Record<string, any>
    byConnection: Record<string, any>
  }
  alerts: Array<{
    type: 'warning' | 'error'
    metric: string
    threshold: number
    currentValue: number
    affectedPages: string[]
    timestamp: string
  }>
}

export function WebVitalsDashboard() {
  const [data, setData] = useState<WebVitalsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState('24h')
  const { metrics: liveMetrics } = useWebVitals()

  const fetchWebVitalsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/monitoring/web-vitals?range=${selectedRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch web vitals data')
      }

      const vitalsData = await response.json()
      setData(vitalsData)
    } catch (err) {
      setError('Web Vitals 데이터를 불러오는데 실패했습니다')
      console.error('Web Vitals fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWebVitalsData()

    // 5분마다 자동 새로고침
    const interval = setInterval(fetchWebVitalsData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedRange])

  const formatMetricValue = (metric: string, value: number): string => {
    switch (metric) {
      case 'CLS':
        return value.toFixed(3)
      case 'FID':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`
      default:
        return value.toString()
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'LCP': return <Eye className="w-4 h-4" />
      case 'FID': return <Activity className="w-4 h-4" />
      case 'CLS': return <Gauge className="w-4 h-4" />
      case 'FCP': return <Clock className="w-4 h-4" />
      case 'TTFB': return <TrendingUp className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'degrading': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Core Web Vitals 대시보드
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md"
            >
              <option value="24h">24시간</option>
              <option value="7d">7일</option>
              <option value="30d">30일</option>
            </select>
            <Button
              onClick={fetchWebVitalsData}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">데이터를 불러오고 있습니다...</span>
            </div>
          )}

          {data && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="trends">트렌드</TabsTrigger>
                <TabsTrigger value="alerts">알림</TabsTrigger>
                <TabsTrigger value="live">실시간</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* 주요 메트릭 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(data.summary.averages).map(([metric, stats]) => (
                    <Card key={metric}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMetricIcon(metric)}
                            <span className="text-sm font-medium">{metric}</span>
                          </div>
                          {getTrendIcon(stats.trend)}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {formatMetricValue(metric, stats.value)}
                        </div>
                        <Badge className={getRatingColor(stats.rating)}>
                          {stats.rating === 'good' ? '우수' :
                           stats.rating === 'needs-improvement' ? '개선 필요' : '나쁨'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 백분위수 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>백분위수 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(data.summary.percentiles).map(([metric, percentiles]) => (
                        <div key={metric} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{metric}</span>
                            <div className="flex gap-4 text-sm">
                              <span>P50: {formatMetricValue(metric, percentiles.p50)}</span>
                              <span>P75: {formatMetricValue(metric, percentiles.p75)}</span>
                              <span>P95: {formatMetricValue(metric, percentiles.p95)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 디바이스/연결별 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>디바이스별 성능</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.trends.byDevice).map(([device, stats]: [string, any]) => (
                          <div key={device} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium capitalize">{device}</span>
                            <div className="text-sm space-x-4">
                              <span>LCP: {stats.avgLCP}ms</span>
                              <span>FID: {stats.avgFID}ms</span>
                              <span>({stats.samples} samples)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>연결별 성능</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.trends.byConnection).map(([connection, stats]: [string, any]) => (
                          <div key={connection} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium uppercase">{connection}</span>
                            <div className="text-sm space-x-4">
                              <span>LCP: {stats.avgLCP}ms</span>
                              <span>TTFB: {stats.avgTTFB}ms</span>
                              <span>({stats.samples} samples)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>시간별 트렌드</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4" />
                      <p>차트 라이브러리 통합 후 시간별 트렌드가 표시됩니다</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>성능 알림</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.alerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-gray-500">현재 활성화된 알림이 없습니다</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.alerts.map((alert, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium">
                                {alert.metric} 성능 임계값 초과
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                현재 값: {formatMetricValue(alert.metric, alert.currentValue)}
                                (임계값: {formatMetricValue(alert.metric, alert.threshold)})
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                영향받는 페이지: {alert.affectedPages.join(', ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(alert.timestamp).toLocaleString('ko-KR')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>실시간 메트릭 (현재 세션)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {liveMetrics.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4" />
                        <p>실시간 메트릭을 수집하고 있습니다...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveMetrics.map((metric, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getMetricIcon(metric.name)}
                                <span className="font-medium">{metric.name}</span>
                              </div>
                              <Badge className={getRatingColor(metric.rating)}>
                                {metric.rating === 'good' ? '우수' :
                                 metric.rating === 'needs-improvement' ? '개선 필요' : '나쁨'}
                              </Badge>
                            </div>
                            <div className="text-xl font-bold">
                              {formatMetricValue(metric.name, metric.value)}
                            </div>
                            {metric.id && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {metric.id}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}