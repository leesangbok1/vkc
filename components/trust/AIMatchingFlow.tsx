'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ExpertCard } from './TrustBadge'

interface AIMatchingFlowProps {
  question: {
    title: string
    content: string
    category: string
    urgency: string
  }
}

const mockExperts = [
  {
    id: 1,
    name: '김민수',
    residence_years: 7,
    trust_score: 847,
    is_verified: true,
    verification_type: 'worker',
    company: '삼성전자',
    specialties: ['E-7비자', '취업', '급여협상'],
    answer_count: 156,
    acceptance_rate: 94,
    avg_response_time: 2.1
  },
  {
    id: 2,
    name: '레투안',
    residence_years: 5,
    trust_score: 692,
    is_verified: true,
    verification_type: 'student',
    specialties: ['유학', '대학원', '장학금'],
    answer_count: 89,
    acceptance_rate: 87,
    avg_response_time: 3.2
  },
  {
    id: 3,
    name: '팜티란',
    residence_years: 9,
    trust_score: 923,
    is_verified: true,
    verification_type: 'resident',
    specialties: ['주거', '부동산', '전세'],
    answer_count: 234,
    acceptance_rate: 96,
    avg_response_time: 1.8
  }
]

export default function AIMatchingFlow({ question }: AIMatchingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [detectedCategory, setDetectedCategory] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState(0)
  const [complexityScore, setComplexityScore] = useState(0)
  const [foundExperts, setFoundExperts] = useState(0)
  const [matchedExperts, setMatchedExperts] = useState<any[]>([])
  const [selectedExperts, setSelectedExperts] = useState<any[]>([])
  // 타이머 제거됨

  useEffect(() => {
    // Step 1: 질문 분석
    const analysisTimer = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(analysisTimer)
          setDetectedCategory(question.category || '취업/직장')
          setUrgencyLevel(4)
          setComplexityScore(3)
          setTimeout(() => setCurrentStep(2), 500)
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => clearInterval(analysisTimer)
  }, [])

  useEffect(() => {
    if (currentStep === 2) {
      // Step 2: Certified User 매칭
      const matchingTimer = setInterval(() => {
        setMatchingProgress(prev => {
          if (prev >= 100) {
            clearInterval(matchingTimer)
            setFoundExperts(100)
            setMatchedExperts(mockExperts)
            setTimeout(() => setCurrentStep(3), 500)
            return 100
          }
          return prev + 3
        })

        setFoundExperts(prev => Math.min(prev + 2, 98))
      }, 80)

      return () => clearInterval(matchingTimer)
    }
  }, [currentStep])

  // 타이머 관련 코드 제거됨

  const handleExpertSelect = (expert: any) => {
    setSelectedExperts(prev => {
      const isSelected = prev.find(e => e.id === expert.id)
      if (isSelected) {
        return prev.filter(e => e.id !== expert.id)
      } else if (prev.length < 5) {
        return [...prev, expert]
      }
      return prev
    })
  }

  const handleComplete = () => {
    console.log('Selected experts:', selectedExperts)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
        🤖 AI Certified User 매칭
      </h2>

      {/* Step 1: 질문 분석 */}
      <div className={cn(
        'mb-6 p-4 rounded-lg border transition-all duration-300',
        currentStep >= 1 ? 'border-primary-blue bg-primary-blue/5' : 'border-gray-200'
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
            currentStep >= 1 ? 'bg-primary-blue' : 'bg-gray-300'
          )}>
            1
          </div>
          <h3 className="font-semibold text-gray-900">질문 분석 중...</h3>
          {currentStep > 1 && (
            <div className="text-green-600 font-bold">✓</div>
          )}
        </div>

        {currentStep === 1 && (
          <div className="ml-11">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-primary-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              분석 진행률: {analysisProgress}%
            </div>
          </div>
        )}

        {currentStep > 1 && (
          <div className="ml-11 text-sm space-y-1">
            <div>📂 카테고리: <span className="font-medium">{detectedCategory}</span></div>
            <div>⚡ 긴급도: <span className="font-medium">{urgencyLevel}/5</span></div>
            <div>🧩 복잡도: <span className="font-medium">{complexityScore}/5</span></div>
          </div>
        )}
      </div>

      {/* Step 2: Certified User 매칭 */}
      <div className={cn(
        'mb-6 p-4 rounded-lg border transition-all duration-300',
        currentStep >= 2 ? 'border-primary-green bg-primary-green/5' : 'border-gray-200'
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
            currentStep >= 2 ? 'bg-primary-green text-gray-900' : 'bg-gray-300'
          )}>
            2
          </div>
          <h3 className="font-semibold text-gray-900">Certified User 매칭 중...</h3>
          {currentStep > 2 && (
            <div className="text-green-600 font-bold">✓</div>
          )}
        </div>

        {currentStep === 2 && (
          <div className="ml-11">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-primary-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchingProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{foundExperts}/100</span> Certified User 검토됨
            </div>
          </div>
        )}

        {currentStep > 2 && (
          <div className="ml-11 text-sm text-gray-600">
            ✨ <span className="font-medium">5명의 최적 Certified User</span>를 찾았습니다!
          </div>
        )}
      </div>

      {/* Step 3: 결과 */}
      {currentStep >= 3 && (
        <div className="mb-6 p-4 rounded-lg border border-trust bg-trust/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-trust flex items-center justify-center text-white font-bold">
              3
            </div>
            <h3 className="font-semibold text-gray-900">매칭 완료!</h3>
            <div className="text-green-600 font-bold">✓</div>
          </div>

          <div className="ml-11">
            <p className="text-sm text-gray-600 mb-4">
              선택하신 Certified User들이 답변해 드립니다.
              최대 <span className="font-medium">5명</span>까지 선택 가능합니다.
            </p>

            {/* Certified User 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {matchedExperts.map((expert) => {
                const isSelected = selectedExperts.find(e => e.id === expert.id)
                const matchScore = 85 + Math.random() * 15 // 85-100%
                const matchReasons = [
                  `${expert.specialties?.[0]} 분야 Certified User`,
                  `${expert.residence_years}년 한국 거주 경험`,
                  `높은 신뢰도 (${expert.trust_score}점)`
                ]

                return (
                  <div
                    key={expert.id}
                    className={cn(
                      'border-2 rounded-xl transition-all duration-200',
                      isSelected
                        ? 'border-primary-blue shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <ExpertCard
                      expert={expert}
                      matchScore={Math.round(matchScore)}
                      matchReason={matchReasons.join(' • ')}
                      onSelect={() => handleExpertSelect(expert)}
                    />
                  </div>
                )
              })}
            </div>

            {/* 선택된 전문가 수 */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                선택됨: <span className="font-medium">{selectedExperts.length}/5</span>
              </div>
              {selectedExperts.length > 0 && (
                <button
                  onClick={handleComplete}
                  className="btn-primary-blue px-6 py-2"
                >
                  선택 완료 ({selectedExperts.length}명)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI 매칭 완료 안내 */}
      <div className="bg-gradient-to-r from-primary-blue/10 to-primary-green/10 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-lg">🤖</div>
          <div>
            <div className="font-semibold text-gray-900">AI 매칭 완료</div>
            <div className="text-sm text-gray-600">Certified User들이 질문을 확인하고 답변해 드립니다</div>
          </div>
        </div>
      </div>
    </div>
  )
}