'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, User, Settings, LogOut, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/theme-toggle'
import LoginModal from '@/components/LoginModal'

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              aria-label="VietKConnect 홈으로 이동"
            >
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="font-bold text-lg sm:text-xl">VietKConnect</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-2" role="navigation" aria-label="주요 메뉴">
              <Link href="/questions">
                <Button
                  variant="ghost"
                  className="hover:bg-muted transition-colors duration-200"
                  aria-label="질문 목록 보기"
                >
                  질문
                </Button>
              </Link>
              <Link href="/questions/new">
                <Button
                  variant="ghost"
                  className="hover:bg-muted transition-colors duration-200"
                  aria-label="새 질문 작성하기"
                >
                  질문하기
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all duration-200"
                    aria-label={`사용자 메뉴 - ${profile?.name || user.user_metadata?.name || user.email}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile?.avatar_url || user.user_metadata?.avatar_url}
                        alt={`${profile?.name || user.user_metadata?.name || user.email}의 프로필 이미지`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {(profile?.name || user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-in fade-in-0 zoom-in-95" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start p-3" disabled>
                    <div className="font-medium text-sm">
                      {profile?.name || user.user_metadata?.name || '사용자'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate w-full">{user.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </Link>
                  </DropdownMenuItem>
                  <div className="sm:hidden">
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <ThemeToggle />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isSigningOut ? '로그아웃 중...' : '로그아웃'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="hover:scale-105 transition-transform duration-200"
                aria-label="로그인하기"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">로그인</span>
                <span className="sm:hidden">로그인</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}