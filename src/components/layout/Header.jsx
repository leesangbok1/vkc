'use client'

import React, { useState } from 'react'
import { useAuth } from '../../services/AuthContext'
import { useNotifications } from '../../services/NotificationContext'

const Header = ({ onLoginClick }) => {
  const { user, logout, isAdmin } = useAuth()
  const { unreadCount } = useNotifications()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
    setIsLangMenuOpen(false)
  }

  const toggleLangMenu = () => {
    setIsLangMenuOpen(!isLangMenuOpen)
    setIsUserMenuOpen(false)
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* 로고 */}
        <div className="header-logo">
          <a href="/" className="logo-link">
            <i className="fa-solid fa-comments"></i>
            <span className="logo-text">Viet K-Connect</span>
          </a>
        </div>

        {/* 네비게이션 */}
        <nav className="header-nav">
          <a href="/" className="nav-link">
            <i className="fa-solid fa-home"></i>
            <span>홈</span>
          </a>
          <a href="/posts" className="nav-link">
            <i className="fa-solid fa-list"></i>
            <span>전체 질문</span>
          </a>
        </nav>

        {/* 헤더 메뉴 */}
        <div className="header-menu">
          {/* 언어 선택 */}
          <div className="dropdown" data-dropdown="language">
            <button
              className="header-btn dropdown-toggle"
              onClick={toggleLangMenu}
              aria-expanded={isLangMenuOpen}
              aria-label="언어 선택"
            >
              <i className="fa-solid fa-globe"></i>
            </button>
            {isLangMenuOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item active">
                  <i className="fa-solid fa-check"></i>
                  한국어
                </button>
                <button className="dropdown-item">
                  English
                </button>
                <button className="dropdown-item">
                  Tiếng Việt
                </button>
              </div>
            )}
          </div>

          {/* 알림 */}
          {user && (
            <div className="notification-wrapper">
              <button
                className="header-btn notification-btn"
                aria-label={`알림 ${unreadCount}개`}
              >
                <i className="fa-solid fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
            </div>
          )}

          {/* 사용자 메뉴 */}
          {user ? (
            <div className="dropdown" data-dropdown="user">
              <button
                className="header-btn user-btn dropdown-toggle"
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                aria-label="사용자 메뉴"
              >
                <img
                  src={user.profilePic || '/images/default-avatar.png'}
                  alt={user.name}
                  className="user-avatar"
                />
                <span className="user-name">{user.name}</span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>
              {isUserMenuOpen && (
                <div className="dropdown-menu user-menu">
                  <div className="user-info">
                    <div className="user-name-large">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item">
                    <i className="fa-solid fa-user"></i>
                    프로필
                  </button>
                  <button className="dropdown-item">
                    <i className="fa-solid fa-cog"></i>
                    설정
                  </button>
                  {isAdmin() && (
                    <>
                      <hr className="dropdown-divider" />
                      <a href="/admin.html" className="dropdown-item admin-link">
                        <i className="fa-solid fa-shield-halved"></i>
                        관리자 페이지
                      </a>
                    </>
                  )}
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <i className="fa-solid fa-sign-out-alt"></i>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="header-btn login-btn"
              onClick={onLoginClick}
              aria-label="로그인"
            >
              <i className="fa-solid fa-sign-in-alt"></i>
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* 모바일 하단 네비게이션 */}
      <nav className="mobile-nav">
        <a href="/" className="mobile-nav-item">
          <i className="fa-solid fa-home"></i>
          <span>홈</span>
        </a>
        <a href="/posts" className="mobile-nav-item">
          <i className="fa-solid fa-list"></i>
          <span>질문</span>
        </a>
        <button className="mobile-nav-item" onClick={() => alert('질문 작성')}>
          <i className="fa-solid fa-plus"></i>
          <span>작성</span>
        </button>
        {user && (
          <button className="mobile-nav-item">
            <i className="fa-solid fa-bell"></i>
            <span>알림</span>
            {unreadCount > 0 && (
              <span className="mobile-notification-badge">{unreadCount}</span>
            )}
          </button>
        )}
        <button className="mobile-nav-item" onClick={user ? toggleUserMenu : onLoginClick}>
          {user ? (
            <img
              src={user.profilePic || '/images/default-avatar.png'}
              alt={user.name}
              className="mobile-avatar"
            />
          ) : (
            <i className="fa-solid fa-user"></i>
          )}
          <span>{user ? '프로필' : '로그인'}</span>
        </button>
      </nav>
    </header>
  )
}

// CSS Styles
const styles = `
/* Header Styles */
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo .logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #007bff;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo-text {
  display: none;
}

.header-nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link span {
  display: none;
}

.header-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #666;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-btn:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.login-btn {
  background-color: #007bff;
  color: white;
  border-radius: 20px;
  padding: 8px 16px;
  width: auto;
  gap: 8px;
}

.login-btn:hover {
  background-color: #0056b3;
  color: white;
}

.login-btn span {
  display: none;
}

.user-btn {
  gap: 8px;
  border-radius: 20px;
  padding: 4px 12px 4px 4px;
  width: auto;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: none;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Dropdown Styles */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid #e0e0e0;
  min-width: 200px;
  z-index: 1000;
  animation: dropdownShow 0.2s ease;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #e7f3ff;
  color: #007bff;
}

.dropdown-item.danger {
  color: #dc3545;
}

.dropdown-item.danger:hover {
  background-color: #f8d7da;
}

.dropdown-divider {
  margin: 8px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}

.user-info {
  padding: 16px;
  background-color: #f8f9fa;
}

.user-name-large {
  font-weight: 600;
  color: #333;
}

.user-email {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.admin-link {
  color: #28a745 !important;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 8px 0;
  z-index: 100;
}

.mobile-nav {
  display: flex;
  justify-content: space-around;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.mobile-nav-item:hover {
  color: #007bff;
}

.mobile-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-notification-badge {
  position: absolute;
  top: 0;
  right: 8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  font-size: 8px;
  font-weight: bold;
  min-width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Animations */
@keyframes dropdownShow {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Desktop styles */
@media (min-width: 768px) {
  .logo-text {
    display: inline;
  }

  .nav-link span {
    display: inline;
  }

  .login-btn span {
    display: inline;
  }

  .user-name {
    display: inline;
  }

  .mobile-nav {
    display: none;
  }
}

/* Tablet styles */
@media (max-width: 1024px) {
  .header-nav {
    display: none;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .header-container {
    padding: 0 15px;
    height: 56px;
  }

  .logo-text {
    display: none;
  }

  .user-name {
    display: none;
  }

  .nav-link span {
    display: none;
  }

  .mobile-nav {
    display: flex;
  }

  body {
    padding-bottom: 70px;
  }
}

/* Dark mode support */
[data-theme="dark"] .app-header {
  background: #1a1a1a;
  border-bottom-color: #404040;
}

[data-theme="dark"] .dropdown-menu {
  background: #2d2d2d;
  border-color: #404040;
}

[data-theme="dark"] .dropdown-item {
  color: #ffffff;
}

[data-theme="dark"] .dropdown-item:hover {
  background-color: #404040;
}

[data-theme="dark"] .user-info {
  background-color: #404040;
}

[data-theme="dark"] .mobile-nav {
  background: #1a1a1a;
  border-top-color: #404040;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default Header