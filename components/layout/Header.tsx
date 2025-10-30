'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'
import { BRAND_NAME } from '@/lib/constants/branding'
import { getRandomQuestionExample } from '@/lib/utils/question-placeholders'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import BrandLogo from '@/components/common/BrandLogo'
import LoginPromptModal from '@/components/modals/LoginPromptModal'
import { useLoginModal } from '@/contexts/LoginModalContext'

type Notification = {
  id: string
  type: 'answer' | 'comment' | 'vote' | 'system'
  title: string
  message: string
  relatedUrl?: string
  createdAt: string
  isRead: boolean
  icon: string
}

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  sort_order: number
}

const TYPE_ICON_MAP: Record<Notification['type'], string> = {
  answer: '💬',
  comment: '💭',
  vote: '👍',
  system: '🛎️'
}

function determineCategory(type: string): Notification['type'] {
  const normalized = type.toLowerCase()
  if (normalized.includes('answer')) return 'answer'
  if (normalized.includes('comment')) return 'comment'
  if (normalized.includes('vote') || normalized.includes('like')) return 'vote'
  return 'system'
}

function buildRelatedUrl(actionUrl?: string | null, relatedType?: string | null, relatedId?: string | null) {
  if (actionUrl && actionUrl.startsWith('/')) return actionUrl
  if (relatedType === 'question' && relatedId) return `/questions/${relatedId}`
  if (relatedType === 'answer' && relatedId) return `/answers/${relatedId}`
  if (relatedType === 'post' && relatedId) return `/posts/${relatedId}`
  return undefined
}

export default function Header() {
  const router = useRouter()
  const { openLoginModal } = useLoginModal()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true) // FOUC 방지
  const [userName, setUserName] = useState('사용자')
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST)
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalRedirect, setLoginModalRedirect] = useState('/')
  const [loginModalMessage, setLoginModalMessage] = useState('이 기능은 로그인이 필요합니다')
  const [currentPath, setCurrentPath] = useState('/')
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topicSuggestions, setTopicSuggestions] = useState<Category[]>([])
  const [adminPending, setAdminPending] = useState<number>(0)
  const [searchPlaceholder, setSearchPlaceholder] = useState('어떤 도움이 필요하신가요?')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('🔍 Header userRole state:', userRole)
  }, [userRole])

  useEffect(() => {
    const example = getRandomQuestionExample()
    if (example?.title) {
      setSearchPlaceholder(`예: ${example.title}`)
    }
  }, [])

  useEffect(() => {
    checkAuth()
    loadCategories()
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatar_url?: string | null; name?: string }>).detail
      if (!detail) return
      if (detail.avatar_url !== undefined) {
        setAvatarUrl(detail.avatar_url ?? null)
      }
      const nextDisplayName = detail.name
      if (nextDisplayName) {
        setUserName(nextDisplayName)
      }
    }

    window.addEventListener('vk-profile-updated', handleProfileUpdated)
    return () => {
      window.removeEventListener('vk-profile-updated', handleProfileUpdated)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0)
      setRecentNotifications([])
      return
    }

    loadNotifications()
    const interval = setInterval(() => {
      loadNotifications()
    }, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [isLoggedIn])

  // Admin overview (pending certifications)
  useEffect(() => {
    async function loadAdminOverview() {
      try {
        if (userRole === UserRole.ADMIN) {
          const res = await fetch('/api/admin/overview', { cache: 'no-store' })
          if (res.ok) {
            const json = await res.json()
            setAdminPending(json?.admin?.pendingCerts || 0)
          }
        }
      } catch {}
    }
    loadAdminOverview()
  }, [userRole])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    const updateHeaderHeight = () => {
      const element = headerRef.current
      if (!element) return

      const { height } = element.getBoundingClientRect()
      if (height > 0) {
        root.style.setProperty('--header-height', `${Math.round(height)}px`)
      }
    }

    updateHeaderHeight()

    let resizeObserver: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight()
      })
      if (headerRef.current) {
        resizeObserver.observe(headerRef.current)
      }
    }

    window.addEventListener('resize', updateHeaderHeight)
    window.addEventListener('orientationchange', updateHeaderHeight)

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      window.removeEventListener('orientationchange', updateHeaderHeight)
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    if (showProfileMenu || showNotifications || showLanguageMenu || showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu, showNotifications, showLanguageMenu, showSearchDropdown])

  async function checkAuth() {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.warn('⚠️ Offline detected – skipping auth check')
      setIsLoggedIn(false)
      setUserRole(UserRole.GUEST)
      setIsDevAdmin(false)
      setAvatarUrl(null)
      setIsCheckingAuth(false)
      return
    }

    try {
      console.log('🔍 Checking auth via /api/auth/profile ...')
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })

      if (!res.ok) {
        console.log('⚪ Not authenticated:', res.status)
        setIsLoggedIn(false)
        setUserRole(UserRole.GUEST)
        setIsDevAdmin(false)
        setAvatarUrl(null)
        return
      }

      const json = await res.json()
      const userProfile = json.data

      // 온보딩 미완료여도 세션이 있으면 로그인 상태로 표시 (아이콘/메뉴 노출)
      setIsLoggedIn(true)
      setUserName(userProfile.name || '사용자')
      setAvatarUrl(typeof userProfile.avatar_url === 'string' && userProfile.avatar_url.length > 0 ? userProfile.avatar_url : null)

      const roleMapping: { [key: string]: UserRole } = {
        user: UserRole.USER,
        verified: UserRole.VERIFIED,
        admin: UserRole.ADMIN
      }
      const isAdmin = userProfile.admin_yn === 'Y' || userProfile.role === 'admin'
      const derivedRole = isAdmin ? UserRole.ADMIN : (roleMapping[userProfile.role] || UserRole.USER)
      setUserRole(derivedRole)
      setIsDevAdmin(isAdmin && !!userProfile.is_dev_mode)

      console.log('✅ Auth check complete:', userProfile.name, 'role:', userProfile.role, 'admin_yn:', userProfile.admin_yn)
      console.log('➡️ Header derived role:', derivedRole, 'isAdmin:', isAdmin)
    } catch (error) {
      console.warn('❌ Auth check failed:', error)
      setIsLoggedIn(false)
      setUserRole(UserRole.GUEST)
      setIsDevAdmin(false)
      setAvatarUrl(null)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  async function loadNotifications() {
    if (!isLoggedIn) return

    try {
      const [listRes, countRes] = await Promise.all([
        fetch('/api/notifications?limit=3', { cache: 'no-store' }),
        fetch('/api/notifications/unread-count', { cache: 'no-store' })
      ])

      if (listRes.status === 401 || countRes.status === 401) {
        setUnreadCount(0)
        setRecentNotifications([])
        return
      }

      if (!listRes.ok) {
        const payload = await listRes.json().catch(() => null)
        console.warn('[Header] notifications list fetch failed', listRes.status, payload)
        setRecentNotifications([])
        setUnreadCount(0)
        return
      }

      if (!countRes.ok) {
        const payload = await countRes.json().catch(() => null)
        console.warn('[Header] notifications count fetch failed', countRes.status, payload)
        setUnreadCount(0)
        return
      }

      const listPayload = await listRes.json()
      const countPayload = await countRes.json()

      const items = Array.isArray(listPayload?.notifications)
        ? listPayload.notifications
        : (listPayload?.data ?? [])

      const mapped: Notification[] = items.map((notification: any) => {
        const category = determineCategory(String(notification?.type || 'system'))
        return {
          id: String(notification.id),
          type: category,
          title: String(notification.title || '알림'),
          message: String(notification.message || ''),
          relatedUrl: buildRelatedUrl(notification.action_url, notification.related_type, notification.related_id),
          createdAt: typeof notification.created_at === 'string' ? notification.created_at : new Date().toISOString(),
          isRead: Boolean(notification.is_read),
          icon: TYPE_ICON_MAP[category] || '🔔'
        }
      })

      setRecentNotifications(mapped)
      setUnreadCount(Number(countPayload?.unreadCount ?? countPayload?.unread_count ?? 0))
    } catch (error) {
      console.warn('[Header] loadNotifications failed:', error)
      setRecentNotifications([])
      setUnreadCount(0)
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories', { cache: 'no-store' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || `Failed to fetch categories (${response.status})`)
      }
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([])
    }
  }

  function getTimeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diff = now.getTime() - past.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        console.log('🚪 Logging out...')

        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const json = await response.json().catch(() => null)
          console.error('❌ Logout error:', json)
          alert(json?.error || '로그아웃 중 오류가 발생했습니다.')
          return
        }

        console.log('✅ Logout successful')

        // localStorage 정리 (알림 등 로컬 데이터) - 유지할 상태는 보존
        const preservedPrefixes = [
          'vietkconnect_event_modal_state',
          'vietkconnect_tour_state'
        ]
        const preservedEntries: Array<[string, string]> = []
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i)
          if (!key) continue
          if (preservedPrefixes.some((prefix) => key.startsWith(prefix))) {
            const value = localStorage.getItem(key)
            if (value !== null) preservedEntries.push([key, value])
          }
        }

        localStorage.clear()

        preservedEntries.forEach(([key, value]) => {
          if (value !== null) {
            localStorage.setItem(key, value)
          }
        })

        // 홈으로 리디렉션
        window.location.href = '/'
      } catch (error) {
        console.error('❌ Unexpected logout error:', error)
        alert('로그아웃 중 오류가 발생했습니다.')
      }
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchDropdown(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  function handleSearchFocus() {
    if (categories.length > 0) {
      const shuffled = [...categories]
        .map((item) => ({ item, sortKey: Math.random() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ item }) => item)
      setTopicSuggestions(shuffled.slice(0, Math.min(8, shuffled.length)))
    } else {
      setTopicSuggestions([])
    }
    setShowSearchDropdown(true)
  }

  // 질문하기 버튼 핸들러
  function handleQuestionClick() {
    if (!isLoggedIn) {
      setLoginModalMessage('질문 작성은 로그인 후 이용 가능합니다')
      setLoginModalRedirect('/questions/new')
      setShowLoginModal(true)
      return
    }
    router.push('/questions/new')
  }

  const roleInfo = getRoleDisplayInfo(userRole)

  return (
    <header ref={headerRef} className="header" suppressHydrationWarning>
      <div className="header-container">
        {/* Left: Logo & Navigation */}
        <div className="header-left">
          <a
            href="/"
            className="logo"
            aria-label={`${BRAND_NAME} Home`}
            translate="no"
            data-no-translate="true"
            suppressHydrationWarning
          >
            <BrandLogo />
          </a>

          <nav className="nav-menu" translate="no" data-no-translate="true" suppressHydrationWarning>
            <a
              href="/"
              className="nav-icon home-icon"
              title="홈"
              style={{
                background: currentPath === '/' ? '#e8f4fd' : 'transparent',
                borderBottom: currentPath === '/' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              🏠
            </a>
          </nav>
        </div>

        {/* Center: Search */}
        <div
          ref={searchRef}
          className="search-container"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            minWidth: '260px',
            flex: '1 1 320px',
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              style={{ color: '#1f2937' }}
            />
          </form>

          {/* Search Dropdown - Topic 목록 */}
          {showSearchDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 'auto',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              width: '50%',
              minWidth: '160px',
              maxWidth: '210px',
              padding: '0.65rem 0.75rem 0.75rem',
              boxSizing: 'border-box'
            }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '0.45rem',
                }}
              >
                {(topicSuggestions.length ? topicSuggestions : categories.slice(0, 8)).map((category) => (
                  <a
                    key={category.id}
                    href={`/topics/${category.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '9999px',
                      background: '#f3f4f6',
                      color: '#1f2937',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      transition: 'background 0.2s, transform 0.2s',
                      lineHeight: 1.25,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e0f2fe'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
                      {category.name}
                    </span>
                  </a>
                ))}
                {categories.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '0.75rem 0' }}>
                    카테고리를 불러오는 중...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="header-right">
          {/* Language Selector */}
          <div ref={languageMenuRef} className="dropdown-container mobile-hidden">
            <button
              className="nav-icon"
              title="번역"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              translate="no"
              data-no-translate="true"
            >
              🌐
            </button>

            {showLanguageMenu && (
              <div className="language-dropdown">
                <div className="language-dropdown-header">Languages</div>
                <div className="language-dropdown-items">
                  <button
                    onClick={() => {
                      alert('언어 변경: 한국어')
                      setShowLanguageMenu(false)
                    }}
                    className="language-item"
                  >
                    <span>한국어</span>
                    <span className="language-item-active">✓</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('언어 변경: Tiếng Việt')
                      setShowLanguageMenu(false)
                    }}
                    className="language-item"
                  >
                    Tiếng Việt
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications - 로그인 상태에서만 표시 */}
          {isLoggedIn && (
            <div ref={notificationsRef} className="dropdown-container">
              <button
                className="nav-icon"
                title="알림"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3 className="notifications-title">Notifications</h3>
                    <a
                      href="/notifications"
                      className="notifications-see-all"
                      onClick={() => setShowNotifications(false)}
                    >
                      See all
                    </a>
                  </div>
                  <div className="notifications-list">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <a
                          key={notification.id}
                          href={notification.relatedUrl || '#'}
                          onClick={() => setShowNotifications(false)}
                          className={`notification-item ${!notification.isRead ? 'notification-item-unread' : ''}`}
                        >
                          <div className="notification-title">
                            {notification.icon} {notification.title}
                          </div>
                          <div className="notification-content">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {getTimeAgo(notification.createdAt)}
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="notifications-empty">알림이 없습니다</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isCheckingAuth ? (
            // 인증 체크 중: skeleton UI (FOUC 방지)
            <div style={{
              width: '80px',
              height: '40px',
              background: 'transparent'
            }}></div>
          ) : isLoggedIn ? (
            // 로그인 후: 프로필 아바타 + 드롭다운 메뉴
            <div ref={profileMenuRef} className="dropdown-container">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  className="header-profile-avatar"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  title="내 정보"
                  role="button"
                  aria-haspopup="menu"
                  aria-label="내 프로필 메뉴 열기"
                  style={{ overflow: 'hidden' }}
                >
                  <img
                    src={avatarUrl || DEFAULT_AVATAR_URL}
                    alt={`${userName}의 프로필 사진`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                {isDevAdmin && (
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem', /* 0.5rem → 0.75rem (1.5배) */
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem', /* 0.25rem → 0.35rem */
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap',
                    minWidth: '80px', /* 최소 너비 설정 */
                    justifyContent: 'center'
                  }} title="개발자 관리자 모드">
                    👑 ADMIN
                  </span>
                )}
              </div>

              {/* 드롭다운 메뉴 - 4-Tier 권한 시스템 */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  {/* CTA 버튼 */}
                  <div className="profile-dropdown-cta">
                    <button
                      onClick={() => {
                        router.push('/?modal=question')
                        setShowProfileMenu(false)
                      }}
                      className="profile-cta-button"
                    >
                      나도 질문하기
                    </button>
                  </div>

                  <div className="profile-divider"></div>

                  {/* 공통 메뉴: 프로필 / 내 게시글 / User Rank · 미션 / 설정 */}
                  {userRole !== UserRole.GUEST && (
                    <div className="profile-menu-section">
                      <button
                        type="button"
                        className="profile-menu-item"
                        onClick={() => {
                          setShowProfileMenu(false)
                          router.push('/?modal=profile')
                        }}
                      >
                        <span className="profile-menu-icon">👤</span>
                        <span className="profile-menu-text">프로필</span>
                      </button>
                      <button
                        type="button"
                        className="profile-menu-item"
                        onClick={() => {
                          setShowProfileMenu(false)
                          router.push('/?modal=followers')
                        }}
                      >
                        <span className="profile-menu-icon">👥</span>
                        <span className="profile-menu-text">팔로워 · 팔로잉</span>
                      </button>
                      <button
                        type="button"
                        className="profile-menu-item"
                        onClick={() => {
                          setShowProfileMenu(false)
                          router.push('/?modal=bookmarks')
                        }}
                      >
                        <span className="profile-menu-icon">🔖</span>
                        <span className="profile-menu-text">북마크</span>
                      </button>
                      <a href="/my-questions" className="profile-menu-item">
                        <span className="profile-menu-icon">📝</span>
                        <span className="profile-menu-text">내 게시글</span>
                      </a>
                      <button
                        type="button"
                        className="profile-menu-item"
                        onClick={() => {
                          setShowProfileMenu(false)
                          router.push('/?modal=user-rank')
                        }}
                      >
                        <span className="profile-menu-icon">🏅</span>
                        <span className="profile-menu-text">User Rank · 미션</span>
                      </button>
                      <a href="/settings" className="profile-menu-item">
                        <span className="profile-menu-icon">⚙️</span>
                        <span className="profile-menu-text">설정</span>
                      </a>
                    </div>
                  )}

                  {/* 관리자 대시보드 */}
                  {userRole === UserRole.ADMIN && (
                    <>
                      <div className="profile-divider"></div>
                      <div className="profile-menu-section">
                        <button
                          type="button"
                          className="profile-menu-item"
                          onClick={() => {
                            setShowProfileMenu(false)
                            router.push('/admin')
                          }}
                        >
                          <span className="profile-menu-icon">👑</span>
                          <span className="profile-menu-text">관리자 패널</span>
                          {adminPending > 0 && (
                            <span
                              style={{
                                marginLeft: '8px',
                                background: '#f59e0b',
                                color: 'white',
                                borderRadius: '9999px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              {adminPending}
                            </span>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                  {/* 로그아웃 */}
                  <div className="profile-menu-section">
                    <button onClick={handleLogout} className="profile-menu-item">
                      <span className="profile-menu-icon">🚪</span>
                      <span className="profile-menu-text">로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 로그인 전: 로그인 버튼
            <button
              className="login-btn"
              id="login-btn"
              title="로그인"
              onClick={() => {
                openLoginModal({ redirectTo: currentPath })
              }}
            >
              로그인
            </button>
          )}

          {/* CTA Buttons - Role-based (질문하기 버튼 제거) */}
        </div>
      </div>

      {/* 로그인 유도 모달 */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalMessage}
        redirectTo={loginModalRedirect}
      />
    </header>
  )
}
