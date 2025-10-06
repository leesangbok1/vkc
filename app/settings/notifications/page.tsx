'use client'

import React, { useState, useEffect } from 'react'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useErrorLogger } from '@/lib/utils/error-logger'
import { cn } from '@/lib/utils'
import { Bell, BellOff, Mail, MessageSquare, Smartphone, Settings, Save, RefreshCcw } from 'lucide-react'

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  browser_notifications: boolean
  question_answers: boolean
  answer_comments: boolean
  question_comments: boolean
  expert_matches: boolean
  vote_updates: boolean
  weekly_digest: boolean
  mentions: boolean
  priority_threshold: 'low' | 'medium' | 'high' | 'urgent'
}

export default function NotificationSettingsPage() {
  const { user, profile } = useSafeAuth()
  const logger = useErrorLogger('NotificationSettings', 'ui')

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    browser_notifications: true,
    question_answers: true,
    answer_comments: true,
    question_comments: true,
    expert_matches: true,
    vote_updates: false,
    weekly_digest: true,
    mentions: true,
    priority_threshold: 'medium'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null)

  // 설정 로드
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      try {
        setLoading(true)

        // 브라우저 알림 권한 확인
        if ('Notification' in window) {
          setBrowserPermission(Notification.permission)
        }

        // 서버에서 사용자 알림 설정 로드
        const response = await fetch('/api/users/notification-preferences')
        if (response.ok) {
          const data = await response.json()
          setPreferences(data.preferences)
          setOriginalPreferences(data.preferences)
        } else {
          logger.error('Failed to load preferences from server', undefined, {
            action: 'loadPreferences',
            statusCode: response.status,
            severity: 'medium'
          })
        }

        setLoading(false)
      } catch (error) {
        logger.error('Failed to load notification preferences', error as Error, {
          action: 'loadPreferences',
          severity: 'medium'
        })
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user, logger])

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    }
    setPreferences(newPreferences)

    // 변경 사항 추적
    if (originalPreferences) {
      const hasChangesNow = JSON.stringify(newPreferences) !== JSON.stringify(originalPreferences)
      setHasChanges(hasChangesNow)
    }

    // 성공 메시지 숨기기
    if (saveSuccess) {
      setSaveSuccess(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setSaving(true)

      // 서버로 설정 저장
      const response = await fetch('/api/users/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to save preferences: ${response.status} - ${errorData}`)
      }

      // 성공 시 상태 업데이트
      setOriginalPreferences(preferences)
      setHasChanges(false)
      setSaveSuccess(true)

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSaveSuccess(false), 3000)

      logger.info('Notification preferences saved', {
        action: 'savePreferences',
        userId: user.id
      })

    } catch (error) {
      logger.error('Failed to save notification preferences', error as Error, {
        action: 'savePreferences',
        severity: 'medium'
      })
    } finally {
      setSaving(false)
    }
  }

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      logger.warn('Browser does not support notifications')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)

      if (permission === 'granted') {
        handlePreferenceChange('browser_notifications', true)
      }
    } catch (error) {
      logger.error('Failed to request browser notification permission', error as Error, {
        action: 'requestBrowserPermission',
        severity: 'medium'
      })
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600">알림 설정을 변경하려면 먼저 로그인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">알림 설정</h1>
        <p className="text-gray-600">받고 싶은 알림 유형과 전송 방법을 설정하세요.</p>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {/* 전송 방법 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                전송 방법
              </CardTitle>
              <CardDescription>
                알림을 받을 방법을 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 브라우저 알림 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="browser-notifications" className="text-sm font-medium">
                      브라우저 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      웹 브라우저에서 실시간 푸시 알림을 받습니다
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {browserPermission === 'denied' && (
                    <Badge variant="destructive" className="text-xs">
                      차단됨
                    </Badge>
                  )}
                  {browserPermission === 'default' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestBrowserPermission}
                    >
                      권한 요청
                    </Button>
                  ) : (
                    <Switch
                      id="browser-notifications"
                      checked={preferences.browser_notifications && browserPermission === 'granted'}
                      onCheckedChange={(checked) => handlePreferenceChange('browser_notifications', checked)}
                      disabled={browserPermission !== 'granted'}
                    />
                  )}
                </div>
              </div>

              {/* 이메일 알림 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      이메일 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      중요한 알림을 이메일로 받습니다
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                />
              </div>

              {/* 모바일 푸시 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      모바일 푸시 알림
                      <Badge variant="outline" className="ml-2 text-xs">
                        곧 출시
                      </Badge>
                    </Label>
                    <p className="text-xs text-gray-500">
                      모바일 앱 푸시 알림을 받습니다
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                  disabled={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* 알림 유형 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                알림 유형
              </CardTitle>
              <CardDescription>
                받고 싶은 알림 유형을 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="question-answers" className="text-sm font-medium">
                      질문 답변 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      내 질문에 새로운 답변이 달릴 때
                    </p>
                  </div>
                  <Switch
                    id="question-answers"
                    checked={preferences.question_answers}
                    onCheckedChange={(checked) => handlePreferenceChange('question_answers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="answer-comments" className="text-sm font-medium">
                      답변 댓글 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      내 답변에 댓글이 달릴 때
                    </p>
                  </div>
                  <Switch
                    id="answer-comments"
                    checked={preferences.answer_comments}
                    onCheckedChange={(checked) => handlePreferenceChange('answer_comments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="question-comments" className="text-sm font-medium">
                      질문 댓글 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      내 질문에 댓글이 달릴 때
                    </p>
                  </div>
                  <Switch
                    id="question-comments"
                    checked={preferences.question_comments}
                    onCheckedChange={(checked) => handlePreferenceChange('question_comments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="expert-matches" className="text-sm font-medium">
                      전문가 매칭 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      내 질문에 전문가가 매칭될 때
                    </p>
                  </div>
                  <Switch
                    id="expert-matches"
                    checked={preferences.expert_matches}
                    onCheckedChange={(checked) => handlePreferenceChange('expert_matches', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vote-updates" className="text-sm font-medium">
                      투표 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      내 게시물에 추천/비추천이 있을 때
                    </p>
                  </div>
                  <Switch
                    id="vote-updates"
                    checked={preferences.vote_updates}
                    onCheckedChange={(checked) => handlePreferenceChange('vote_updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mentions" className="text-sm font-medium">
                      멘션 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      다른 사용자가 나를 언급할 때
                    </p>
                  </div>
                  <Switch
                    id="mentions"
                    checked={preferences.mentions}
                    onCheckedChange={(checked) => handlePreferenceChange('mentions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest" className="text-sm font-medium">
                      주간 요약 알림
                    </Label>
                    <p className="text-xs text-gray-500">
                      매주 인기 질문과 답변 요약
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={preferences.weekly_digest}
                    onCheckedChange={(checked) => handlePreferenceChange('weekly_digest', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 우선순위 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>알림 우선순위</CardTitle>
              <CardDescription>
                받을 최소 우선순위를 설정하세요. 이보다 낮은 우선순위의 알림은 받지 않습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePreferenceChange('priority_threshold', priority)}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-colors',
                      preferences.priority_threshold === priority
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="text-sm font-medium">
                      {priority === 'low' && '낮음'}
                      {priority === 'medium' && '보통'}
                      {priority === 'high' && '높음'}
                      {priority === 'urgent' && '긴급'}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">설정이 저장되었습니다</span>
                </div>
              )}
              {hasChanges && !saving && (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="h-2 w-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm font-medium">저장되지 않은 변경 사항이 있습니다</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (originalPreferences) {
                    setPreferences(originalPreferences)
                    setHasChanges(false)
                    setSaveSuccess(false)
                  }
                }}
                disabled={saving || !hasChanges}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button
                onClick={handleSavePreferences}
                disabled={saving || !hasChanges}
                className={cn(
                  "min-w-[120px]",
                  hasChanges && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {saving ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    설정 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}