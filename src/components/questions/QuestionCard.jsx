import React from 'react'

const QuestionCard = ({
  question,
  showAuthor = true,
  showStats = true,
  showCategory = false,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(question)
    } else {
      // 기본 동작: 질문 상세 페이지로 이동
      window.location.href = `/post/${question.id}`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24)
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  }

  return (
    <article className="question-card" onClick={handleClick}>
      {/* 카테고리 배지 */}
      {showCategory && question.category && (
        <div className="question-category">
          <span className="category-badge">{question.category}</span>
        </div>
      )}

      {/* 질문 제목 */}
      <h3 className="question-title">{question.title}</h3>

      {/* 질문 내용 미리보기 */}
      <div className="question-preview">
        <p>{question.content}</p>
      </div>

      {/* 태그 */}
      {question.tags && question.tags.length > 0 && (
        <div className="question-tags">
          {question.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
          {question.tags.length > 3 && (
            <span className="tag-more">+{question.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* 질문 메타 정보 */}
      <div className="question-meta">
        {/* 작성자 정보 */}
        {showAuthor && question.author && (
          <div className="question-author">
            <img
              src={question.author.profilePic || '/images/default-avatar.png'}
              alt={question.author.name}
              className="author-avatar"
            />
            <span className="author-name">{question.author.name}</span>
            {question.author.isExpert && (
              <span className="expert-badge">
                <i className="fa-solid fa-star"></i>
                전문가
              </span>
            )}
          </div>
        )}

        {/* 작성 시간 */}
        <div className="question-time">
          <i className="fa-solid fa-clock"></i>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>

      {/* 통계 정보 */}
      {showStats && (
        <div className="question-stats">
          <div className="stat-item">
            <i className="fa-solid fa-eye"></i>
            <span>{question.views || 0}</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-heart"></i>
            <span>{question.likes || 0}</span>
          </div>
          <div className={`stat-item answers ${question.isAnswered ? 'answered' : ''}`}>
            <i className="fa-solid fa-comment"></i>
            <span>{question.answers || 0}</span>
            {question.isAnswered && (
              <i className="fa-solid fa-check-circle answered-icon"></i>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

// CSS Styles
const styles = `
/* Question Card Styles */
.question-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.question-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

/* Category Badge */
.question-category {
  display: flex;
  justify-content: flex-start;
}

.category-badge {
  background: #007bff;
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

/* Question Title */
.question-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Question Preview */
.question-preview {
  color: #666;
  line-height: 1.5;
}

.question-preview p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
}

/* Tags */
.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag {
  background: #f8f9fa;
  color: #666;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
}

.tag-more {
  color: #999;
  font-size: 12px;
  font-weight: 500;
}

/* Meta Information */
.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 10px;
}

.question-author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.author-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expert-badge {
  background: #ffc107;
  color: #333;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  flex-shrink: 0;
}

.question-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

/* Stats */
.question-stats {
  display: flex;
  gap: 15px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
  position: relative;
}

.stat-item i {
  font-size: 12px;
}

.stat-item.answers.answered {
  color: #28a745;
  font-weight: 600;
}

.answered-icon {
  color: #28a745;
  margin-left: 4px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .question-card {
    padding: 16px;
    gap: 10px;
  }

  .question-title {
    font-size: 1rem;
  }

  .question-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-author {
    width: 100%;
  }

  .question-stats {
    gap: 12px;
  }

  .question-tags {
    gap: 4px;
  }

  .tag {
    font-size: 11px;
    padding: 2px 6px;
  }
}

/* Dark mode support */
[data-theme="dark"] .question-card {
  background: #2d2d2d;
  border-color: #555;
}

[data-theme="dark"] .question-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}

[data-theme="dark"] .question-title {
  color: #ffffff;
}

[data-theme="dark"] .question-preview p {
  color: #cccccc;
}

[data-theme="dark"] .tag {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .question-meta {
  border-top-color: #555;
}

[data-theme="dark"] .question-stats {
  border-top-color: #555;
}

[data-theme="dark"] .author-name {
  color: #cccccc;
}

[data-theme="dark"] .question-time {
  color: #999;
}

[data-theme="dark"] .stat-item {
  color: #cccccc;
}

/* Animation */
@keyframes cardHover {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2px);
  }
}

.question-card:hover {
  animation: cardHover 0.2s ease;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default QuestionCard