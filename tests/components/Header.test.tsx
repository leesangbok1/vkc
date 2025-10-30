import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/components/layout/Header'
import { BRAND_NAME } from '@/lib/constants/branding'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { createSerializedNotifications } from '../utils/notificationTestUtils'

const mockLoginModalContext = {
  isOpen: false,
  redirectTo: '/',
  message: undefined,
  onClose: undefined,
  openLoginModal: vi.fn(),
  closeLoginModal: vi.fn()
}

vi.mock('@/contexts/LoginModalContext', () => ({
  useLoginModal: () => mockLoginModalContext
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/'
  })
}))

// Mock theme provider
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn()
  })
}))

// Mock UI components
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div aria-label="로딩 중" className={className}>로딩 스켈레톤</div>
  )
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string, alt?: string }) => (
    src ? <img src={src} alt={alt} role="img" /> : null
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
  )
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, asChild, onClick, disabled }: {
    children: React.ReactNode,
    asChild?: boolean,
    onClick?: () => void,
    disabled?: boolean
  }) => (
    <div onClick={onClick} aria-disabled={disabled}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>{children}</button>
  )
}))

vi.mock('lucide-react', () => ({
  LogIn: () => <span>🔑</span>,
  User: () => <span>👤</span>,
  Settings: () => <span>⚙️</span>,
  LogOut: () => <span>🚪</span>,
  MessageSquare: () => <span>💬</span>
}))

// Mock other components
vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div>테마 토글</div>
}))

vi.mock('@/components/LoginModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) =>
    isOpen ? <div onClick={onClose}>로그인 모달</div> : null
}))

vi.mock('@/components/notifications/NotificationCenterMobile', () => ({
  default: ({ className }: { className?: string }) => <div className={className}>알림 센터</div>
}))

vi.mock('@/components/notifications/NotificationErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('@/components/banners/ValuePropositionBanner', () => ({
  HeaderBanner: () => <div>헤더 배너</div>
}))

vi.mock('@/components/layout/ConditionalLayout', () => ({
  ConditionalBanner: () => <div>조건부 배너</div>,
  RoleBasedWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

vi.mock('@/lib/utils/permissions', () => ({
  UserRole: {
    GUEST: 'guest',
    USER: 'user',
    VERIFIED: 'verified',
    ADMIN: 'admin'
  },
  getLayoutConfig: () => ({
    badgeColor: 'bg-blue-500',
    label: '사용자',
    icon: '👤',
    bannerVariant: 'default'
  }),
  getRoleDisplayInfo: () => ({
    badgeColor: 'bg-blue-500',
    label: '사용자',
    gradientClass: 'from-blue-500 to-blue-700',
    icon: '👤'
  })
}))

type ProfileState = {
  success: boolean
  data: {
    name: string
    avatar_url: string | null
    role: string
    admin_yn?: string
    is_dev_mode?: boolean
  }
}

let profileState: ProfileState
let categoriesState: Array<Record<string, any>>
let notificationsState: Array<Record<string, any>>
let unreadCountState: number

const createResponse = (
  body: any,
  init: { ok?: boolean, status?: number } = {}
) => ({
  ok: init.ok ?? true,
  status: init.status ?? 200,
  json: async () => body
})

const getUrlString = (input: RequestInfo | URL) => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return (input as Request).url
}

const setAuthenticatedProfile = (overrides?: Partial<ProfileState['data']>) => {
  profileState.success = true
  profileState.data = {
    name: overrides?.name ?? '테스트 사용자',
    avatar_url: overrides?.avatar_url ?? null,
    role: overrides?.role ?? 'user',
    admin_yn: overrides?.admin_yn ?? 'N',
    is_dev_mode: overrides?.is_dev_mode ?? false
  }
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoginModalContext.isOpen = false
    mockLoginModalContext.redirectTo = '/'
    mockLoginModalContext.message = undefined
    mockLoginModalContext.onClose = undefined
    mockLoginModalContext.openLoginModal.mockClear()
    mockLoginModalContext.closeLoginModal.mockClear()

    profileState = {
      success: false,
      data: {
        name: '커뮤니티 멤버',
        avatar_url: null,
        role: 'guest',
        admin_yn: 'N',
        is_dev_mode: false
      }
    }
    categoriesState = []
    notificationsState = createSerializedNotifications().map((notification) => ({ ...notification }))
    unreadCountState = notificationsState.filter((notification) => !notification.is_read).length

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = getUrlString(input)

      if (url.includes('/api/auth/profile')) {
        if (profileState.success) {
          return createResponse({ data: profileState.data })
        }
        return createResponse({ error: 'Unauthorized' }, { ok: false, status: 401 })
      }

      if (url.includes('/api/categories')) {
        return createResponse({ success: true, data: categoriesState })
      }

      if (url.includes('/api/notifications/unread-count')) {
        return createResponse({ unreadCount: unreadCountState })
      }

      if (url.includes('/api/notifications')) {
        return createResponse({ notifications: notificationsState })
      }

      return createResponse({})
    }) as unknown as typeof fetch
  })

  it('renders brand logo link', async () => {
    render(<Header />)

    const homeLink = await screen.findByLabelText(`${BRAND_NAME} Home`)
    expect(homeLink).toHaveAttribute('href', '/')
    expect(await screen.findByText(BRAND_NAME)).toBeInTheDocument()
  })

  it('shows login button when user is not authenticated', async () => {
    render(<Header />)

    const loginButton = await screen.findByRole('button', { name: '로그인' })
    expect(loginButton).toBeInTheDocument()
    expect(mockLoginModalContext.openLoginModal).not.toHaveBeenCalled()
  })

  it('opens login modal when login button is clicked', async () => {
    render(<Header />)

    const loginButton = await screen.findByRole('button', { name: '로그인' })
    fireEvent.click(loginButton)

    expect(mockLoginModalContext.openLoginModal).toHaveBeenCalledWith({ redirectTo: '/' })
  })

  it('shows user avatar when authenticated', async () => {
    setAuthenticatedProfile({
      name: '테스트 사용자',
      avatar_url: 'https://example.com/avatar.jpg'
    })

    render(<Header />)

    const avatar = await screen.findByRole('img', { name: '테스트 사용자의 프로필 사진' })
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('uses default avatar when user has no avatar', async () => {
    setAuthenticatedProfile({
      name: '테스트 사용자',
      avatar_url: null
    })

    render(<Header />)

    const avatar = await screen.findByRole('img', { name: '테스트 사용자의 프로필 사진' })
    expect(avatar).toHaveAttribute('src', DEFAULT_AVATAR_URL)
  })

  it('opens profile dropdown for authenticated user', async () => {
    setAuthenticatedProfile({
      name: '테스트 사용자',
      avatar_url: 'https://example.com/avatar.jpg'
    })

    render(<Header />)

    const menuTrigger = await screen.findByRole('button', { name: '내 프로필 메뉴 열기' })
    fireEvent.click(menuTrigger)

    const logoutButton = await screen.findByText('로그아웃')
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton.closest('button')).not.toBeNull()
  })
})
