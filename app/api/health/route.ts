import { NextResponse } from 'next/server'

// GET /api/health - Simple health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'viet-kconnect-api',
    version: '1.0.0'
  })
}