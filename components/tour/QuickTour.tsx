'use client'

import { useState, useEffect } from 'react'

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: string
  actionUrl?: string // Optional URL to navigate when "이동하기" is clicked
}

interface QuickTourProps {
  steps: TourStep[]
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function QuickTour({ steps, isOpen, onComplete, onSkip }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return

    const updatePosition = () => {
      const targetElement = document.querySelector(steps[currentStep].targetSelector)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
      }
    }

    // Initial position update
    updatePosition()

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [currentStep, isOpen, steps])

  if (!isOpen || !steps[currentStep]) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGoToAction = () => {
    // If the step has an actionUrl, navigate to it and complete the tour
    if (step.actionUrl) {
      onComplete() // Mark tour as completed
      window.location.href = step.actionUrl
    } else {
      // If no actionUrl, try to click the target element
      const targetElement = document.querySelector(step.targetSelector) as HTMLElement
      if (targetElement) {
        onComplete()
        targetElement.click()
      } else {
        // Fallback to just completing the tour
        onComplete()
      }
    }
  }

  const handleOverlayClick = () => {
    // 오버레이 클릭 시 해당 기능으로 자동 이동
    handleGoToAction()
  }

  // Calculate tooltip position based on step position preference
  const getTooltipPosition = () => {
    const padding = 16
    const tooltipWidth = 320

    switch (step.position) {
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left + (targetPosition.width / 2) - (tooltipWidth / 2)
        }
      case 'top':
        return {
          top: targetPosition.top - 200 - padding,
          left: targetPosition.left + (targetPosition.width / 2) - (tooltipWidth / 2)
        }
      case 'left':
        return {
          top: targetPosition.top + (targetPosition.height / 2) - 100,
          left: targetPosition.left - tooltipWidth - padding
        }
      case 'right':
        return {
          top: targetPosition.top + (targetPosition.height / 2) - 100,
          left: targetPosition.left + targetPosition.width + padding
        }
      default:
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left
        }
    }
  }

  const tooltipPos = getTooltipPosition()

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div className="tour-overlay" onClick={handleOverlayClick}>
        {/* Spotlight highlight */}
        <div
          className="tour-spotlight"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16
          }}
        />
      </div>

      {/* Tour tooltip */}
      <div
        className="tour-tooltip"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tour-header">
          <div className="tour-icon">{step.icon}</div>
          <div className="tour-step-counter">
            {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="tour-content">
          <h3 className="tour-title">{step.title}</h3>
          <p className="tour-description">{step.description}</p>
        </div>

        {/* Footer */}
        <div className="tour-footer">
          <button onClick={handleGoToAction} className="tour-btn tour-btn-skip">
            이동하기
          </button>
          <div className="tour-navigation">
            {currentStep > 0 && (
              <button onClick={handlePrevious} className="tour-btn tour-btn-secondary">
                이전
              </button>
            )}
            <button onClick={handleNext} className="tour-btn tour-btn-primary">
              {isLastStep ? '완료' : '다음'}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="tour-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`tour-progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
