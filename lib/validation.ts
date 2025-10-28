// Input validation utilities for security
export class ValidationUtils {
  // Safe integer parsing with validation
  static safeParseInt(value: string | null, defaultValue: number, min: number = 1, max: number = 1000): number {
    if (!value) return defaultValue

    // Remove any non-digit characters except minus sign
    const cleaned = value.replace(/[^\d-]/g, '')
    if (!cleaned || cleaned === '-') return defaultValue

    const parsed = parseInt(cleaned, 10)

    // Check for parsing errors (NaN)
    if (isNaN(parsed)) return defaultValue

    // Apply min/max constraints
    if (parsed < min) return min
    if (parsed > max) return max

    return parsed
  }

  // Safe string validation with length limits
  static safeString(value: string | null, maxLength: number = 1000): string {
    if (!value || typeof value !== 'string') return ''

    // Basic XSS prevention - remove script tags and suspicious content
    const cleaned = value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')

    return cleaned.slice(0, maxLength).trim()
  }

  // Validate pagination parameters
  static validatePagination(searchParams: URLSearchParams) {
    return {
      page: this.safeParseInt(searchParams.get('page'), 1, 1, 1000),
      limit: this.safeParseInt(searchParams.get('limit'), 20, 1, 100)
    }
  }

  // Validate search query
  static validateSearchQuery(query: string | null): string {
    if (!query) return ''

    // Remove potential SQL injection patterns
    const cleaned = query
      .replace(/['"`;\\]/g, '') // Remove quotes and SQL metacharacters
      .replace(/\b(DROP|DELETE|UPDATE|INSERT|SELECT|UNION|ALTER|CREATE)\b/gi, '') // Remove SQL keywords
      .trim()

    return cleaned.slice(0, 200) // Limit search query length
  }

  // Validate ID parameters (UUID or integer)
  static validateId(id: string): boolean {
    if (!id) return false

    // Check for UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (uuidRegex.test(id)) return true

    // Check for safe integer
    const intId = parseInt(id, 10)
    return !isNaN(intId) && intId > 0 && intId < Number.MAX_SAFE_INTEGER
  }

  // Advanced SQL injection protection for filter parameters
  static sanitizeFilterParam(param: string | null): string | null {
    if (!param) return null

    // Remove dangerous SQL patterns
    const dangerous = [
      /\bDROP\b/gi, /\bDELETE\b/gi, /\bUPDATE\b/gi, /\bINSERT\b/gi,
      /\bSELECT\b/gi, /\bUNION\b/gi, /\bALTER\b/gi, /\bCREATE\b/gi,
      /\bEXEC\b/gi, /\bDECLARE\b/gi, /\bGRANT\b/gi, /\bREVOKE\b/gi,
      /['"`;\\]/g, // SQL metacharacters
      /--/g, // SQL comments
      /\/\*/g, /\*\//g, // Block comments
      /<script/gi, /<\/script>/gi // XSS prevention
    ]

    let cleaned = param
    dangerous.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '')
    })

    return cleaned.trim().slice(0, 100) || null
  }

  // Validate and sanitize content input
  static sanitizeContent(content: string | null, maxLength: number = 10000): string {
    if (!content) return ''

    // Basic HTML sanitization - remove dangerous tags
    const cleaned = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')

    return cleaned.slice(0, maxLength).trim()
  }

  // Rate limit check (basic implementation)
  static checkRateLimit(userId: string, action: string): boolean {
    // Simple in-memory rate limiting (production should use Redis)
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map()
    }

    const key = `${userId}:${action}`
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = action === 'post' ? 5 : 20

    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, [])
    }

    const requests = this.rateLimitStore.get(key)!
    const recentRequests = requests.filter((time: number) => now - time < windowMs)

    if (recentRequests.length >= maxRequests) {
      return false // Rate limit exceeded
    }

    recentRequests.push(now)
    this.rateLimitStore.set(key, recentRequests)
    return true
  }

  private static rateLimitStore: Map<string, number[]> | undefined
}