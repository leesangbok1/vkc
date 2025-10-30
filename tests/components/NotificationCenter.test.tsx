import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import {
  createClientNotifications,
  createNotificationServiceMock
} from '../utils/notificationTestUtils'
import { notificationService } from '@/lib/services/notification-service'

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
})) as {
  error: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
}

vi.mock('@/components/providers/ClientProviders', () => ({
  useSafeAuth: () => ({ user: { id: 'user-test' } })
}))

vi.mock('@/lib/utils/error-logger', () => ({
  useErrorLogger: () => loggerMock,
  createLogger: () => loggerMock
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}))

vi.mock('lucide-react', () => ({
  Bell: () => <span role="img" aria-label="bell">🔔</span>,
  Check: () => <span>✔️</span>,
  CheckCheck: () => <span>✔️✔️</span>,
  Settings: () => <span>⚙️</span>,
  X: () => <span>✖️</span>
}))

vi.mock('@/lib/services/notification-service', async () => {
  const actual = await vi.importActual<typeof import('@/lib/services/notification-service')>(
    '@/lib/services/notification-service'
  )

  return {
    ...actual,
    notificationService: {
      ...actual.notificationService,
      getNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      requestNotificationPermission: vi.fn(),
      setClientPreferences: vi.fn(),
      resetPreferenceCache: vi.fn(),
      showBrowserNotification: vi.fn()
    }
  }
})

describe('NotificationCenter', () => {
  let notificationsFixture = createClientNotifications()
  const mockedNotificationService = notificationService as unknown as ReturnType<
    typeof createNotificationServiceMock
  >

  beforeEach(() => {
    notificationsFixture = createClientNotifications()
    const serviceMock = createNotificationServiceMock({ notifications: notificationsFixture })

    Object.assign(mockedNotificationService, serviceMock)
    mockedNotificationService.subscribe.mockReturnValue(() => {})
    loggerMock.error.mockReset()
    loggerMock.warn.mockReset()
    loggerMock.info.mockReset()
    window.open = vi.fn()
  })

  it('renders notifications, highlights priority, and marks unread items as read', async () => {
    render(<NotificationCenter />)

    await waitFor(() => {
      expect(mockedNotificationService.getNotifications).toHaveBeenCalled()
    })

    const triggerButton = await screen.findByRole('button', { name: '알림 1개' })
    fireEvent.click(triggerButton)

    const unreadNotificationTitle = await screen.findByText(notificationsFixture[0].title)
    const notificationCard =
      unreadNotificationTitle.parentElement?.parentElement?.parentElement?.parentElement
    expect(notificationCard?.className).toContain('border-orange-500')

    const markAsReadButton = within(notificationCard as HTMLElement).getByRole('button', {
      name: /읽음$/
    })
    fireEvent.click(markAsReadButton)

    expect(mockedNotificationService.markAsRead).toHaveBeenCalledWith([
      notificationsFixture[0].id
    ])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '알림 0개' })).toBeInTheDocument()
    })
    expect(notificationCard?.className).not.toContain('bg-blue-50')
  })
})
