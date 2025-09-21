import React, { useState, useEffect } from 'react'

const StatsWidget = ({ showRealtime = true }) => {
  const [stats, setStats] = useState({
    totalQuestions: 1234,
    totalAnswers: 2567,
    totalUsers: 456,
    solvedRate: 89,
    todayQuestions: 12,
    weeklyQuestions: 78,
    onlineUsers: 23,
    recentActivity: []
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 실시간 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 통계 데이터 로드 시뮬레이션
    const loadStats = () => {
      // TODO: Firebase에서 실제 통계 데이터 로드
      setStats(prev => ({
        ...prev,
        onlineUsers: Math.floor(Math.random() * 10) + 20, // 20-30 사이 랜덤
        recentActivity: [
          {
            id: 1,
            type: 'question',
            user: 'Nguyen Van A',
            action: '새 질문을 작성했습니다',
            time: new Date(Date.now() - 1000 * 60 * 2).toISOString()
          },
          {
            id: 2,
            type: 'answer',
            user: '김민준 행정사',
            action: '답변을 작성했습니다',
            time: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          },
          {
            id: 3,
            type: 'like',
            user: 'Tran Thi B',
            action: '질문에 좋아요를 눌렀습니다',
            time: new Date(Date.now() - 1000 * 60 * 8).toISOString()
          }
        ]
      }))
    }

    loadStats()
    const statsInterval = setInterval(loadStats, 30000) // 30초마다 업데이트

    return () => {
      clearInterval(timer)
      clearInterval(statsInterval)
    }
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getRelativeTime = (timeString) => {
    const time = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return time.toLocaleDateString('ko-KR')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'question':
        return 'fa-solid fa-question-circle'
      case 'answer':
        return 'fa-solid fa-comment'
      case 'like':
        return 'fa-solid fa-heart'
      default:
        return 'fa-solid fa-circle'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'question':
        return '#007bff'
      case 'answer':
        return '#28a745'
      case 'like':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  return (
    <div className="stats-widget">
      <div className="widget-header">
        <h3 className="widget-title">
          <i className="fa-solid fa-chart-bar"></i>
          커뮤니티 현황
        </h3>
        {showRealtime && (
          <div className="realtime-indicator">
            <div className="pulse-dot"></div>
            <span>실시간</span>
          </div>
        )}
      </div>

      {/* 현재 시간 */}
      {showRealtime && (
        <div className="current-time">
          <i className="fa-solid fa-clock"></i>
          <span>{formatTime(currentTime)}</span>
        </div>
      )}

      {/* 주요 통계 */}
      <div className="main-stats">
        <div className="stat-grid">
          <div className="stat-item primary">
            <div className="stat-icon">
              <i className="fa-solid fa-question-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuestions.toLocaleString()}</div>
              <div className="stat-label">총 질문</div>
            </div>
          </div>

          <div className="stat-item success">
            <div className="stat-icon">
              <i className="fa-solid fa-comment"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAnswers.toLocaleString()}</div>
              <div className="stat-label">총 답변</div>
            </div>
          </div>

          <div className="stat-item info">
            <div className="stat-icon">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-label">회원 수</div>
            </div>
          </div>

          <div className="stat-item warning">
            <div className="stat-icon">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.solvedRate}%</div>
              <div className="stat-label">해결률</div>
            </div>
          </div>
        </div>
      </div>

      {/* 오늘의 활동 */}
      <div className="daily-stats">
        <h4 className="section-title">오늘의 활동</h4>
        <div className="daily-grid">
          <div className="daily-item">
            <span className="daily-label">새 질문</span>
            <span className="daily-value">{stats.todayQuestions}개</span>
          </div>
          <div className="daily-item">
            <span className="daily-label">이번 주</span>
            <span className="daily-value">{stats.weeklyQuestions}개</span>
          </div>
          {showRealtime && (
            <div className="daily-item online">
              <span className="daily-label">현재 접속</span>
              <span className="daily-value">
                <span className="online-dot"></span>
                {stats.onlineUsers}명
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 최근 활동 */}
      {showRealtime && stats.recentActivity.length > 0 && (
        <div className="recent-activity">
          <h4 className="section-title">최근 활동</h4>
          <div className="activity-list">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div
                  className="activity-icon"
                  style={{ color: getActivityColor(activity.type) }}
                >
                  <i className={getActivityIcon(activity.type)}></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.user}</strong>님이 {activity.action}
                  </div>
                  <div className="activity-time">
                    {getRelativeTime(activity.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추가 링크 */}
      <div className="widget-footer">
        <a href="/stats" className="footer-link">
          <i className="fa-solid fa-chart-line"></i>
          상세 통계 보기
        </a>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* Stats Widget Styles */
.stats-widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.widget-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.realtime-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #28a745;
  font-weight: 500;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

/* Main Stats */
.main-stats {
  margin-bottom: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item.primary {
  border-left: 3px solid #007bff;
}

.stat-item.success {
  border-left: 3px solid #28a745;
}

.stat-item.info {
  border-left: 3px solid #17a2b8;
}

.stat-item.warning {
  border-left: 3px solid #ffc107;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.stat-item.primary .stat-icon {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.stat-item.success .stat-icon {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.stat-item.info .stat-icon {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.stat-item.warning .stat-icon {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* Daily Stats */
.daily-stats {
  margin-bottom: 20px;
}

.section-title {
  color: #333;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #007bff;
  border-radius: 2px;
}

.daily-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daily-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.daily-item.online {
  background: rgba(40, 167, 69, 0.1);
  border-left: 3px solid #28a745;
}

.daily-label {
  color: #666;
}

.daily-value {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-dot {
  width: 6px;
  height: 6px;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Recent Activity */
.recent-activity {
  margin-bottom: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  background: #f8f9fa;
  border-left: 2px solid #e0e0e0;
}

.activity-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
  margin-bottom: 2px;
}

.activity-text strong {
  font-weight: 600;
}

.activity-time {
  font-size: 11px;
  color: #999;
}

/* Widget Footer */
.widget-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #0056b3;
}

/* Animations */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-widget {
    padding: 16px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-item {
    padding: 10px;
  }

  .stat-number {
    font-size: 1.1rem;
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .current-time {
    font-size: 13px;
    padding: 6px 10px;
  }
}

/* Dark mode support */
[data-theme="dark"] .stats-widget {
  background: #2d2d2d;
  border-color: #555;
}

[data-theme="dark"] .widget-title {
  color: #ffffff;
}

[data-theme="dark"] .section-title {
  color: #ffffff;
}

[data-theme="dark"] .current-time {
  background: #404040;
  color: #cccccc;
}

[data-theme="dark"] .stat-item {
  border-color: #555;
  background: #404040;
}

[data-theme="dark"] .stat-number {
  color: #ffffff;
}

[data-theme="dark"] .stat-label {
  color: #cccccc;
}

[data-theme="dark"] .daily-item {
  background: #404040;
}

[data-theme="dark"] .daily-item.online {
  background: rgba(40, 167, 69, 0.2);
}

[data-theme="dark"] .daily-label {
  color: #cccccc;
}

[data-theme="dark"] .daily-value {
  color: #ffffff;
}

[data-theme="dark"] .activity-item {
  background: #404040;
  border-left-color: #555;
}

[data-theme="dark"] .activity-text {
  color: #ffffff;
}

[data-theme="dark"] .activity-icon {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .widget-footer {
  border-top-color: #555;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default StatsWidget