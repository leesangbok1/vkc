'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CertificationRequestBannerProps {
  userId?: string
  userName?: string
  onClose?: () => void
  variant?: 'default' | 'compact' | 'floating'
}

export default function CertificationRequestBanner({
  userId,
  userName,
  onClose,
  variant = 'default'
}: CertificationRequestBannerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestCertification = () => {
    // Dispatch custom event to open modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openCertificationModal'))
    }
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
              ✅
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Certified User 인증 신청
              </h3>
              <p className="text-xs text-gray-600">
                경험으로 인증하고 신뢰받는 멘토가 되세요
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestCertification}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            신청하기
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white shadow-2xl border border-gray-200 rounded-xl p-6 max-w-sm animate-slide-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-3xl">
            ✅
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            Certified User 되기
          </h3>
          <p className="text-sm text-gray-600">
            한국 생활 경험을 공유하고<br />
            신뢰받는 멘토가 되세요
          </p>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">📄</span>
            <span className="text-gray-700">문서 기반: 외국인등록증, 재직증명서 (24시간)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">🌟</span>
            <span className="text-gray-700">경험 기반: 멘토링 경력, 커뮤니티 활동 (48-72시간)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span className="text-gray-700">자격증이 없어도 괜찮아요! 경험이 곧 자격입니다</span>
          </div>
        </div>

        <button
          onClick={handleRequestCertification}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '처리 중...' : '지금 신청하기'}
        </button>
      </div>
    )
  }

  // Default variant
  return (
    <div className="bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            ✅
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Certified User 인증 받기
          </h3>
          <p className="text-gray-700 mb-4">
            자격증이 아닌 <strong>경험</strong>으로, 누구나 Certified User가 될 수 있습니다!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-500 font-bold">📄</span>
              <span className="text-gray-700">문서 기반 (빠른 심사)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500 font-bold">🌟</span>
              <span className="text-gray-700">경험 기반 (포트폴리오)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-500 font-bold">👨‍🏫</span>
              <span className="text-gray-700">시니어 멘토 환영!</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleRequestCertification}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmitting ? '처리 중...' : '지금 신청하기 →'}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-600 text-center md:text-left">
          💡 <strong>시니어 멘토, 선경험자 환영!</strong> 한국어 교육, 취업 상담, 커뮤니티 활동 경력으로 인증받으세요
        </p>
      </div>
    </div>
  )
}
