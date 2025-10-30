'use client'

import { useEffect, useMemo, useState } from 'react'
import BaseModal from './BaseModal'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_REPORT_REASON,
  REPORT_REASON_OPTIONS,
  ReportTargetType
} from '@/lib/constants/reports'

interface ReportContentModalProps {
  isOpen: boolean
  onClose: () => void
  targetId: string
  targetType: ReportTargetType
  targetTitle?: string
  targetExcerpt?: string
  targetUrl?: string
  metadata?: Record<string, unknown>
  onSuccess?: () => void
}

type SubmitState = 'idle' | 'success' | 'error'

const MAX_DESCRIPTION_LENGTH = 1000

export default function ReportContentModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  targetExcerpt,
  targetUrl,
  metadata,
  onSuccess
}: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] = useState(DEFAULT_REPORT_REASON)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('신고가 접수되었습니다. 빠르게 검토하겠습니다.')

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason(DEFAULT_REPORT_REASON)
      setDescription('')
      setIsSubmitting(false)
      setSubmitState('idle')
      setErrorMessage(null)
      setSuccessMessage('신고가 접수되었습니다. 빠르게 검토하겠습니다.')
    }
  }, [isOpen])

  const requiresDescription = selectedReason === 'other'
  const isDescriptionValid = !requiresDescription || description.trim().length >= 10

  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting) return true
    if (!selectedReason) return true
    if (!isDescriptionValid) return true
    return false
  }, [isSubmitting, selectedReason, isDescriptionValid])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitDisabled) return

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const payload = {
        targetId,
        targetType,
        reason: selectedReason,
        description: description.trim() ? description.trim().slice(0, MAX_DESCRIPTION_LENGTH) : undefined,
        metadata: {
          ...(metadata ?? {}),
          targetUrl,
          submittedFrom: 'report-modal'
        }
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setSubmitState('error')
        setErrorMessage(data?.error || '신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setSuccessMessage(data?.message || '신고가 접수되었습니다. 빠르게 검토하겠습니다.')
      setSubmitState('success')
      onSuccess?.()
    } catch (error) {
      console.error('[ReportModal] submit error', error)
      setSubmitState('error')
      setErrorMessage('신고 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="글 신고하기"
      width="520px"
      className="report-modal-root"
    >
      {submitState === 'success' ? (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
            ✓
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">신고가 접수되었습니다</h3>
            <p className="text-sm text-gray-600">{successMessage}</p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="px-6"
            onClick={onClose}
          >
            확인
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">신고 대상</p>
            {targetTitle && (
              <h3 className="mt-2 text-base font-semibold text-gray-900">{targetTitle}</h3>
            )}
            {targetExcerpt && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{targetExcerpt}</p>
            )}
            {!targetExcerpt && !targetTitle && (
              <p className="mt-2 text-sm text-gray-600">선택한 콘텐츠에 대해 신고를 진행합니다.</p>
            )}
          </section>

          <section>
            <p className="text-sm font-semibold text-gray-900 mb-3">신고 사유를 선택해주세요</p>
            <div className="space-y-2">
              {REPORT_REASON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                    selectedReason === option.value
                      ? 'border-vk-primary bg-vk-primary/10'
                      : 'border-gray-200 hover:border-vk-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={selectedReason === option.value}
                    onChange={() => setSelectedReason(option.value)}
                    className="mt-1 h-4 w-4 accent-vk-primary"
                  />
                  <span>
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    {option.description && (
                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <label htmlFor="report-description" className="text-sm font-semibold text-gray-900">
                상세 설명 (선택)
              </label>
              {requiresDescription && (
                <span className="text-xs text-vk-primary">기타 사유 선택 시 필수 (10자 이상)</span>
              )}
            </div>
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              rows={4}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-vk-primary focus:outline-none focus:ring-2 focus:ring-vk-primary/30"
              placeholder="신고 사유를 구체적으로 작성해주세요."
            />
            {requiresDescription && !isDescriptionValid && (
              <p className="mt-1 text-xs text-red-500">기타 사유를 선택한 경우 10자 이상 입력해주세요.</p>
            )}
            <p className="mt-1 text-xs text-gray-400 text-right">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </section>

          {submitState === 'error' && errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitDisabled}
              className="min-w-[110px]"
            >
              {isSubmitting ? '접수 중...' : '신고 제출'}
            </Button>
          </div>
        </form>
      )}
    </BaseModal>
  )
}
