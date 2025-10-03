'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import QuestionInput from '@/components/forms/QuestionInput'

export default function HomePage() {
  const { user, profile, loading } = useAuth()

  // URL 파라미터에서 성공/에러 메시지 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')

    if (success === 'login') {
      // 로그인 성공 처리
      console.log('로그인 성공!')
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (error) {
      // 에러 처리
      console.error('인증 에러:', error)
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-in fade-in-0 duration-1000">
            한국 거주 베트남인을 위한 Q&A 플랫폼
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-in fade-in-0 duration-1000 delay-200">
            비자, 생활정보, 취업, 교육 등 다양한 주제로 소통하세요
          </p>

          {/* 질문 입력 컴포넌트 - 모든 사용자에게 표시 */}
          <div className="max-w-4xl mx-auto mb-12 animate-in fade-in-0 duration-700 delay-400">
            <QuestionInput
              onSubmit={(data) => {
                console.log('질문 제출:', data)
                // TODO: 실제 질문 제출 로직 구현
                alert('질문이 성공적으로 등록되었습니다!')
              }}
            />
          </div>

          {/* 사용자 정보 (로그인된 경우에만 표시) */}
          {user && profile && (
            <div className="bg-card border rounded-lg shadow-sm p-6 sm:p-8 max-w-2xl mx-auto mb-8 animate-in fade-in-0 duration-700 delay-600">
              <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-4">
                안녕하세요, {profile.name}님!
              </h2>
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-medium text-foreground mb-3">프로필 정보</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">이메일:</span> {user.email}</p>
                  <p><span className="font-medium text-foreground">로그인 방법:</span> {profile.provider}</p>
                  <p><span className="font-medium text-foreground">가입일:</span> {new Date(profile.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-card border rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200 animate-in fade-in-0 duration-700 delay-600">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-question-circle text-primary text-xl" aria-hidden="true"></i>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3">질문과 답변</h3>
            <p className="text-muted-foreground text-sm">
              궁금한 것이 있으면 언제든 질문하고 도움을 받으세요
            </p>
          </div>

          <div className="bg-card border rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200 animate-in fade-in-0 duration-700 delay-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-green-600 dark:text-green-400 text-xl" aria-hidden="true"></i>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3">커뮤니티</h3>
            <p className="text-muted-foreground text-sm">
              같은 경험을 가진 사람들과 정보를 공유하고 소통하세요
            </p>
          </div>

          <div className="bg-card border rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200 animate-in fade-in-0 duration-700 delay-800">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-info-circle text-purple-600 dark:text-purple-400 text-xl" aria-hidden="true"></i>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3">정보 공유</h3>
            <p className="text-muted-foreground text-sm">
              비자, 취업, 생활 등 유용한 정보를 나누고 받으세요
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}