'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SurveyData = {
  residence?: string
  gender?: string
  age?: string
  category?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const [currentStep, setCurrentStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>({})
  const [categoryOther, setCategoryOther] = useState('')
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const totalSteps = 4

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
    }

    setIsNextDisabled(!isValid)
  }, [currentStep, surveyData, categoryOther])

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

  const completeOnboarding = async () => {
    const finalData = { ...surveyData }
    if (surveyData.category === 'other') {
      finalData.category = categoryOther
    }

    console.log('✅ 프로필 설정 완료:', finalData)

    // 🎭 MOCK: 페이지 플로우 테스트용 - localStorage에만 저장
    localStorage.setItem('vietkconnect_onboarded', 'true')
    localStorage.setItem('vietkconnect_profile', JSON.stringify({
      ...finalData,
      completedAt: new Date().toISOString()
    }))

    // 🔧 DEV MODE: 개발자 모드인 경우 온보딩 완료 후 ADMIN 권한 부여
    const currentUser = JSON.parse(localStorage.getItem('mock_user') || '{}')
    if (currentUser.is_dev_mode) {
      const adminUser = {
        ...currentUser,
        role: 'admin',
        onboarding_completed: true,
        profile: finalData,
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
