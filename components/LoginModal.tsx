'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthCallback = () => {
      const success = document.cookie.includes('auth-callback-success=true')
      if (success) {
        document.cookie = 'auth-callback-success=; Max-Age=0; path=/'
        onClose()
        window.location.reload()
      }
    }

    if (isOpen) {
      const interval = setInterval(checkAuthCallback, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen, onClose])

  const handleLoginSuccess = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        role="dialog"
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle
            id="login-modal-title"
            className="text-2xl font-bold text-center text-primary"
          >
            로그인
          </DialogTitle>
          <DialogDescription
            id="login-modal-description"
            className="text-center text-secondary"
          >
            VietKConnect에 오신 것을 환영합니다. 소셜 계정으로 간편하게 로그인하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <SocialLoginButtons onLoginSuccess={handleLoginSuccess} />

          <div className="text-center" role="note" aria-label="이용약관 및 개인정보 처리방침 안내">
            <p className="text-sm text-gray-600">
              로그인하면{' '}
              <a
                href="#"
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
                aria-label="이용약관 보기"
              >
                이용약관
              </a>
              과{' '}
              <a
                href="#"
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
                aria-label="개인정보 처리방침 보기"
              >
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