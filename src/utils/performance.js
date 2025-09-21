// 성능 최적화 유틸리티
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window
  }

  // 페이지 로딩 시간 측정
  measurePageLoad() {
    if (!this.isEnabled) return null

    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(this.getPageLoadMetrics())
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            resolve(this.getPageLoadMetrics())
          }, 0)
        })
      }
    })
  }

  getPageLoadMetrics() {
    if (!this.isEnabled) return null

    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')

    const fcp = paint.find(p => p.name === 'first-contentful-paint')
    const lcp = this.getLargestContentfulPaint()

    return {
      // 네트워크 타이밍
      dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcp: Math.round(navigation.connectEnd - navigation.connectStart),
      request: Math.round(navigation.responseStart - navigation.requestStart),
      response: Math.round(navigation.responseEnd - navigation.responseStart),

      // 렌더링 타이밍
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
      loaded: Math.round(navigation.loadEventEnd - navigation.navigationStart),

      // Core Web Vitals
      fcp: fcp ? Math.round(fcp.startTime) : null,
      lcp: lcp,

      // 전체 페이지 크기
      transferSize: navigation.transferSize,
      encodedBodySize: navigation.encodedBodySize,
      decodedBodySize: navigation.decodedBodySize
    }
  }

  // Largest Contentful Paint 측정
  getLargestContentfulPaint() {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(null)
        return
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        resolve(Math.round(lastEntry.startTime))
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })

        // 10초 후 타임아웃
        setTimeout(() => {
          observer.disconnect()
          resolve(null)
        }, 10000)
      } catch (error) {
        resolve(null)
      }
    })
  }

  // Cumulative Layout Shift 측정
  measureCLS() {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(null)
        return
      }

      let clsValue = 0
      let sessionValue = 0
      let sessionEntries = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value
              sessionEntries.push(entry)
            } else {
              sessionValue = entry.value
              sessionEntries = [entry]
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue
            }
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })

        // 페이지 언로드 시 결과 반환
        window.addEventListener('beforeunload', () => {
          observer.disconnect()
          resolve(clsValue)
        })

        // 30초 후 타임아웃
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 30000)
      } catch (error) {
        resolve(null)
      }
    })
  }

  // First Input Delay 측정
  measureFID() {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(null)
        return
      }

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          resolve(Math.round(entry.processingStart - entry.startTime))
          observer.disconnect()
          return
        }
      })

      try {
        observer.observe({ entryTypes: ['first-input'] })

        // 30초 후 타임아웃
        setTimeout(() => {
          observer.disconnect()
          resolve(null)
        }, 30000)
      } catch (error) {
        resolve(null)
      }
    })
  }

  // 메모리 사용량 측정
  measureMemoryUsage() {
    if (!this.isEnabled || !('memory' in performance)) {
      return null
    }

    const memory = performance.memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100 // MB
    }
  }

  // 리소스 로딩 시간 분석
  analyzeResourceTiming() {
    if (!this.isEnabled) return []

    const resources = performance.getEntriesByType('resource')
    const analysis = []

    resources.forEach(resource => {
      const timing = {
        name: resource.name,
        type: this.getResourceType(resource.name),
        size: resource.transferSize,
        duration: Math.round(resource.duration),
        dns: Math.round(resource.domainLookupEnd - resource.domainLookupStart),
        tcp: Math.round(resource.connectEnd - resource.connectStart),
        request: Math.round(resource.responseStart - resource.requestStart),
        response: Math.round(resource.responseEnd - resource.responseStart),
        cache: resource.transferSize === 0 ? 'cached' : 'network'
      }

      analysis.push(timing)
    })

    return analysis.sort((a, b) => b.duration - a.duration)
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg')) return 'image'
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'font'
    return 'other'
  }

  // 사용자 타이밍 API
  mark(name) {
    if (this.isEnabled) {
      performance.mark(name)
    }
  }

  measure(name, startMark, endMark) {
    if (this.isEnabled) {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name, 'measure')[0]
      return Math.round(measure.duration)
    }
    return null
  }

  // 컴포넌트 렌더링 시간 측정
  measureComponentRender(componentName, renderFn) {
    const startMark = `${componentName}-render-start`
    const endMark = `${componentName}-render-end`
    const measureName = `${componentName}-render-duration`

    this.mark(startMark)
    const result = renderFn()
    this.mark(endMark)

    const duration = this.measure(measureName, startMark, endMark)

    console.log(`🎯 ${componentName} 렌더링 시간: ${duration}ms`)

    return { result, duration }
  }

  // 번들 크기 분석
  analyzeBundleSize() {
    return new Promise((resolve) => {
      if (!this.isEnabled) {
        resolve(null)
        return
      }

      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))

      Promise.all([
        ...scripts.map(script => this.getResourceSize(script.src)),
        ...stylesheets.map(style => this.getResourceSize(style.href))
      ]).then(sizes => {
        const totalSize = sizes.reduce((sum, size) => sum + (size || 0), 0)
        resolve({
          totalSize: Math.round(totalSize / 1024 * 100) / 100, // KB
          scripts: sizes.slice(0, scripts.length),
          stylesheets: sizes.slice(scripts.length)
        })
      })
    })
  }

  getResourceSize(url) {
    const resource = performance.getEntriesByName(url)[0]
    return resource ? resource.transferSize : null
  }

  // 성능 보고서 생성
  async generateReport() {
    console.log('📊 성능 분석 시작...')

    const [
      pageLoad,
      lcp,
      cls,
      fid,
      memory,
      resources,
      bundleSize
    ] = await Promise.all([
      this.measurePageLoad(),
      this.getLargestContentfulPaint(),
      this.measureCLS(),
      this.measureFID(),
      Promise.resolve(this.measureMemoryUsage()),
      Promise.resolve(this.analyzeResourceTiming()),
      this.analyzeBundleSize()
    ])

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      metrics: {
        pageLoad,
        coreWebVitals: {
          lcp,
          cls,
          fid
        },
        memory,
        bundleSize
      },
      resources: resources.slice(0, 10), // 상위 10개만
      recommendations: this.generateRecommendations({
        pageLoad,
        lcp,
        cls,
        fid,
        memory,
        bundleSize
      })
    }

    console.log('📈 성능 보고서:', report)
    return report
  }

  generateRecommendations(metrics) {
    const recommendations = []

    // LCP 최적화
    if (metrics.lcp > 2500) {
      recommendations.push({
        type: 'LCP',
        level: 'high',
        message: 'Largest Contentful Paint가 느립니다. 이미지 최적화나 중요한 리소스의 preload를 고려하세요.',
        target: '2.5초 이하'
      })
    }

    // CLS 최적화
    if (metrics.cls > 0.1) {
      recommendations.push({
        type: 'CLS',
        level: 'medium',
        message: 'Cumulative Layout Shift가 높습니다. 이미지와 광고에 크기를 명시하세요.',
        target: '0.1 이하'
      })
    }

    // FID 최적화
    if (metrics.fid > 100) {
      recommendations.push({
        type: 'FID',
        level: 'high',
        message: 'First Input Delay가 높습니다. JavaScript 실행 시간을 줄이세요.',
        target: '100ms 이하'
      })
    }

    // 메모리 최적화
    if (metrics.memory && metrics.memory.used > 50) {
      recommendations.push({
        type: 'Memory',
        level: 'medium',
        message: '메모리 사용량이 높습니다. 메모리 누수를 확인하세요.',
        target: '50MB 이하'
      })
    }

    // 번들 크기 최적화
    if (metrics.bundleSize && metrics.bundleSize.totalSize > 1000) {
      recommendations.push({
        type: 'Bundle Size',
        level: 'high',
        message: '번들 크기가 큽니다. 코드 분할이나 tree shaking을 고려하세요.',
        target: '1MB 이하'
      })
    }

    return recommendations
  }

  // 성능 모니터링 시작
  startMonitoring() {
    if (!this.isEnabled) return

    // 정기적으로 메트릭 수집
    setInterval(() => {
      const memory = this.measureMemoryUsage()
      if (memory) {
        this.metrics.set('memory', memory)
      }
    }, 10000) // 10초마다

    // 페이지 언로드 시 최종 보고서
    window.addEventListener('beforeunload', () => {
      this.generateReport().then(report => {
        // 로컬 스토리지에 저장 또는 서버로 전송
        localStorage.setItem('performanceReport', JSON.stringify(report))
      })
    })

    console.log('🔍 성능 모니터링 시작')
  }

  // 성능 데이터 저장
  saveMetrics(metrics) {
    const key = `perf_${Date.now()}`
    localStorage.setItem(key, JSON.stringify(metrics))

    // 오래된 데이터 정리 (최근 10개만 유지)
    const keys = Object.keys(localStorage).filter(k => k.startsWith('perf_'))
    if (keys.length > 10) {
      keys.sort().slice(0, keys.length - 10).forEach(k => {
        localStorage.removeItem(k)
      })
    }
  }

  // 저장된 성능 데이터 조회
  getStoredMetrics() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('perf_'))
    return keys.sort().reverse().slice(0, 10).map(key => {
      try {
        return JSON.parse(localStorage.getItem(key))
      } catch {
        return null
      }
    }).filter(Boolean)
  }
}

// 이미지 레이지 로딩
export class LazyImageLoader {
  constructor() {
    this.observer = null
    this.images = new Set()
    this.initialize()
  }

  initialize() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      )
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        this.loadImage(img)
        this.observer.unobserve(img)
        this.images.delete(img)
      }
    })
  }

  loadImage(img) {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.removeAttribute('data-src')
      img.classList.add('loaded')
    }
  }

  observe(img) {
    if (this.observer) {
      this.observer.observe(img)
      this.images.add(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.images.clear()
    }
  }
}

// 디바운스 및 스로틀링 유틸리티
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 메모이제이션
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map()

  return (...args) => {
    const key = getKey(...args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)

    // 캐시 크기 제한
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor()
export const lazyImageLoader = new LazyImageLoader()

// React 개발 도구 함수
export const withPerformanceLogging = (Component, componentName) => {
  return React.forwardRef((props, ref) => {
    const renderStart = performance.now()

    React.useEffect(() => {
      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart

      if (renderTime > 16.67) { // 60fps 기준
        console.warn(`⚠️ ${componentName} 렌더링 시간이 깁니다: ${renderTime.toFixed(2)}ms`)
      }
    })

    return React.createElement(Component, { ...props, ref })
  })
}

export default {
  PerformanceMonitor,
  LazyImageLoader,
  performanceMonitor,
  lazyImageLoader,
  debounce,
  throttle,
  memoize,
  withPerformanceLogging
}