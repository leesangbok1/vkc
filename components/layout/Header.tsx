'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  List,
  Globe,
  Bell,
  User,
  Settings,
  Shield,
  LogOut,
  Plus,
  ChevronDown,
  MessageCircle,
} from 'lucide-react'

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, signOut, isAdmin } = useAuth()
  const { unreadCount } = useNotifications()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <span className="hidden text-xl font-bold text-blue-600 md:inline-block">
                  Viet K-Connect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      <Home className="mr-2 h-4 w-4" />
                      홈
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/questions" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      <List className="mr-2 h-4 w-4" />
                      전체 질문
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <DropdownMenu open={isLangMenuOpen} onOpenChange={setIsLangMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">언어 선택</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-blue-600">
                    <span className="mr-2">✓</span>
                    한국어
                  </DropdownMenuItem>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications (logged in users only) */}
              {user && (
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">알림 {unreadCount}개</span>
                </Button>
              )}

              {/* User Menu or Login */}
              {user ? (
                <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url || user.profilePic} />
                        <AvatarFallback>
                          {user.user_metadata?.name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.user_metadata?.name || user.name || '사용자'}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        프로필
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        설정
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            관리자 페이지
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={onLoginClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">로그인</span>
                  </Button>
                  <Link href="/register">
                    <Button>
                      <span className="hidden sm:inline">회원가입</span>
                      <span className="sm:hidden">가입</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
        <div className="grid h-16 max-w-lg grid-cols-5 mx-auto">
          <Link
            href="/"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
          >
            <Home className="w-5 h-5 mb-1 text-gray-500 group-hover:text-blue-600" />
            <span className="text-xs text-gray-500 group-hover:text-blue-600">홈</span>
          </Link>

          <Link
            href="/questions"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
          >
            <List className="w-5 h-5 mb-1 text-gray-500 group-hover:text-blue-600" />
            <span className="text-xs text-gray-500 group-hover:text-blue-600">질문</span>
          </Link>

          <Link
            href="/questions/new"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full mb-1">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-blue-600">작성</span>
          </Link>

          {user && (
            <button className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group relative">
              <Bell className="w-5 h-5 mb-1 text-gray-500 group-hover:text-blue-600" />
              <span className="text-xs text-gray-500 group-hover:text-blue-600">알림</span>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-1 right-3 h-4 w-4 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          )}

          <button
            onClick={user ? () => setIsUserMenuOpen(!isUserMenuOpen) : onLoginClick}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
          >
            {user ? (
              <>
                <Avatar className="h-5 w-5 mb-1">
                  <AvatarImage src={user.user_metadata?.avatar_url || user.profilePic} />
                  <AvatarFallback className="text-xs">
                    {user.user_metadata?.name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500 group-hover:text-blue-600">프로필</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5 mb-1 text-gray-500 group-hover:text-blue-600" />
                <span className="text-xs text-gray-500 group-hover:text-blue-600">로그인</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </>
  )
}