'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSafeAuth } from "@/components/providers/ClientProviders"
import { UserRole } from '@/lib/utils/permissions'

export default function LeftSidebar() {
  const { user, profile } = useSafeAuth()
  const userRole = user ? ((profile as any)?.role || UserRole.USER) : UserRole.GUEST

  return (
    <aside className="w-64 space-y-4 p-4 bg-white border-r border-gray-200 min-h-screen">
      {/* 인증 유도 베너 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-blue-800">
            인증 유도 베너
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-700">
            'Certified User 인증받기' (해택 기재)
          </p>
          {!user ? (
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/auth/login">로그인하고 인증받기</Link>
            </Button>
          ) : userRole === UserRole.USER ? (
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/verification/apply">Certified User 인증 신청</Link>
            </Button>
          ) : (
            <div className="text-sm text-green-600 font-medium">
              ✅ 인증 완료
            </div>
          )}
          <p className="text-xs text-blue-600">
            (해택 기재)
          </p>
        </CardContent>
      </Card>

      {/* 가치제안 베너 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-green-800">
            가치제안 베너
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-700">
              핵심 가치 사용자
            </div>
            <ul className="text-xs text-green-600 space-y-1">
              <li>• 비자 Certified User</li>
              <li>• 취업 상담사</li>
              <li>• 생활 가이드</li>
              <li>• 교육 컨설턴트</li>
            </ul>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full border-green-600 text-green-700 hover:bg-green-100"
          >
            <Link href="/experts">Certified User 찾기</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}