'use client'

import Link from 'next/link'
import { useSafeAuth } from '@/components/providers/ClientProviders'

export default function SimpleHeader() {
  const { user, loading } = useSafeAuth()

  return (
    <header className="h-16 bg-blue-600 text-white flex items-center justify-between px-4">
      <Link href="/" className="text-xl font-bold hover:opacity-80">
        VietKConnect
      </Link>

      <nav className="flex items-center space-x-4">
        <Link href="/questions" className="hover:opacity-80">
          질문
        </Link>

        {loading ? (
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        ) : user ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm">환영합니다!</span>
            <button className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">
              로그아웃
            </button>
          </div>
        ) : (
          <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
            로그인
          </button>
        )}
      </nav>
    </header>
  )
}