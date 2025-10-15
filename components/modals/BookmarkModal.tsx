'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import { getBookmarks, removeBookmark, type Bookmark } from '@/lib/utils/bookmark-manager'

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
}

type FilterType = 'all' | 'question' | 'answer' | 'post'

export default function BookmarkModal({ isOpen, onClose }: BookmarkModalProps) {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filter, setFilter] = useState<FilterType>('all')

  // Load bookmarks when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBookmarks()
    }
  }, [isOpen])

  const loadBookmarks = () => {
    const allBookmarks = getBookmarks()
    setBookmarks(allBookmarks)
  }

  // Filter bookmarks
  const filteredBookmarks = filter === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.type === filter)

  // Handle bookmark click
  const handleBookmarkClick = (bookmark: Bookmark) => {
    let url = ''

    switch (bookmark.type) {
      case 'question':
        url = `/questions/${bookmark.targetId}`
        break
      case 'answer':
        // Answer는 질문 페이지로 이동 (해당 답변으로 스크롤)
        url = `/questions/${bookmark.targetId}#answer-${bookmark.targetId}`
        break
      case 'post':
        url = `/posts/${bookmark.targetId}`
        break
    }

    onClose()
    router.push(url)
  }

  // Handle bookmark remove
  const handleRemove = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation() // Prevent bookmark click

    if (confirm('북마크를 삭제하시겠습니까?')) {
      const success = removeBookmark(bookmark.targetId, bookmark.type)
      if (success) {
        loadBookmarks() // Reload bookmarks
      }
    }
  }

  // Get type icon and label
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

  // Filter button style
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
        {filteredBookmarks.length === 0 ? (
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
              const date = new Date(bookmark.created_at).toLocaleDateString('ko-KR', {
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
                  {/* Type Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <button
                      onClick={(e) => handleRemove(e, bookmark)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {bookmark.title}
                  </h3>

                  {/* Content Preview */}
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {bookmark.content}
                  </p>

                  {/* Date */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    저장일: {date}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredBookmarks.length > 0 && (
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      )}
    </BaseModal>
  )
}
