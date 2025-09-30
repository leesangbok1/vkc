'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithKakao } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // OAuth flow will redirect to callback, so we don't close modal here
      // Modal will be closed by parent component when auth state changes
    } catch (error) {
      let errorMessage = 'Google 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `Google 로그인 실패: ${error.message}`
        }
      }

      setError(errorMessage)
      console.error('Google login failed:', error)
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithFacebook()
      // OAuth flow will redirect to callback, so we don't close modal here
      // Modal will be closed by parent component when auth state changes
    } catch (error) {
      let errorMessage = 'Facebook 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `Facebook 로그인 실패: ${error.message}`
        }
      }

      setError(errorMessage)
      console.error('Facebook login failed:', error)
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithKakao()
      // OAuth flow will redirect to callback, so we don't close modal here
      // Modal will be closed by parent component when auth state changes
    } catch (error) {
      let errorMessage = '카카오 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `카카오 로그인 실패: ${error.message}`
        }
      }

      setError(errorMessage)
      console.error('Kakao login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">로그인</DialogTitle>
          <DialogDescription className="text-center">
            VietKConnect에 오신 것을 환영합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google 로그인 */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? '로그인 중...' : 'Google로 계속하기'}
          </Button>

          {/* Facebook 로그인 */}
          <Button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            {isLoading ? '로그인 중...' : 'Facebook으로 계속하기'}
          </Button>

          {/* Kakao 로그인 */}
          <Button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full h-12 bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus:ring-yellow-500"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#000000"
                d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L7.5 21l.455-2.947C4.57 16.97 1.5 14.35 1.5 11.185 1.5 6.665 6.201 3 12 3z"
              />
            </svg>
            {isLoading ? '로그인 중...' : '카카오로 계속하기'}
          </Button>

          {/* 안내 문구 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              로그인하면{' '}
              <a href="#" className="text-primary hover:underline">
                이용약관
              </a>
              과{' '}
              <a href="#" className="text-primary hover:underline">
                개인정보 처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}