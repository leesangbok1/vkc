import React, { useState, useEffect } from 'react'
import { useAuth } from '@services/AuthContext'
import { useRealtime } from '@services/RealtimeContext'
import LoadingSpinner, { SkeletonLoader } from '@components/common/LoadingSpinner'
import QuestionCard from '@components/questions/QuestionCard'
import QuestionForm from '@components/questions/QuestionForm'
import WelcomeBanner from '@components/home/WelcomeBanner'
import CategoryFilter from '@components/filters/CategoryFilter'
import StatsWidget from '@components/widgets/StatsWidget'
import { fetchHomepagePosts } from "@services/firebase-api"

const HomePage = () => {
  const { user } = useAuth()
  const { isConnected } = useRealtime()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // 질문 작성 완료 핸들러
  const handleQuestionSubmit = async (questionData) => {
    // 새 질문이 추가되면 목록 새로고침
    await handleRefresh()
  }

  // 게시물 로드
  const loadPosts = async (enableRealtime = true) => {
    try {
      setError(null)
      const usersCache = {}
      const homepagePosts = await fetchHomepagePosts(usersCache, enableRealtime)
      setPosts(homepagePosts)
    } catch (err) {
      console.error('홈페이지 데이터 로드 실패:', err)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts(isConnected)
  }, [isConnected])

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts(isConnected)
  }

  // 카테고리 필터링
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory)

  if (loading) {
    return (
      <div className="homepage">
        <WelcomeBanner user={user} />
        <div className="homepage-content">
          <div className="main-content">
            <SkeletonLoader lines={5} />
          </div>
          <div className="sidebar">
            <SkeletonLoader lines={3} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="error-state">
          <div className="error-icon">
            <i className="fa-solid fa-exclamation-triangle"></i>
          </div>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => loadPosts()}>
            <i className="fa-solid fa-refresh"></i>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="homepage">
      <WelcomeBanner user={user} />

      <div className="homepage-content">
        {/* 메인 콘텐츠 */}
        <main className="main-content">
          {/* 실시간 상태 표시 */}
          <div className="realtime-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <i className={`fa-solid ${isConnected ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
              <span>{isConnected ? '실시간 연결됨' : '오프라인 모드'}</span>
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

          {/* 카테고리 필터 */}
          {/* 질문 작성 폼 */}
          <QuestionForm onSubmit={handleQuestionSubmit} />

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* 질문 목록 */}
          <div className="questions-section">
            <div className="section-header">
              <h2>
                <i className="fa-solid fa-fire"></i>
                최신 질문
                <span className="question-count">({filteredPosts.length})</span>
              </h2>
              <a href="/posts" className="view-all-link">
                전체 보기
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa-solid fa-question-circle"></i>
                </div>
                <h3>질문이 없습니다</h3>
                <p>
                  {selectedCategory === 'all'
                    ? '아직 등록된 질문이 없습니다.'
                    : `${selectedCategory} 카테고리에 질문이 없습니다.`
                  }
                </p>
                <button className="cta-btn">
                  <i className="fa-solid fa-plus"></i>
                  첫 번째 질문 작성하기
                </button>
              </div>
            ) : (
              <div className="questions-grid">
                {filteredPosts.map((post) => (
                  <QuestionCard
                    key={post.id}
                    question={post}
                    showAuthor={true}
                    showStats={true}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* 사이드바 */}
        <aside className="sidebar">
          <StatsWidget />

          {/* 인기 태그 */}
          <div className="widget">
            <h3 className="widget-title">
              <i className="fa-solid fa-tags"></i>
              인기 태그
            </h3>
            <div className="tags-cloud">
              {['비자', '생활정보', 'TOPIK', '취업', '전세', '건강보험'].map(tag => (
                <button key={tag} className="tag-btn">
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 전문가 추천 */}
          <div className="widget">
            <h3 className="widget-title">
              <i className="fa-solid fa-star"></i>
              추천 전문가
            </h3>
            <div className="experts-list">
              <div className="expert-item">
                <img src="/images/expert1.png" alt="전문가" className="expert-avatar" />
                <div className="expert-info">
                  <div className="expert-name">김민준 행정사</div>
                  <div className="expert-specialty">비자 · 법률</div>
                </div>
              </div>
              <div className="expert-item">
                <img src="/images/expert2.png" alt="전문가" className="expert-avatar" />
                <div className="expert-info">
                  <div className="expert-name">박서준 변호사</div>
                  <div className="expert-specialty">법률 상담</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* Homepage Styles */
.homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.homepage-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  margin-top: 20px;
}

.main-content {
  min-width: 0; /* Grid overflow fix */
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Realtime Status */
.realtime-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
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

/* Questions Section */
.questions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-count {
  color: #666;
  font-size: 1rem;
  font-weight: normal;
}

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #0056b3;
}

.questions-grid {
  display: grid;
  gap: 20px;
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

.cta-btn {
  background: #007bff;
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

.cta-btn:hover {
  background: #0056b3;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

/* Widget Styles */
.widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.widget-title {
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.tag-btn:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.experts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.expert-item:hover {
  background-color: #f8f9fa;
}

.expert-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.expert-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.expert-specialty {
  font-size: 12px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .homepage-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .widget {
    display: inline-block;
    margin-right: 20px;
    min-width: 200px;
  }

  .sidebar {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .homepage {
    padding: 10px;
  }

  .questions-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .realtime-status {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* Dark mode support */
[data-theme="dark"] .questions-section,
[data-theme="dark"] .widget {
  background: #2d2d2d;
}

[data-theme="dark"] .realtime-status {
  background: #404040;
  border-color: #555;
}

[data-theme="dark"] .tag-btn {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .tag-btn:hover {
  background: #007bff;
  border-color: #007bff;
}

[data-theme="dark"] .expert-item:hover {
  background-color: #404040;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default HomePage