'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'
import LoginPromptModal from '@/components/modals/LoginPromptModal'

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

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('사용자')
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST)
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalRedirect, setLoginModalRedirect] = useState('/')
  const [loginModalMessage, setLoginModalMessage] = useState('이 기능은 로그인이 필요합니다')
  const [currentPath, setCurrentPath] = useState('/')
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
    loadNotifications() // 알림 로드
    // 현재 페이지 경로 저장
    setCurrentPath(window.location.pathname)

    // storage 이벤트 리스너 추가 (다른 탭/창에서 localStorage 변경 감지)
    window.addEventListener('storage', checkAuth)
    window.addEventListener('storage', loadNotifications) // 알림 변경 감지

    // 같은 탭에서의 localStorage 변경을 감지하기 위한 interval
    const interval = setInterval(() => {
      checkAuth()
      loadNotifications()
    }, 500)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('storage', loadNotifications)
      clearInterval(interval)
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
    }

    if (showProfileMenu || showNotifications || showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu, showNotifications, showLanguageMenu])

  async function checkAuth() {
    try {
      // 🎭 MOCK: localStorage에서 mock session 체크
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')
      const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')

      // 로그인 + 온보딩 완료된 경우만 로그인 상태로 인정
      if (mockSession === 'true' && mockUser && onboardingCompleted === 'true') {
        const user = JSON.parse(mockUser)
        setIsLoggedIn(true)
        setUserName(user.name || user.email || '사용자')
        setUserRole(user.role || UserRole.USER)

        // 개발자 ADMIN 모드 확인
        if (user.is_dev_mode && user.role === 'admin') {
          setIsDevAdmin(true)
        } else {
          setIsDevAdmin(false)
        }
      } else {
        // 로그인 안됨 또는 온보딩 미완료
        setIsLoggedIn(false)
        setUserRole(UserRole.GUEST)
        setIsDevAdmin(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setUserRole(UserRole.GUEST)
      setIsDevAdmin(false)
    }
  }

  function loadNotifications() {
    try {
      const stored = localStorage.getItem('vietkconnect_notifications')
      if (stored) {
        const notifications: Notification[] = JSON.parse(stored)
        const unread = notifications.filter(n => !n.isRead)
        setUnreadCount(unread.length)
        // 최근 3개 알림만 헤더 드롭다운에 표시
        setRecentNotifications(notifications.slice(0, 3))
      } else {
        setUnreadCount(0)
        setRecentNotifications([])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setUnreadCount(0)
      setRecentNotifications([])
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

  function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.clear()
      window.location.href = '/'
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
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
    <header className="header">
      <div className="header-container">
        {/* Left: Logo & Navigation */}
        <div className="header-left">
          <a href="/" className="logo">
            <span>VietKConnect</span>
          </a>

          <nav className="nav-menu">
            <a href="/" className="nav-icon home-icon" title="홈">
              🏠
            </a>
            <a href="/questions" className="nav-icon" title="답변">
              📝
            </a>
            <a href="/following" className="nav-icon" title="팔로잉">
              👥
            </a>
          </nav>
        </div>

        {/* Center: Search */}
        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-icon">🔍</div>
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right: Actions */}
        <div className="header-right">
          {/* Language Selector */}
          <div ref={languageMenuRef} className="dropdown-container">
            <button
              className="nav-icon"
              title="번역"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
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

          {isLoggedIn ? (
            // 로그인 후: 프로필 아바타 + 드롭다운 메뉴
            <div ref={profileMenuRef} className="dropdown-container">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="header-profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)} title={userName}>
                  👤
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
                        window.location.href = '/questions/new'
                        setShowProfileMenu(false)
                      }}
                      className="profile-cta-button"
                    >
                      나도 질문하기
                    </button>
                  </div>

                  <div className="profile-divider"></div>

                  {/* 역할 배지 */}
                  <div className="profile-menu-section">
                    <div className="profile-menu-item">
                      <span className="profile-menu-icon">{roleInfo.icon}</span>
                      <span className={`profile-role-badge role-${userRole.toLowerCase()}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="profile-divider"></div>

                  {/* USER 이상 메뉴 */}
                  {userRole !== UserRole.GUEST && (
                    <>
                      <div className="profile-menu-section">
                        <a href="/profile" className="profile-menu-item">
                          <span className="profile-menu-icon">👤</span>
                          <span className="profile-menu-text">지식 프로필</span>
                        </a>
                        <a href="/my-questions" className="profile-menu-item">
                          <span className="profile-menu-icon">📝</span>
                          <span className="profile-menu-text">내 질문</span>
                        </a>
                        <a href="/settings" className="profile-menu-item">
                          <span className="profile-menu-icon">⚙️</span>
                          <span className="profile-menu-text">설정</span>
                        </a>
                      </div>

                      <div className="profile-divider"></div>
                    </>
                  )}

                  {/* USER: Certified 신청 */}
                  {userRole === UserRole.USER && (
                    <>
                      <div className="profile-menu-section">
                        <a href="/experts/apply" className="profile-menu-item">
                          <span className="profile-menu-icon">✅</span>
                          <span className="profile-menu-text">Certified 신청</span>
                        </a>
                      </div>
                      <div className="profile-divider"></div>
                    </>
                  )}

                  {/* VERIFIED: Certified Network */}
                  {userRole === UserRole.VERIFIED && (
                    <>
                      <div className="profile-menu-section">
                        <a href="/experts/network" className="profile-menu-item">
                          <span className="profile-menu-icon">🤝</span>
                          <span className="profile-menu-text">Certified Network</span>
                        </a>
                      </div>
                      <div className="profile-divider"></div>
                    </>
                  )}

                  {/* ADMIN: 관리자 대시보드 */}
                  {userRole === UserRole.ADMIN && (
                    <>
                      <div className="profile-menu-section">
                        <a href="/admin" className="profile-menu-item">
                          <span className="profile-menu-icon">👑</span>
                          <span className="profile-menu-text">관리자 대시보드</span>
                        </a>
                      </div>
                      <div className="profile-divider"></div>
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
                const redirectTo = encodeURIComponent(currentPath)
                window.location.href = `/auth/login?redirectTo=${redirectTo}`
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
