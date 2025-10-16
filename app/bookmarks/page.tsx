'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBookmarks, removeBookmark as removeBookmarkUtil, Bookmark } from '@/lib/utils/bookmark-manager'

export default function BookmarksPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')

      if (mockSession === 'true' && mockUser) {
        setIsLoggedIn(true)
        loadBookmarks()
      } else {
        router.push('/auth/login?redirectTo=/bookmarks')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?redirectTo=/bookmarks')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  function loadBookmarks() {
    try {
      const stored = getBookmarks()
      setBookmarks(stored)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      setBookmarks([])
    }
  }

  function removeBookmark(targetId: string, type: 'question' | 'answer' | 'post') {
    const success = removeBookmarkUtil(targetId, type)
    if (success) {
      loadBookmarks() // Reload from localStorage
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="main-layout">
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              animation: 'spin 1s linear infinite'
            }}>⏳</div>
            <p>로딩 중...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-layout">
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          padding: '2rem 0',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#333'
            }}>
              🔖 북마크
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666'
            }}>
              나중에 다시 보고 싶은 질문과 정보글을 모아보세요
            </p>
          </div>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              whiteSpace: 'nowrap'
            }}
            onClick={() => router.push('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}
          >
            🔍 북마크할 게시글 찾기
          </button>
        </div>

        {/* Bookmarks List */}
        <div style={{ padding: '2rem 0' }}>
          {bookmarks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>🔖</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                북마크가 비어있습니다
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#666',
                marginBottom: '2rem'
              }}>
                질문이나 정보글에서 북마크 버튼을 눌러보세요
              </p>
              <button
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
                onClick={() => router.push('/')}
              >
                둘러보러 가기
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {bookmarks.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => {
                    if (item.type === 'question') {
                      router.push(`/questions/${item.targetId}`)
                    } else if (item.type === 'post') {
                      router.push(`/posts/${item.targetId}`)
                    } else {
                      // answer type - navigate to question with answer ID
                      router.push(`/questions/${item.targetId}`)
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>
                        {item.type === 'question' ? '❓' : item.type === 'post' ? '📝' : '💬'}
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        color: '#667eea',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {item.type === 'question' ? 'Question' : item.type === 'post' ? 'Post' : 'Answer'}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '0.5rem'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      저장일: {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <button
                    style={{
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      color: '#666',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookmark(item.targetId, item.type)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc3545'
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.borderColor = '#dc3545'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa'
                      e.currentTarget.style.color = '#666'
                      e.currentTarget.style.borderColor = '#dee2e6'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
