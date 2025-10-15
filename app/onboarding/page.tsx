'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { generateUniqueNickname } from '@/lib/utils/nickname-generator'
import { subscribeTopic } from '@/lib/utils/follow-manager'

type SurveyData = {
  residence?: string
  gender?: string
  age?: string
  category?: string
  topics?: number[]
}

// 인기 토픽 5개
const POPULAR_TOPICS = [
  { id: 1, name: '한국 비자·체류', icon: '🛂' },
  { id: 2, name: '한국 직장생활', icon: '💼' },
  { id: 4, name: '한국 생활 정착', icon: '🌏' },
  { id: 8, name: '베트남 송금·금융', icon: '💰' },
  { id: 9, name: '한국어 배우기', icon: '📚' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const [currentStep, setCurrentStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>({})
  const [categoryOther, setCategoryOther] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const totalSteps = 5 // 4 → 5로 변경 (토픽 선택 추가)

  // Validate current step
  useEffect(() => {
    let isValid = false

    if (currentStep === 1) {
      isValid = !!surveyData.residence
    } else if (currentStep === 2) {
      isValid = !!surveyData.gender
    } else if (currentStep === 3) {
      isValid = !!surveyData.age
    } else if (currentStep === 4) {
      if (surveyData.category === 'other') {
        isValid = categoryOther.trim().length > 0
      } else {
        isValid = !!surveyData.category
      }
    } else if (currentStep === 5) {
      // 토픽 선택은 선택사항 (0개 이상)
      isValid = true
    }

    setIsNextDisabled(!isValid)
  }, [currentStep, surveyData, categoryOther, selectedTopics])

  const handleRadioChange = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setSurveyData(prev => ({ ...prev, category: value }))
    if (value !== 'other') {
      setCategoryOther('')
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  const completeOnboarding = async () => {
    const finalData = { ...surveyData }
    if (surveyData.category === 'other') {
      finalData.category = categoryOther
    }

    // 자동 닉네임 생성
    const autoNickname = generateUniqueNickname()

    console.log('✅ 프로필 설정 완료:', finalData)
    console.log('✅ 자동 생성된 닉네임:', autoNickname)
    console.log('✅ 선택된 토픽:', selectedTopics)

    // 🎭 MOCK: 페이지 플로우 테스트용 - localStorage에만 저장
    localStorage.setItem('vietkconnect_onboarded', 'true')
    localStorage.setItem('vietkconnect_profile', JSON.stringify({
      ...finalData,
      nickname: autoNickname,
      interests: selectedTopics,
      profile_completion: 40, // 기본 정보만 입력 = 40%
      completedAt: new Date().toISOString()
    }))

    // 선택한 토픽을 구독 목록에 저장
    selectedTopics.forEach(topicId => {
      const topic = POPULAR_TOPICS.find(t => t.id === topicId)
      if (topic) {
        subscribeTopic({
          id: topic.id,
          name: topic.name,
          slug: topic.name.replace(/\s+/g, '-').toLowerCase(),
          icon: topic.icon
        })
      }
    })

    // 🔧 DEV MODE: 개발자 모드인 경우 온보딩 완료 후 ADMIN 권한 부여
    const currentUser = JSON.parse(localStorage.getItem('mock_user') || '{}')
    if (currentUser.is_dev_mode) {
      const adminUser = {
        ...currentUser,
        role: 'ADMIN',
        nickname: autoNickname,
        onboarding_completed: true,
        profile: {
          ...finalData,
          interests: selectedTopics
        },
        trust_score: 100,
        badges: {
          verified: true,
          expert: true,
          admin: true
        },
        permissions: {
          can_moderate: true,
          can_approve_experts: true,
          can_manage_users: true,
          can_view_reports: true,
          can_access_admin_panel: true
        },
        updated_at: new Date().toISOString()
      }

      localStorage.setItem('mock_user', JSON.stringify(adminUser))
      console.log('👑 관리자 권한 활성화 완료!', adminUser)
      console.log('🎯 개발 모드: 모든 페이지 및 기능 접근 가능')
      console.log('✅ 닉네임:', autoNickname, '(프로필에서 변경 가능)')
    }

    console.log('→ redirectTo로 이동:', redirectTo)
    router.push(redirectTo)
  }

  const progress = (currentStep / totalSteps) * 100

  // Update progress bar width via CSS custom property
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--progress', `${progress}%`)
    }
  }, [progress])

  return (
    <main className="onboarding-layout">
      <div className="survey-container">
        {/* Survey Header */}
        <div className="survey-header">
          <h1 className="survey-title">프로필 설정</h1>
          <p className="survey-subtitle">맞춤형 서비스 제공을 위한 기본 정보를 입력해주세요</p>
        </div>

        {/* Survey Content */}
        <div className="survey-content">
          {/* Progress Bar */}
          {currentStep <= totalSteps && (
            <div className="progress-container">
              <div className="progress-label">
                <span>{currentStep}</span> / {totalSteps} 단계
              </div>
              <div className="progress-bar">
                <div className="progress-fill" ref={progressBarRef}></div>
              </div>
            </div>
          )}

          {/* Step 1: 거주지 */}
          {currentStep === 1 && (
            <div className="survey-step">
              <div className="form-group">
                <label className="form-label">
                  현재 거주지를 선택해주세요<span className="required">*</span>
                </label>
                <div className="option-grid two-columns">
                  <label className={`option-card ${surveyData.residence === 'korea' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="residence"
                      value="korea"
                      checked={surveyData.residence === 'korea'}
                      onChange={(e) => handleRadioChange('residence', e.target.value)}
                    />
                    <span className="option-icon">🇰🇷</span>
                    <span className="option-text">한국</span>
                  </label>
                  <label className={`option-card ${surveyData.residence === 'other' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="residence"
                      value="other"
                      checked={surveyData.residence === 'other'}
                      onChange={(e) => handleRadioChange('residence', e.target.value)}
                    />
                    <span className="option-icon">🌍</span>
                    <span className="option-text">한국 외</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 성별 */}
          {currentStep === 2 && (
            <div className="survey-step">
              <div className="form-group">
                <label className="form-label">
                  성별을 선택해주세요<span className="required">*</span>
                </label>
                <div className="option-grid two-columns">
                  <label className={`option-card ${surveyData.gender === 'male' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={surveyData.gender === 'male'}
                      onChange={(e) => handleRadioChange('gender', e.target.value)}
                    />
                    <span className="option-icon">👨</span>
                    <span className="option-text">남성</span>
                  </label>
                  <label className={`option-card ${surveyData.gender === 'female' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={surveyData.gender === 'female'}
                      onChange={(e) => handleRadioChange('gender', e.target.value)}
                    />
                    <span className="option-icon">👩</span>
                    <span className="option-text">여성</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 연령 */}
          {currentStep === 3 && (
            <div className="survey-step">
              <div className="form-group">
                <label className="form-label">
                  연령대를 선택해주세요<span className="required">*</span>
                </label>
                <div className="option-grid">
                  <label className={`option-card ${surveyData.age === 'under20' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="age"
                      value="under20"
                      checked={surveyData.age === 'under20'}
                      onChange={(e) => handleRadioChange('age', e.target.value)}
                    />
                    <span className="option-icon">🧒</span>
                    <span className="option-text">~20세</span>
                  </label>
                  <label className={`option-card ${surveyData.age === '20s' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="age"
                      value="20s"
                      checked={surveyData.age === '20s'}
                      onChange={(e) => handleRadioChange('age', e.target.value)}
                    />
                    <span className="option-icon">🧑</span>
                    <span className="option-text">20대</span>
                  </label>
                  <label className={`option-card ${surveyData.age === '30plus' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="age"
                      value="30plus"
                      checked={surveyData.age === '30plus'}
                      onChange={(e) => handleRadioChange('age', e.target.value)}
                    />
                    <span className="option-icon">👨</span>
                    <span className="option-text">30+</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 분류 */}
          {currentStep === 4 && (
            <div className="survey-step">
              <div className="form-group">
                <label className="form-label">
                  현재 상황을 선택해주세요<span className="required">*</span>
                </label>
                <div className="option-grid">
                  <label className={`option-card ${surveyData.category === 'student' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      value="student"
                      checked={surveyData.category === 'student'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    />
                    <span className="option-icon">🎓</span>
                    <span className="option-text">학생</span>
                  </label>
                  <label className={`option-card ${surveyData.category === 'worker' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      value="worker"
                      checked={surveyData.category === 'worker'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    />
                    <span className="option-icon">💼</span>
                    <span className="option-text">직장인</span>
                  </label>
                  <label className={`option-card ${surveyData.category === 'other' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      value="other"
                      checked={surveyData.category === 'other'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    />
                    <span className="option-icon">👤</span>
                    <span className="option-text">기타</span>
                  </label>
                </div>
                {surveyData.category === 'other' && (
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="기타 상황을 입력해주세요"
                    value={categoryOther}
                    onChange={(e) => setCategoryOther(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 5: 인기 토픽 선택 */}
          {currentStep === 5 && (
            <div className="survey-step">
              <div className="form-group">
                <label className="form-label">
                  관심 있는 토픽을 선택해주세요 (선택사항)
                </label>
                <p className="form-help" style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  자주 선택되는 인기 토픽입니다. 나중에 더 추가할 수 있어요!
                </p>

                <div className="popular-topics-grid">
                  {POPULAR_TOPICS.map((topic) => (
                    <label
                      key={topic.id}
                      className={`popular-topic-card ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => toggleTopic(topic.id)}
                        style={{ display: 'none' }}
                      />
                      <span className="topic-icon-large">{topic.icon}</span>
                      <span className="topic-name">{topic.name}</span>
                      {selectedTopics.includes(topic.id) && (
                        <span className="topic-check">✓</span>
                      )}
                    </label>
                  ))}
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#166534',
                  textAlign: 'center'
                }}>
                  {selectedTopics.length > 0
                    ? `✅ ${selectedTopics.length}개 토픽 선택됨`
                    : '💡 토픽을 선택하면 맞춤형 질문을 추천해드려요'}
                </div>
              </div>
            </div>
          )}

          {/* Completion Step */}
          {currentStep > totalSteps && (
            <div className="survey-step">
              <div className="completion-section">
                <div className="completion-icon">🎉</div>
                <h2 className="completion-title">프로필 설정 완료!</h2>
                <p className="completion-text">
                  VietKConnect에 오신 것을 환영합니다.<br />
                  이제 한국 생활의 모든 궁금증을 해결해보세요.
                </p>
                <button className="btn-primary" onClick={() => router.push('/')}>
                  VietKConnect 시작하기
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentStep <= totalSteps && (
            <div className="action-buttons">
              {currentStep > 1 && (
                <button type="button" className="btn-secondary" onClick={previousStep}>
                  이전
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={nextStep}
                disabled={isNextDisabled}
              >
                {currentStep === totalSteps ? '완료' : '다음'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
