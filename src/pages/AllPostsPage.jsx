import React, { useState, useEffect } from 'react'
import { useAuth } from '@services/AuthContext'
import { useRealtime } from '@services/RealtimeContext'
import LoadingSpinner, { SkeletonLoader } from '@components/common/LoadingSpinner'
import QuestionCard from '@components/questions/QuestionCard'
import CategoryFilter from '@components/filters/CategoryFilter'

const AllPostsPage = () => {
  const { user } = useAuth()
  const { isConnected } = useRealtime()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const postsPerPage = 10

  // 샘플 데이터
  const samplePosts = [
    {
      id: 1,
      title: '한국에서 비자 연장하는 방법을 알고 싶습니다.',
      content: '안녕하세요. 베트남에서 온 유학생입니다. 학생 비자가 곧 만료되는데...',
      category: '비자',
      tags: ['비자연장', '학생비자'],
      author: {
        name: 'Nguyen Van A',
        profilePic: '/images/default-avatar.png'
      },
      createdAt: new Date().toISOString(),
      views: 124,
      likes: 8,
      answers: 3,
      isAnswered: true
    },
    {
      id: 2,
      title: 'TOPIK 시험 준비 어떻게 하나요?',
      content: 'TOPIK 6급을 목표로 하고 있습니다. 효과적인 공부 방법이 있을까요?',
      category: '교육',
      tags: ['TOPIK', '한국어시험'],
      author: {
        name: 'Tran Thi B',
        profilePic: '/images/default-avatar.png'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      views: 89,
      likes: 12,
      answers: 7,
      isAnswered: true
    },
    {
      id: 3,
      title: '한국에서 일자리 구하는 팁',
      content: '졸업 후 한국에서 취업을 희망합니다. 어떤 준비를 해야 할까요?',
      category: '취업',
      tags: ['취업', '구직'],
      author: {
        name: 'Le Van C',
        profilePic: '/images/default-avatar.png'
      },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      views: 156,
      likes: 15,
      answers: 5,
      isAnswered: false
    }
  ]

  // 게시물 로드
  const loadPosts = async (page = 1, append = false) => {
    try {
      if (!append) {
        setError(null)
        setLoading(true)
      }

      // TODO: Firebase에서 실제 데이터 로드
      await new Promise(resolve => setTimeout(resolve, 500)) // 로딩 시뮬레이션

      const newPosts = samplePosts.map(post => ({
        ...post,
        id: post.id + (page - 1) * postsPerPage
      }))

      if (append) {
        setPosts(prev => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }

      setHasMore(page < 3) // 3페이지까지만
    } catch (err) {
      console.error('게시물 로드 실패:', err)
      setError('게시물을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts(1)
  }, [])

  // 검색 및 필터링
  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'popular':
          return b.views - a.views
        case 'likes':
          return b.likes - a.likes
        case 'answers':
          return b.answers - a.answers
        default:
          return 0
      }
    })

  // 더 보기
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    loadPosts(nextPage, true)
  }

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true)
    setCurrentPage(1)
    await loadPosts(1)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="all-posts-page">
        <div className="page-header">
          <h1>전체 질문</h1>
        </div>
        <div className="posts-container">
          <SkeletonLoader lines={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="all-posts-page">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="header-content">
          <h1>전체 질문</h1>
          <p>한국 거주 베트남인들의 모든 질문과 답변을 확인하세요</p>
        </div>

        <div className="header-actions">
          <button className="new-question-btn">
            <i className="fa-solid fa-plus"></i>
            새 질문 작성
          </button>
        </div>
      </div>

      {/* 실시간 상태 및 새로고침 */}
      <div className="status-bar">
        <div className="status-info">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <i className={`fa-solid ${isConnected ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
            <span>{isConnected ? '실시간 연결됨' : '오프라인 모드'}</span>
          </div>
          <span className="total-count">총 {filteredAndSortedPosts.length}개 질문</span>
        </div>

        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
          title="새로고침"
        >
          <i className={`fa-solid fa-refresh ${refreshing ? 'spinning' : ''}`}></i>
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="filters-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="질문 제목, 내용, 태그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="검색어 지우기"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="filter-controls">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showAll={true}
          />

          <div className="sort-controls">
            <label htmlFor="sort-select">정렬:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="popular">인기순</option>
              <option value="likes">좋아요순</option>
              <option value="answers">답변순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="posts-container">
        {error ? (
          <div className="error-state">
            <div className="error-icon">
              <i className="fa-solid fa-exclamation-triangle"></i>
            </div>
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => loadPosts(1)}>
              <i className="fa-solid fa-refresh"></i>
              다시 시도
            </button>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fa-solid fa-search"></i>
            </div>
            <h3>검색 결과가 없습니다</h3>
            <p>
              {searchTerm || selectedCategory !== 'all'
                ? '검색 조건을 변경해보세요.'
                : '아직 등록된 질문이 없습니다.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {filteredAndSortedPosts.map((post) => (
                <QuestionCard
                  key={post.id}
                  question={post}
                  showAuthor={true}
                  showStats={true}
                  showCategory={true}
                />
              ))}
            </div>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="load-more-section">
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      로딩 중...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus"></i>
                      더 많은 질문 보기
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* All Posts Page Styles */
.all-posts-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-content h1 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 8px 0;
}

.header-content p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.new-question-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.new-question-btn:hover {
  background: #0056b3;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-indicator.connected {
  color: #28a745;
}

.status-indicator.disconnected {
  color: #dc3545;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.refresh-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
  color: #007bff;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-bar {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  background: #f0f0f0;
  color: #333;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.sort-select:focus {
  outline: none;
  border-color: #007bff;
}

/* Posts Container */
.posts-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.posts-grid {
  display: grid;
  gap: 20px;
}

/* Load More */
.load-more-section {
  margin-top: 30px;
  text-align: center;
}

.load-more-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  margin-bottom: 30px;
  line-height: 1.6;
}

.clear-filters-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background: #0056b3;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error-state p {
  color: #666;
  margin-bottom: 30px;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: #c82333;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .sort-controls {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .all-posts-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-content h1 {
    font-size: 1.6rem;
  }

  .header-content p {
    font-size: 1rem;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .status-info {
    flex-direction: column;
    gap: 10px;
  }

  .filters-section {
    padding: 15px;
  }

  .search-input-wrapper {
    max-width: none;
  }

  .filter-controls {
    gap: 10px;
  }

  .posts-container {
    padding: 15px;
  }
}

/* Dark mode support */
[data-theme="dark"] .filters-section,
[data-theme="dark"] .posts-container {
  background: #2d2d2d;
}

[data-theme="dark"] .status-bar {
  background: #404040;
  border-color: #555;
}

[data-theme="dark"] .search-input {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .sort-select {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .load-more-btn {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .clear-search:hover {
  background: #555;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default AllPostsPage