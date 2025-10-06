import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginModal from '@/components/LoginModal'

// Mock global fetch and alert
global.fetch = vi.fn()
global.alert = vi.fn()

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: vi.fn()
  },
  writable: true
})

// Mock UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    <p>{children}</p>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: {
    children: React.ReactNode,
    onClick?: () => void,
    disabled?: boolean
  }) =>
    <button onClick={onClick} disabled={disabled}>{children}</button>
}))

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) =>
    <div>{children}</div>
}))

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span>⚠️</span>
}))

describe('LoginModal Component', () => {
  const mockOnClose = vi.fn()
  const mockFetch = global.fetch as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    ;(global.alert as any).mockClear()
    ;(window.location.reload as any).mockClear()
    window.location.href = ''

    // Reset document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    })
  })

  it('should render login modal when open', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('로그인')).toBeInTheDocument()
    expect(screen.getByText('VietKConnect에 오신 것을 환영합니다. 소셜 계정으로 간편하게 로그인하세요.')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <LoginModal
        isOpen={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('should display social login buttons', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Google로 로그인')).toBeInTheDocument()
    expect(screen.getByText('카카오로 로그인')).toBeInTheDocument()
  })

  it('should handle Google login click', async () => {
    // Mock successful Google auth response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        url: 'https://accounts.google.com/oauth/authorize?...'
      })
    })

    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const googleButton = screen.getByText('Google로 로그인')

    await act(async () => {
      fireEvent.click(googleButton)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/social?provider=google', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should handle Kakao login click', async () => {
    // Mock successful Kakao auth response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          auth_url: 'https://kauth.kakao.com/oauth/authorize?...'
        }
      })
    })

    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const kakaoButton = screen.getByText('카카오로 로그인')

    await act(async () => {
      fireEvent.click(kakaoButton)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'kakao',
        returnTo: '/'
      })
    })
  })

  it('should show loading state during authentication', async () => {
    // Mock a slow authentication process
    mockFetch.mockImplementation(
      () => new Promise(resolve =>
        setTimeout(() => resolve({
          json: () => Promise.resolve({
            success: true,
            url: 'https://accounts.google.com/oauth/authorize?...'
          })
        }), 100)
      )
    )

    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const googleButton = screen.getByText('Google로 로그인')

    await act(async () => {
      fireEvent.click(googleButton)
    })

    // All buttons should be disabled during loading
    expect(googleButton).toBeDisabled()
    expect(screen.getByText('카카오로 로그인')).toBeDisabled()
  })

  it('should display error message on authentication failure', async () => {
    // Mock failed auth response
    mockFetch.mockRejectedValueOnce(new Error('Authentication failed'))

    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const googleButton = screen.getByText('Google로 로그인')

    await act(async () => {
      fireEvent.click(googleButton)
    })

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('로그인에 실패했습니다. 다시 시도해주세요.')
    })
  })

  it('should handle auth callback success', async () => {
    // Mock successful auth callback
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'auth-callback-success=true'
    })

    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Wait for the interval to check cookies
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    }, { timeout: 2000 })
  })
})