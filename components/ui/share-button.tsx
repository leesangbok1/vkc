'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check, Copy } from 'lucide-react'

interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export function ShareButton({
  url,
  title,
  text,
  className = '',
  variant = 'outline',
  size = 'sm'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareTitle = title || document?.title || 'Viet K-Connect'
  const shareText = text || '베트남인을 위한 한국 생활 Q&A 커뮤니티'

  const handleShare = async () => {
    try {
      // Web Share API 지원 확인 (모바일)
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      // 클립보드 API로 링크 복사
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // 폴백: execCommand 사용
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('복사 실패:', err)
          alert('링크 복사에 실패했습니다.')
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('공유 실패:', error)
      alert('공유에 실패했습니다.')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
      title={copied ? '링크가 복사되었습니다!' : '링크 복사 또는 공유'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>공유</span>
        </>
      )}
    </Button>
  )
}

// 간단한 복사 버튼 (아이콘만)
export function CopyLinkButton({
  url,
  className = '',
  size = 16
}: {
  url?: string
  className?: string
  size?: number
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // 폴백
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      title={copied ? '복사됨!' : '링크 복사'}
    >
      {copied ? (
        <Check size={size} className="text-green-600" />
      ) : (
        <Copy size={size} className="text-gray-600" />
      )}
    </button>
  )
}