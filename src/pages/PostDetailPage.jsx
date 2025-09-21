import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@services/AuthContext'
import LoadingSpinner from '@components/common/LoadingSpinner'

const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPostDetail()
  }, [id])

  const loadPostDetail = async () => {
    try {
      setLoading(true)
      // TODO: Firebase에서 게시물 상세 정보 로드
      // 임시 데이터
      setPost({
        id: id,
        title: '한국에서 비자 연장하는 방법을 알고 싶습니다.',
        content: '안녕하세요. 베트남에서 온 유학생입니다. 학생 비자가 곧 만료되는데 연장 방법을 자세히 알고 싶습니다.',
        category: '비자',
        tags: ['비자연장', '학생비자', '출입국'],
        author: {
          name: 'Nguyen Van A',
          profilePic: '/images/default-avatar.png'
        },
        createdAt: new Date().toISOString(),
        views: 124,
        likes: 8,
        answers: 3
      })

      setAnswers([
        {
          id: 1,
          content: '학생 비자 연장은 출입국사무소에서 진행하시면 됩니다. 필요한 서류는 재학증명서, 성적증명서, 통장잔고증명서 등입니다.',
          author: {
            name: '김민준 행정사',
            profilePic: '/images/expert1.png',
            isExpert: true
          },
          createdAt: new Date().toISOString(),
          likes: 12,
          isAccepted: true
        }
      ])
    } catch (err) {
      console.error('게시물 로드 실패:', err)
      setError('게시물을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    if (!answerText.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      // TODO: Firebase에 답변 저장
      const newAnswer = {
        id: Date.now(),
        content: answerText,
        author: {
          name: user.name,
          profilePic: user.profilePic || '/images/default-avatar.png',
          isExpert: false
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isAccepted: false
      }

      setAnswers([...answers, newAnswer])
      setAnswerText('')
      alert('답변이 등록되었습니다.')
    } catch (err) {
      console.error('답변 등록 실패:', err)
      alert('답변 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" text="게시물을 불러오는 중..." fullscreen />
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h2>게시물을 찾을 수 없습니다</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {/* 질문 섹션 */}
        <article className="question-section">
          <div className="question-header">
            <div className="question-meta">
              <span className="category-badge">{post.category}</span>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="question-stats">
              <span className="stat-item">
                <i className="fa-solid fa-eye"></i>
                조회 {post.views}
              </span>
              <span className="stat-item">
                <i className="fa-solid fa-heart"></i>
                좋아요 {post.likes}
              </span>
              <span className="stat-item">
                <i className="fa-solid fa-comment"></i>
                답변 {post.answers}
              </span>
            </div>
          </div>

          <h1 className="question-title">{post.title}</h1>

          <div className="question-content">
            <p>{post.content}</p>
          </div>

          <div className="question-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>

          <div className="question-author">
            <img src={post.author.profilePic} alt={post.author.name} className="author-avatar" />
            <span className="author-name">{post.author.name}</span>
          </div>

          <div className="question-actions">
            <button className="action-btn like-btn">
              <i className="fa-solid fa-heart"></i>
              좋아요
            </button>
            <button className="action-btn share-btn">
              <i className="fa-solid fa-share"></i>
              공유
            </button>
          </div>
        </article>

        {/* 답변 섹션 */}
        <section className="answers-section">
          <h2 className="answers-title">
            답변 {answers.length}개
          </h2>

          <div className="answers-list">
            {answers.map(answer => (
              <article key={answer.id} className={`answer-item ${answer.isAccepted ? 'accepted' : ''}`}>
                {answer.isAccepted && (
                  <div className="accepted-badge">
                    <i className="fa-solid fa-check-circle"></i>
                    채택된 답변
                  </div>
                )}

                <div className="answer-header">
                  <div className="answer-author">
                    <img src={answer.author.profilePic} alt={answer.author.name} className="author-avatar" />
                    <div className="author-info">
                      <span className="author-name">
                        {answer.author.name}
                        {answer.author.isExpert && (
                          <span className="expert-badge">
                            <i className="fa-solid fa-star"></i>
                            전문가
                          </span>
                        )}
                      </span>
                      <span className="answer-date">{new Date(answer.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>

                  <div className="answer-actions">
                    <button className="action-btn like-btn">
                      <i className="fa-solid fa-heart"></i>
                      {answer.likes}
                    </button>
                  </div>
                </div>

                <div className="answer-content">
                  <p>{answer.content}</p>
                </div>
              </article>
            ))}
          </div>

          {/* 답변 작성 폼 */}
          {user ? (
            <form className="answer-form" onSubmit={handleSubmitAnswer}>
              <h3>답변 작성</h3>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="도움이 되는 답변을 작성해주세요."
                rows={5}
                className="answer-textarea"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !answerText.trim()}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    답변 등록 중...
                  </>
                ) : (
                  '답변 등록'
                )}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>답변을 작성하려면 로그인이 필요합니다.</p>
              <button className="login-btn">로그인</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* Post Detail Page Styles */
.post-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Question Section */
.question-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-badge {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.post-date {
  color: #666;
  font-size: 14px;
}

.question-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.question-title {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.question-content {
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-content p {
  margin-bottom: 15px;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: #f8f9fa;
  color: #666;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
}

.question-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.question-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

/* Answers Section */
.answers-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.answers-title {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
}

.answer-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.answer-item.accepted {
  border-color: #28a745;
  background: #f8fff9;
}

.accepted-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.answer-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.expert-badge {
  background: #ffc107;
  color: #333;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.answer-date {
  color: #666;
  font-size: 12px;
}

.answer-actions .like-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.answer-content {
  color: #444;
  line-height: 1.6;
}

/* Answer Form */
.answer-form {
  border-top: 2px solid #f0f0f0;
  padding-top: 25px;
}

.answer-form h3 {
  color: #333;
  margin-bottom: 15px;
}

.answer-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 15px;
  font-family: inherit;
}

.answer-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Login Prompt */
.login-prompt {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  border-top: 2px solid #f0f0f0;
  margin-top: 25px;
}

.login-prompt p {
  color: #666;
  margin-bottom: 15px;
}

.login-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Error Page */
.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.error-content h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.error-content p {
  color: #666;
  margin-bottom: 25px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .post-detail-page {
    padding: 10px;
  }

  .question-section,
  .answers-section {
    padding: 20px;
  }

  .question-title {
    font-size: 1.5rem;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-stats {
    gap: 15px;
  }

  .answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Dark mode support */
[data-theme="dark"] .question-section,
[data-theme="dark"] .answers-section {
  background: #2d2d2d;
}

[data-theme="dark"] .answer-item {
  border-color: #555;
  background: #404040;
}

[data-theme="dark"] .answer-item.accepted {
  background: #1a3d1a;
  border-color: #28a745;
}

[data-theme="dark"] .answer-textarea {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .login-prompt {
  background: #404040;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default PostDetailPage