'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, Package, Zap } from 'lucide-react'

interface BundleStats {
  totalSize: number
  gzippedSize: number
  chunks: {
    name: string
    size: number
    gzippedSize: number
    type: 'main' | 'vendor' | 'page' | 'async'
  }[]
  recommendations: {
    type: 'warning' | 'info' | 'success'
    message: string
    impact: 'high' | 'medium' | 'low'
  }[]
}

export function BundleAnalyzer() {
  const [stats, setStats] = useState<BundleStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeBundles = async () => {
    setLoading(true)
    setError(null)

    try {
      // Mock bundle analysis for demonstration
      // In real implementation, this would fetch from webpack-bundle-analyzer or similar
      const mockStats: BundleStats = {
        totalSize: 650000, // 650KB
        gzippedSize: 180000, // 180KB
        chunks: [
          {
            name: 'main',
            size: 250000,
            gzippedSize: 70000,
            type: 'main'
          },
          {
            name: 'vendors',
            size: 300000,
            gzippedSize: 85000,
            type: 'vendor'
          },
          {
            name: 'react',
            size: 150000,
            gzippedSize: 45000,
            type: 'vendor'
          },
          {
            name: 'ui',
            size: 80000,
            gzippedSize: 22000,
            type: 'async'
          },
          {
            name: 'monitoring',
            size: 70000,
            gzippedSize: 20000,
            type: 'async'
          }
        ],
        recommendations: [
          {
            type: 'success',
            message: '번들 크기가 최적화되었습니다 (< 1MB)',
            impact: 'low'
          },
          {
            type: 'info',
            message: 'lazy loading으로 초기 로드 성능이 개선되었습니다',
            impact: 'medium'
          },
          {
            type: 'warning',
            message: 'vendor 번들이 큽니다. 더 세분화를 고려하세요',
            impact: 'medium'
          }
        ]
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setStats(mockStats)
    } catch (err) {
      setError('번들 분석 중 오류가 발생했습니다')
      console.error('Bundle analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getChunkColor = (type: string): string => {
    switch (type) {
      case 'main': return 'bg-blue-500'
      case 'vendor': return 'bg-green-500'
      case 'page': return 'bg-yellow-500'
      case 'async': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    // Auto-analyze on mount
    analyzeBundles()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            번들 분석기
          </CardTitle>
          <Button
            onClick={analyzeBundles}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            {loading ? '분석 중...' : '다시 분석'}
          </Button>
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
              <span className="ml-2">번들을 분석하고 있습니다...</span>
            </div>
          )}

          {stats && (
            <div className="space-y-6">
              {/* 전체 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">전체 크기</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatSize(stats.totalSize)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">압축 크기</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatSize(stats.gzippedSize)}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">압축률</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round((1 - stats.gzippedSize / stats.totalSize) * 100)}%
                  </div>
                </div>
              </div>

              {/* 청크별 분석 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">청크별 분석</h3>
                <div className="space-y-3">
                  {stats.chunks.map((chunk, index) => {
                    const percentage = (chunk.size / stats.totalSize) * 100
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getChunkColor(chunk.type)}`} />
                            <span className="font-medium">{chunk.name}</span>
                            <span className="text-sm text-gray-500 capitalize">
                              ({chunk.type})
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatSize(chunk.size)} → {formatSize(chunk.gzippedSize)}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getChunkColor(chunk.type)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 추천사항 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">최적화 추천사항</h3>
                <div className="space-y-3">
                  {stats.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="font-medium">{rec.message}</div>
                        <div className="text-sm text-gray-500">
                          성능 영향: {rec.impact === 'high' ? '높음' : rec.impact === 'medium' ? '보통' : '낮음'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 성능 점수 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">성능 점수</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>번들 크기 최적화</span>
                    <span className="font-medium text-green-600">우수</span>
                  </div>
                  <div className="flex justify-between">
                    <span>코드 분할</span>
                    <span className="font-medium text-green-600">우수</span>
                  </div>
                  <div className="flex justify-between">
                    <span>압축 효율성</span>
                    <span className="font-medium text-blue-600">양호</span>
                  </div>
                  <div className="flex justify-between">
                    <span>lazy loading</span>
                    <span className="font-medium text-green-600">우수</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}