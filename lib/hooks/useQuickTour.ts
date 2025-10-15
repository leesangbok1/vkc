import { useState, useEffect } from 'react'
import { shouldShowTour, completeTour, skipTour, hasTourCompleted } from '@/lib/utils/tour-manager'

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: string
  actionUrl?: string // Optional URL to navigate when "이동하기" is clicked
}

/**
 * Hook to manage Quick Tour state
 * @param isLoggedIn - Only show tour for logged-in users
 * @param isEventModalOpen - Don't show tour if event modal is open
 */
export function useQuickTour(isLoggedIn: boolean = false, isEventModalOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [shouldStartAfterModal, setShouldStartAfterModal] = useState(false)

  useEffect(() => {
    // Only show tour for logged-in users
    if (!isLoggedIn) {
      setIsOpen(false)
      return
    }

    // If event modal is open, wait for it to close
    if (isEventModalOpen) {
      setIsOpen(false)
      // Mark that we should start tour after modal closes
      const shouldShow = shouldShowTour()
      if (shouldShow) {
        setShouldStartAfterModal(true)
      }
      return
    }

    // If event modal just closed and we should start tour
    if (shouldStartAfterModal && !isEventModalOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setShouldStartAfterModal(false)
      }, 500) // Short delay after modal closes
      return () => clearTimeout(timer)
    }

    // Normal tour start logic (when no event modal)
    const timer = setTimeout(() => {
      const shouldShow = shouldShowTour()
      const completed = hasTourCompleted()
      setIsOpen(shouldShow)
      setIsCompleted(completed)
    }, 1500) // Increased delay to 1.5s to ensure DOM is ready

    return () => clearTimeout(timer)
  }, [isLoggedIn, isEventModalOpen, shouldStartAfterModal])

  const handleComplete = () => {
    completeTour()
    setIsOpen(false)
    setIsCompleted(true)
  }

  const handleSkip = () => {
    skipTour()
    setIsOpen(false)
  }

  const startTour = () => {
    setIsOpen(true)
  }

  return {
    isOpen,
    isCompleted,
    handleComplete,
    handleSkip,
    startTour
  }
}

/**
 * Default tour steps for homepage
 */
export const defaultTourSteps: TourStep[] = [
  {
    id: 'ask-question',
    title: '질문 올리기',
    description: '궁금한 점이 있으신가요? 버튼을 클릭해서 한국 생활에 대한 질문을 올려보세요. Certified User들이 도움을 드릴 거예요!',
    targetSelector: '[data-tour="ask-question"]',
    position: 'bottom',
    icon: '❓',
    actionUrl: '/questions/new'
  },
  {
    id: 'certified-answers',
    title: 'Certified User 답변',
    description: '검증된 전문가들의 답변을 확인하세요. Certified User는 실제 경험과 전문 지식을 바탕으로 신뢰할 수 있는 정보를 제공합니다.',
    targetSelector: '[data-tour="certified-badge"]',
    position: 'right',
    icon: '✅',
    actionUrl: '/questions' // Navigate to questions page to see more certified answers
  },
  {
    id: 'subscribe-topics',
    title: '관심 토픽 구독',
    description: '관심있는 토픽을 구독하면 맞춤형 질문과 답변을 받을 수 있어요. 비자, 취업, 생활 등 다양한 토픽을 확인해보세요!',
    targetSelector: '[data-tour="topics"]',
    position: 'bottom',
    icon: '💖',
    actionUrl: '/topics'
  }
]
