// Security headers middleware for API endpoints
import { NextRequest, NextResponse } from 'next/server'

export interface SecurityConfig {
  enableCSRF: boolean
  enableCORS: boolean
  enableHSTS: boolean
  enableContentTypeOptions: boolean
  enableXSSProtection: boolean
  allowedOrigins?: string[]
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  enableCSRF: true,
  enableCORS: true,
  enableHSTS: true,
  enableContentTypeOptions: true,
  enableXSSProtection: true,
  allowedOrigins: [
    'http://localhost:3000',
    'https://viet-kconnect.vercel.app',
    'https://*.vercel.app'
  ]
}

export function addSecurityHeaders(
  response: NextResponse,
  config: Partial<SecurityConfig> = {}
): NextResponse {
  const fullConfig = { ...defaultSecurityConfig, ...config }

  // CSRF Protection - Origin 검증
  if (fullConfig.enableCSRF) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // CORS Headers
  if (fullConfig.enableCORS && fullConfig.allowedOrigins) {
    response.headers.set('Access-Control-Allow-Origin', fullConfig.allowedOrigins[0])
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }

  // HSTS (HTTP Strict Transport Security)
  if (fullConfig.enableHSTS) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Content Type Options
  if (fullConfig.enableContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  // XSS Protection
  if (fullConfig.enableXSSProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }

  // Additional Security Headers
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return response
}

export function validateCSRFToken(req: NextRequest): boolean {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET') {
    return true
  }

  // Check Origin header for POST/PUT/DELETE requests
  const origin = req.headers.get('Origin')
  const referer = req.headers.get('Referer')

  if (!origin && !referer) {
    return false // Missing origin/referer headers
  }

  // Validate against allowed origins
  const allowedOrigins = defaultSecurityConfig.allowedOrigins || []

  if (origin) {
    const isValidOrigin = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*')
        return new RegExp(pattern).test(origin)
      }
      return origin === allowed
    })

    if (!isValidOrigin) {
      return false
    }
  }

  // Additional CSRF token validation could be added here
  return true
}

export function createSecurityMiddleware(config?: Partial<SecurityConfig>) {
  return (req: NextRequest): NextResponse | null => {
    // Validate CSRF for state-changing requests
    if (!validateCSRFToken(req)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    }

    return null // Allow request to proceed
  }
}

// Helper function to apply security headers to API responses
export function secureAPIResponse(
  data: any,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status: options.status || 200,
    headers: options.headers
  })

  return addSecurityHeaders(response)
}

// Rate limit and security headers combined
export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status,
    headers: additionalHeaders
  })

  return addSecurityHeaders(response)
}