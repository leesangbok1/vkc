export interface SystemMetrics {
  timestamp: string
  cpu: {
    usage: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
    free: number
  }
  disk: {
    used: number
    total: number
    percentage: number
    free: number
  }
  network: {
    bytes_in: number
    bytes_out: number
    packets_in: number
    packets_out: number
  }
  process: {
    pid: number
    memory: number
    cpu: number
    uptime: number
  }
}

export interface ApiMetrics {
  endpoint: string
  method: string
  status_code: number
  response_time: number
  timestamp: string
  error?: string
}

export interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    total: number
  }
  queries: {
    total: number
    slow: number
    errors: number
    avg_duration: number
  }
  tables: {
    name: string
    size: number
    rows: number
  }[]
}

export interface CacheMetrics {
  hit_rate: number
  miss_rate: number
  entries: number
  size: number
  memory_usage: string
  operations: {
    gets: number
    sets: number
    deletes: number
    evictions: number
  }
}

export interface UserActivityMetrics {
  active_users: number
  page_views: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
  top_pages: {
    path: string
    views: number
    unique_views: number
  }[]
  user_agents: {
    browser: string
    count: number
  }[]
}

class SystemMetricsCollector {
  private static instance: SystemMetricsCollector
  private apiMetrics: ApiMetrics[] = []
  private userSessions: Map<string, { start: number; pages: number }> = new Map()

  static getInstance(): SystemMetricsCollector {
    if (!SystemMetricsCollector.instance) {
      SystemMetricsCollector.instance = new SystemMetricsCollector()
    }
    return SystemMetricsCollector.instance
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // Edge Runtime 호환성을 위한 환경 체크
    const isNodeEnvironment = typeof globalThis.process !== 'undefined' &&
                              globalThis.process.versions &&
                              globalThis.process.versions.node

    if (!isNodeEnvironment) {
      // Edge Runtime 또는 브라우저 환경에서는 기본값 반환
      return {
        timestamp: new Date().toISOString(),
        cpu: { usage: 0, load: [0, 0, 0] },
        memory: { used: 0, total: 0, percentage: 0, free: 0 },
        disk: { used: 0, total: 0, percentage: 0, free: 0 },
        network: { bytes_in: 0, bytes_out: 0, packets_in: 0, packets_out: 0 },
        process: { pid: 0, memory: 0, cpu: 0, uptime: 0 }
      }
    }

    try {
      // Edge Runtime 호환을 위한 안전한 모듈 로딩
      const processModule = globalThis.process
      const osModule = await import('os').catch(() => null)

      if (!processModule || !osModule) {
        throw new Error('Node.js modules not available')
      }

      const cpuUsage = processModule.cpuUsage?.() || { user: 0, system: 0 }
      const memoryUsage = processModule.memoryUsage?.()

      return {
        timestamp: new Date().toISOString(),
        cpu: {
          usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000), // Convert to percentage
          load: osModule.loadavg?.()
        },
        memory: {
          used: Math.round((memoryUsage?.heapUsed || 0) / 1024 / 1024), // MB
          total: Math.round((memoryUsage?.heapTotal || 0) / 1024 / 1024), // MB
          percentage: Math.round(((memoryUsage?.heapUsed || 0) / (memoryUsage?.heapTotal || 1)) * 100),
          free: Math.round(((memoryUsage?.heapTotal || 0) - (memoryUsage?.heapUsed || 0)) / 1024 / 1024)
        },
        disk: {
          used: 0, // Would need fs.statSync in Node.js environment
          total: 0,
          percentage: 0,
          free: 0
        },
        network: {
          bytes_in: 0, // Would need network monitoring
          bytes_out: 0,
          packets_in: 0,
          packets_out: 0
        },
        process: {
          pid: processModule.pid || 0,
          memory: Math.round((memoryUsage?.rss || 0) / 1024 / 1024), // MB
          cpu: 0, // Would need cpu monitoring
          uptime: Math.round(processModule.uptime ? processModule.uptime() : 0)
        }
      }
    } catch (error) {
      // Node.js API 사용 불가 시 기본값 반환
      console.warn('System metrics collection failed (Edge Runtime):', error)
      return {
        timestamp: new Date().toISOString(),
        cpu: { usage: 0, load: [0, 0, 0] },
        memory: { used: 0, total: 0, percentage: 0, free: 0 },
        disk: { used: 0, total: 0, percentage: 0, free: 0 },
        network: { bytes_in: 0, bytes_out: 0, packets_in: 0, packets_out: 0 },
        process: { pid: 0, memory: 0, cpu: 0, uptime: 0 }
      }
    }
  }

  recordApiCall(metrics: ApiMetrics): void {
    this.apiMetrics.push(metrics)

    // Keep only last 1000 entries
    if (this.apiMetrics.length > 1000) {
      this.apiMetrics = this.apiMetrics.slice(-1000)
    }
  }

  getApiMetrics(timeframe: string = '1h'): {
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
  } {
    const cutoff = this.getTimeframeCutoff(timeframe)
    const recentMetrics = this.apiMetrics.filter(m => new Date(m.timestamp) > cutoff)

    if (recentMetrics.length === 0) {
      return {
        response_times: { avg: 0, p50: 0, p95: 0, p99: 0 },
        requests_per_minute: 0,
        error_rate: 0,
        endpoints: []
      }
    }

    const responseTimes = recentMetrics.map(m => m.response_time).sort((a, b) => a - b)
    const errors = recentMetrics.filter(m => m.status_code >= 400).length

    // Group by endpoint
    const endpointGroups = new Map<string, ApiMetrics[]>()
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      if (!endpointGroups.has(key)) {
        endpointGroups.set(key, [])
      }
      endpointGroups.get(key)!.push(metric)
    })

    const endpoints = Array.from(endpointGroups.entries()).map(([key, metrics]) => {
      const [method, path] = key.split(' ', 2)
      const responseTimes = metrics.map(m => m.response_time)
      const errors = metrics.filter(m => m.status_code >= 400)

      return {
        path,
        method,
        avg_response_time: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        requests_count: metrics.length,
        error_count: errors.length
      }
    }).sort((a, b) => b.requests_count - a.requests_count)

    return {
      response_times: {
        avg: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        p50: responseTimes[Math.floor(responseTimes.length * 0.5)] || 0,
        p95: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
        p99: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0
      },
      requests_per_minute: Math.round(recentMetrics.length / this.getTimeframeMinutes(timeframe)),
      error_rate: Math.round((errors / recentMetrics.length) * 100),
      endpoints: endpoints.slice(0, 10) // Top 10
    }
  }

  recordUserActivity(sessionId: string, page: string): void {
    const now = Date.now()

    if (!this.userSessions.has(sessionId)) {
      this.userSessions.set(sessionId, { start: now, pages: 1 })
    } else {
      const session = this.userSessions.get(sessionId)!
      session.pages++
    }
  }

  getUserActivityMetrics(): UserActivityMetrics {
    const now = Date.now()
    const hourAgo = now - (60 * 60 * 1000)

    // Clean old sessions (older than 30 minutes)
    const thirtyMinutesAgo = now - (30 * 60 * 1000)
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (session.start < thirtyMinutesAgo) {
        this.userSessions.delete(sessionId)
      }
    }

    const activeSessions = Array.from(this.userSessions.values())
    const recentApiCalls = this.apiMetrics.filter(m => new Date(m.timestamp).getTime() > hourAgo)

    const pageViews = recentApiCalls.filter(m => m.method === 'GET' && !m.endpoint.startsWith('/api')).length
    const uniqueVisitors = this.userSessions.size
    const totalSessionTime = activeSessions.reduce((sum, session) => sum + (now - session.start), 0)
    const avgSessionDuration = uniqueVisitors > 0 ? totalSessionTime / uniqueVisitors / 1000 : 0

    return {
      active_users: uniqueVisitors,
      page_views: pageViews,
      unique_visitors: uniqueVisitors,
      bounce_rate: 0, // Would need proper analytics tracking
      avg_session_duration: Math.round(avgSessionDuration),
      top_pages: [],
      user_agents: []
    }
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date()
    switch (timeframe) {
      case '5m':
        return new Date(now.getTime() - 5 * 60 * 1000)
      case '15m':
        return new Date(now.getTime() - 15 * 60 * 1000)
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000)
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 60 * 60 * 1000)
    }
  }

  private getTimeframeMinutes(timeframe: string): number {
    switch (timeframe) {
      case '5m': return 5
      case '15m': return 15
      case '1h': return 60
      case '24h': return 24 * 60
      default: return 60
    }
  }
}

export const systemMetrics = SystemMetricsCollector.getInstance()