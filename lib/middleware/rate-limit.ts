// Rate limiting middleware for API endpoints
import { NextRequest, NextResponse } from 'next/server'
import { ValidationUtils } from '@/lib/validation'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

// Default rate limit configurations for different endpoint types
export const RateLimitConfigs = {
  auth: { windowMs: 900000, maxRequests: 5 }, // 5 requests per 15 minutes for auth
  post: { windowMs: 60000, maxRequests: 10 }, // 10 posts per minute
  get: { windowMs: 60000, maxRequests: 100 }, // 100 reads per minute
  vote: { windowMs: 60000, maxRequests: 30 }, // 30 votes per minute
  search: { windowMs: 60000, maxRequests: 50 }, // 50 searches per minute
  comment: { windowMs: 60000, maxRequests: 20 } // 20 comments per minute
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (req: NextRequest, userId?: string): Promise<NextResponse | null> => {
    try {
      // Generate rate limit key
      const key = config.keyGenerator
        ? config.keyGenerator(req)
        : userId || getClientIp(req) || 'anonymous'

      // Extract action type from URL path
      const action = extractActionFromPath(req.nextUrl.pathname)

      // Check rate limit using ValidationUtils
      const allowed = ValidationUtils.checkRateLimit(key, action)

      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            details: `Maximum ${config.maxRequests} requests per ${config.windowMs / 1000} seconds`
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
            }
          }
        )
      }

      return null // Allow request to proceed
    } catch (error) {
      console.error('Rate limiting error:', error)
      return null // Allow request on error (fail open)
    }
  }
}

// Extract client IP address with proxy support
function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return (req as any).ip || null
}

// Extract action type from URL path for rate limiting categories
function extractActionFromPath(pathname: string): string {
  if (pathname.includes('/auth/')) return 'auth'
  if (pathname.includes('/vote')) return 'vote'
  if (pathname.includes('/comments')) return 'comment'
  if (pathname.includes('/search')) return 'search'

  // Determine by HTTP method in the calling code
  return 'general'
}

// Specific rate limiters for common endpoints
export const AuthRateLimit = createRateLimitMiddleware(RateLimitConfigs.auth)
export const PostRateLimit = createRateLimitMiddleware(RateLimitConfigs.post)
export const GetRateLimit = createRateLimitMiddleware(RateLimitConfigs.get)
export const VoteRateLimit = createRateLimitMiddleware(RateLimitConfigs.vote)
export const SearchRateLimit = createRateLimitMiddleware(RateLimitConfigs.search)
export const CommentRateLimit = createRateLimitMiddleware(RateLimitConfigs.comment)

// Helper function to apply rate limiting to API routes
export async function applyRateLimit(
  req: NextRequest,
  userId: string | null,
  action: 'auth' | 'post' | 'get' | 'vote' | 'search' | 'comment'
): Promise<NextResponse | null> {
  const limiters = {
    auth: AuthRateLimit,
    post: PostRateLimit,
    get: GetRateLimit,
    vote: VoteRateLimit,
    search: SearchRateLimit,
    comment: CommentRateLimit
  }

  return await limiters[action](req, userId || undefined)
}