import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from '@components/layout/Header'
import HomePage from '@pages/HomePage.jsx'
import PostDetailPage from '@pages/PostDetailPage.jsx'
import AllPostsPage from '@pages/AllPostsPage.jsx'
import LoginModal from '@components/auth/LoginModal'
import AutoTaskManager from '@components/AutoTaskManager.jsx'
import { AuthProvider, useAuth } from '@services/AuthContext'
import { RealtimeProvider } from '@services/RealtimeContext'
import { NotificationProvider } from '@services/NotificationContext'
import ErrorBoundary from '@components/common/ErrorBoundary'
import LoadingSpinner from '@components/common/LoadingSpinner'
import './index.css'

// 메인 앱 컴포넌트
function AppContent() {
  const { user, loading } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="app">
      <Header
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<AllPostsPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* AutoTaskManager - 개발 모드에서만 표시 */}
      {process.env.NODE_ENV === 'development' && <AutoTaskManager />}
    </div>
  )
}

// 루트 앱 컴포넌트
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RealtimeProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App