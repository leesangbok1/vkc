'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import {
  getBookmarks,
  removeBookmark,
  type Bookmark
} from '@/lib/utils/bookmark-manager'

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
}

type FilterType = 'all' | 'question' | 'answer' | 'post'

export default function BookmarkModal({ isOpen, onClose }: BookmarkModalProps) {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Load bookmarks when modal opens
  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      try {
        const list = await getBookmarks()
        if (!ignore) setBookmarks(list)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    if (isOpen) {
      load()
    }

    return () => {
      ignore = true
    }
  }, [isOpen])

  const filteredBookmarks = filter === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.type === filter)

  const handleBookmarkClick = (bookmark: Bookmark) => {
    let url = ''

    switch (bookmark.type) {
      case 'question':
        url = `/questions/${bookmark.targetId}`
        break
      case 'answer':
        url = `/questions/${bookmark.targetId}#answer-${bookmark.targetId}`
        break
      case 'post':
        url = `/posts/${bookmark.targetId}`
        break
      default:
        url = '/'
    }

    onClose()
    router.push(url)
  }

  const handleRemove = async (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation()

    const confirmed = window.confirm('북마크를 삭제하시겠습니까?')
    if (!confirmed) return

    const success = await removeBookmark(bookmark.id)
    if (success) {
      setBookmarks(prev => prev.filter(item => item.id !== bookmark.id))
    } else {
      alert('북마크 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const getTypeInfo = (type: Bookmark['type']) => {
    switch (type) {
      case 'question':
        return { icon: '❓', label: '질문' }
      case 'answer':
        return { icon: '✅', label: '답변' }
      case 'post':
        return { icon: '📄', label: '게시글' }
    }
  }

  const filterStyle = (filterType: FilterType) => ({
    padding: '0.5rem 1rem',
    border: 'none',
    background: filter === filterType ? '#3b82f6' : '#f3f4f6',
    color: filter === filterType ? 'white' : '#6b7280',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="600px"
      adaptiveMode={true}
    >
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          🔖 북마크
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          저장한 질문, 답변, 게시글을 확인하세요
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
        overflowX: 'auto'
      }}>
        <button onClick={() => setFilter('all')} style={filterStyle('all')}>
          전체 ({bookmarks.length})
        </button>
        <button onClick={() => setFilter('question')} style={filterStyle('question')}>
          질문 ({bookmarks.filter(b => b.type === 'question').length})
        </button>
        <button onClick={() => setFilter('answer')} style={filterStyle('answer')}>
          답변 ({bookmarks.filter(b => b.type === 'answer').length})
        </button>
        <button onClick={() => setFilter('post')} style={filterStyle('post')}>
          게시글 ({bookmarks.filter(b => b.type === 'post').length})
        </button>
      </div>

      {/* Bookmark List */}
      <div style={{
        padding: '1rem 1.5rem',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>북마크를 불러오는 중입니다...</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              저장된 북마크가 없습니다
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              질문, 답변, 게시글을 북마크하여 나중에 쉽게 찾아보세요
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredBookmarks.map((bookmark) => {
              const typeInfo = getTypeInfo(bookmark.type)
              const date = new Date(bookmark.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })

              return (
                <div
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark)}
                  style={{
                    padding: '1rem',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{typeInfo?.icon}</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{typeInfo?.label}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{date}</span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1f2937' }}>
                    {bookmark.title || '제목 없는 북마크'}
                  </div>

                  <div style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {bookmark.content
                      ? bookmark.content.length > 200
                        ? `${bookmark.content.slice(0, 200)}...`
                        : bookmark.content
                      : '저장된 미리보기가 없습니다.'}
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      style={{
                        background: 'white',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => handleRemove(e, bookmark)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </BaseModal>
  )
}
