'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { useErrorLogger } from '@/lib/utils/error-logger'
import { createLogger } from '@/lib/utils/error-logger'

interface NotificationTestProps {
  className?: string
}

export default function NotificationTest({ className }: NotificationTestProps) {
  const { user } = useSafeAuth()
  const logger = useErrorLogger('NotificationTest', 'system')
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testNotificationCreation = async () => {
    if (!user) {
      addTestResult('❌ User not authenticated')
      return
    }

    try {
      setTesting(true)
      addTestResult('🧪 Testing notification creation...')

      const testNotification = {
        target_user_id: user.id,
        type: 'info',
        title: '테스트 알림',
        message: '이것은 알림 시스템 테스트입니다.',
        priority: 'medium',
        action_url: '/test',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        },
        channels: ['in_app']
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testNotification)
      })

      if (response.ok) {
        const data = await response.json()
        addTestResult('✅ Notification created successfully')
        addTestResult(`📦 Notification ID: ${data.notification.id}`)

        // Test fetching notifications
        await testNotificationFetch()
      } else {
        const errorData = await response.text()
        addTestResult(`❌ Failed to create notification: ${response.status}`)
        addTestResult(`📄 Error: ${errorData}`)
      }
    } catch (error) {
      logger.error('Test notification creation failed', error as Error)
      addTestResult(`❌ Exception: ${(error as Error).message}`)
    } finally {
      setTesting(false)
    }
  }

  const testNotificationFetch = async () => {
    if (!user) return

    try {
      addTestResult('🔍 Testing notification fetch...')

      const response = await fetch('/api/notifications?limit=5')
      if (response.ok) {
        const data = await response.json()
        addTestResult(`✅ Fetched ${data.notifications.length} notifications`)
        addTestResult(`📊 Pagination: page ${data.pagination.page}/${data.pagination.pages}`)
      } else {
        addTestResult(`❌ Failed to fetch notifications: ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Fetch error: ${(error as Error).message}`)
    }
  }

  const testNotificationCount = async () => {
    try {
      setTesting(true)
      addTestResult('🔢 Testing unread count...')

      const response = await fetch('/api/notifications/count')
      if (response.ok) {
        const data = await response.json()
        addTestResult(`✅ Unread count: ${data.unread_count}`)
      } else {
        addTestResult(`❌ Failed to get count: ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Count error: ${(error as Error).message}`)
    } finally {
      setTesting(false)
    }
  }

  const testMarkAllRead = async () => {
    try {
      setTesting(true)
      addTestResult('✓ Testing mark all as read...')

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        addTestResult(`✅ Marked ${data.updated_count} notifications as read`)
      } else {
        addTestResult(`❌ Failed to mark all as read: ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Mark all read error: ${(error as Error).message}`)
    } finally {
      setTesting(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (!user) {
    return (
      <div className={className}>
        <p className="text-gray-500">Login required for notification testing</p>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-4">알림 시스템 테스트</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={testNotificationCreation}
          disabled={testing}
          size="sm"
          variant="outline"
        >
          📝 알림 생성 테스트
        </Button>

        <Button
          onClick={testNotificationCount}
          disabled={testing}
          size="sm"
          variant="outline"
        >
          🔢 읽지 않은 수 테스트
        </Button>

        <Button
          onClick={testMarkAllRead}
          disabled={testing}
          size="sm"
          variant="outline"
        >
          ✓ 모두 읽음 테스트
        </Button>

        <Button
          onClick={clearResults}
          disabled={testing}
          size="sm"
          variant="ghost"
        >
          🧹 결과 지우기
        </Button>
      </div>

      {testing && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-600">테스트 진행 중...</span>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">테스트 결과:</h4>
        {testResults.length === 0 ? (
          <p className="text-sm text-gray-500">테스트를 실행해주세요.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>• 알림 생성 테스트: 새로운 테스트 알림을 생성하고 실시간 업데이트를 확인</p>
        <p>• 읽지 않은 수 테스트: 현재 읽지 않은 알림 수를 확인</p>
        <p>• 모두 읽음 테스트: 모든 알림을 읽음으로 표시</p>
      </div>
    </div>
  )
}