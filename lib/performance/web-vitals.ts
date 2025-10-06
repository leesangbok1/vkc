'use client'

import { useState, useEffect } from 'react'
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
  navigationType?: string
}

export interface PerformanceEntry {
  timestamp: number
  url: string
  metrics: WebVitalsMetric[]
  deviceInfo: {
    userAgent: string
    connection?: string
    memory?: number
  }
}

class WebVitalsTracker {
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private callbacks: Array<(metric: WebVitalsMetric) => void> = []
  private initialized = false

  init() {
    if (this.initialized || typeof window === 'undefined') return

    this.initialized = true

    // Core Web Vitals 수집
    onCLS(this.handleMetric.bind(this))
    onFID(this.handleMetric.bind(this))
    onFCP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))

    // 페이지 언로드 시 메트릭 전송
    window.addEventListener('beforeunload', () => {
      this.sendMetrics()
    })

    // Visibility change 이벤트로 히든 상태에서 메트릭 전송
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics()
      }
    })
  }

  private handleMetric(metric: Metric) {
    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType
    }

    this.metrics.set(metric.name, webVitalsMetric)

    // 콜백 호출
    this.callbacks.forEach(callback => callback(webVitalsMetric))

    // 실시간 로깅 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: webVitalsMetric.rating,
        id: metric.id
      })
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  private async sendMetrics() {
    if (this.metrics.size === 0) return

    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: Array.from(this.metrics.values()),
      deviceInfo: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType,
        memory: (performance as any).memory?.totalJSHeapSize
      }
    }

    try {
      // Beacon API 사용 (비동기, 페이지 언로드에도 안전)
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/monitoring/web-vitals', JSON.stringify(entry))
      } else {
        // 폴백: 일반 fetch (keepalive)
        fetch('/api/monitoring/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
          keepalive: true
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Failed to send web vitals:', error)
    }
  }

  onMetric(callback: (metric: WebVitalsMetric) => void) {
    this.callbacks.push(callback)
  }

  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values())
  }

  getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name)
  }

  clear() {
    this.metrics.clear()
  }
}

// 싱글톤 인스턴스
export const webVitalsTracker = new WebVitalsTracker()

// React Hook for Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])

  useEffect(() => {
    webVitalsTracker.init()

    const handleMetric = (metric: WebVitalsMetric) => {
      setMetrics(prevMetrics => {
        const updatedMetrics = prevMetrics.filter(m => m.name !== metric.name)
        return [...updatedMetrics, metric]
      })
    }

    webVitalsTracker.onMetric(handleMetric)

    // 기존 메트릭 로드
    setMetrics(webVitalsTracker.getMetrics())
  }, [])

  return {
    metrics,
    getMetric: (name: string) => metrics.find(m => m.name === name),
    isLoading: metrics.length === 0
  }
}

// Performance Observer for custom metrics
export class CustomPerformanceTracker {
  private observers: PerformanceObserver[] = []

  init() {
    if (typeof window === 'undefined') return

    // Navigation timing
    this.observeNavigationTiming()

    // Resource timing
    this.observeResourceTiming()

    // Long tasks
    this.observeLongTasks()

    // Layout shifts (추가적인 CLS 추적)
    this.observeLayoutShifts()
  }

  private observeNavigationTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.trackCustomMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
            this.trackCustomMetric('loadComplete', navEntry.loadEventEnd - navEntry.loadEventStart)
          }
        })
      })

      observer.observe({ entryTypes: ['navigation'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Navigation timing observer not supported:', error)
    }
  }

  private observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming

            // 이미지 로딩 시간 추적
            if (resourceEntry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
              this.trackCustomMetric('imageLoadTime', resourceEntry.duration)
            }

            // API 요청 시간 추적
            if (resourceEntry.name.includes('/api/')) {
              this.trackCustomMetric('apiResponseTime', resourceEntry.duration)
            }
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Resource timing observer not supported:', error)
    }
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'longtask') {
            this.trackCustomMetric('longTask', entry.duration)
          }
        })
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Long task observer not supported:', error)
    }
  }

  private observeLayoutShifts() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.trackCustomMetric('layoutShift', (entry as any).value)
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Layout shift observer not supported:', error)
    }
  }

  private trackCustomMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Custom Metric] ${name}:`, value)
    }

    // 커스텀 이벤트 발송
    window.dispatchEvent(new CustomEvent('customPerformanceMetric', {
      detail: { name, value }
    }))
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

export const customPerformanceTracker = new CustomPerformanceTracker()

// Auto-initialize (클라이언트 사이드에서만)
if (typeof window !== 'undefined') {
  webVitalsTracker.init()
  customPerformanceTracker.init()
}