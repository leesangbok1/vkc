'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AdminDashboard() {
  const router = useRouter()
  const { isLoggedIn, user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // Check if user is admin
  const isAdmin = isLoggedIn && user && user.role === 'ADMIN'

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-denied-card">
          <div className="admin-access-denied-icon">🔒</div>
          <h1 className="admin-access-denied-title">접근 권한 없음</h1>
          <p className="admin-access-denied-text">
            관리자만 이 페이지에 접근할 수 있습니다.
          </p>
          <button
            className="admin-access-denied-btn"
            onClick={() => router.push('/')}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-header-title">
              <span className="admin-header-icon">👑</span>
              관리자 대시보드
            </h1>
            <p className="admin-header-subtitle">VietKConnect 플랫폼 관리 및 통계</p>
          </div>
          <div className="admin-header-right">
            <div className="admin-header-user">
              <span className="admin-header-badge">ADMIN</span>
              <span className="admin-header-username">{user?.name || user?.email || '관리자'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="admin-tab-icon">📊</span>
          개요
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="admin-tab-icon">👥</span>
          사용자 관리
        </button>
        <button
          className={`admin-tab ${activeTab === 'content' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <span className="admin-tab-icon">📝</span>
          콘텐츠 관리
        </button>
        <button
          className={`admin-tab ${activeTab === 'verification' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          <span className="admin-tab-icon">✅</span>
          인증 관리
        </button>
        <button
          className={`admin-tab ${activeTab === 'data' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <span className="admin-tab-icon">💾</span>
          데이터 관리
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-blue">👥</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">2,847</div>
                  <div className="admin-stat-label">총 사용자</div>
                  <div className="admin-stat-change admin-stat-change-up">
                    ↑ 오늘 +18명
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-green">📝</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">1,356</div>
                  <div className="admin-stat-label">총 질문</div>
                  <div className="admin-stat-change">
                    답변률 87.5%
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-orange">⚡</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">234</div>
                  <div className="admin-stat-label">활성 사용자 (24h)</div>
                  <div className="admin-stat-change">
                    만족도 4.6/5.0
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-yellow">⏰</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value admin-stat-value-warning">12</div>
                  <div className="admin-stat-label">대기 중인 인증</div>
                  <div className="admin-stat-change admin-stat-change-warning">
                    검토 필요
                  </div>
                </div>
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="admin-section">
              <h2 className="admin-section-title">사용자 역할별 분포</h2>
              <div className="admin-role-grid">
                <div className="admin-role-card admin-role-card-gray">
                  <div className="admin-role-icon">🔒</div>
                  <div className="admin-role-value">1,420</div>
                  <div className="admin-role-label">게스트</div>
                </div>
                <div className="admin-role-card admin-role-card-blue">
                  <div className="admin-role-icon">👤</div>
                  <div className="admin-role-value">1,287</div>
                  <div className="admin-role-label">일반 사용자</div>
                </div>
                <div className="admin-role-card admin-role-card-green">
                  <div className="admin-role-icon">✅</div>
                  <div className="admin-role-value">132</div>
                  <div className="admin-role-label">인증 사용자</div>
                </div>
                <div className="admin-role-card admin-role-card-purple">
                  <div className="admin-role-icon">👑</div>
                  <div className="admin-role-value">8</div>
                  <div className="admin-role-label">관리자</div>
                </div>
              </div>
            </div>

            {/* System Status & Recent Activity */}
            <div className="admin-two-columns">
              <div className="admin-section">
                <h2 className="admin-section-title">시스템 상태</h2>
                <div className="admin-system-status">
                  <div className="admin-system-item">
                    <span className="admin-system-label">데이터베이스</span>
                    <span className="admin-system-badge admin-system-badge-green">
                      ✓ 정상
                    </span>
                  </div>
                  <div className="admin-system-item">
                    <span className="admin-system-label">인증 서버</span>
                    <span className="admin-system-badge admin-system-badge-green">
                      ✓ 정상
                    </span>
                  </div>
                  <div className="admin-system-item">
                    <span className="admin-system-label">알림 시스템</span>
                    <span className="admin-system-badge admin-system-badge-yellow">
                      ⚠ 점검 중
                    </span>
                  </div>
                  <div className="admin-system-item">
                    <span className="admin-system-label">파일 저장소</span>
                    <span className="admin-system-badge admin-system-badge-green">
                      ✓ 정상
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-section">
                <h2 className="admin-section-title">최근 활동</h2>
                <div className="admin-activity-list">
                  <div className="admin-activity-item admin-activity-item-blue">
                    <span className="admin-activity-icon">👥</span>
                    <div className="admin-activity-content">
                      <div className="admin-activity-title">새 사용자 가입</div>
                      <div className="admin-activity-time">15분 전</div>
                    </div>
                  </div>
                  <div className="admin-activity-item admin-activity-item-green">
                    <span className="admin-activity-icon">✅</span>
                    <div className="admin-activity-content">
                      <div className="admin-activity-title">인증 승인 완료</div>
                      <div className="admin-activity-time">32분 전</div>
                    </div>
                  </div>
                  <div className="admin-activity-item admin-activity-item-yellow">
                    <span className="admin-activity-icon">⏰</span>
                    <div className="admin-activity-content">
                      <div className="admin-activity-title">인증 요청 접수</div>
                      <div className="admin-activity-time">1시간 전</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <h2 className="admin-section-title">사용자 관리</h2>
            <p className="admin-section-subtitle">
              사용자 정보 조회, 권한 관리, 승인/거부 기능
            </p>

            {/* Search and Filter */}
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="사용자 검색 (이름, 이메일)"
                className="admin-search-input"
              />
              <select className="admin-filter-select">
                <option value="all">전체 권한</option>
                <option value="guest">게스트</option>
                <option value="user">일반 사용자</option>
                <option value="verified">인증 사용자</option>
                <option value="admin">관리자</option>
              </select>
              <button className="admin-btn admin-btn-primary">
                🔍 검색
              </button>
            </div>

            {/* User List */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>사용자 이름</th>
                    <th>이메일</th>
                    <th>권한</th>
                    <th>가입일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#1001</td>
                    <td>베트남CertifiedUser17년차</td>
                    <td>expert@viet.com</td>
                    <td><span className="admin-badge admin-badge-green">✅ 인증</span></td>
                    <td>2025-01-15</td>
                    <td><span className="admin-status admin-status-active">활성</span></td>
                    <td>
                      <button className="admin-action-btn">상세보기</button>
                      <button className="admin-action-btn admin-action-btn-warning">권한수정</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#1002</td>
                    <td>한국취업도우미</td>
                    <td>helper@viet.com</td>
                    <td><span className="admin-badge admin-badge-blue">👤 일반</span></td>
                    <td>2025-02-10</td>
                    <td><span className="admin-status admin-status-active">활성</span></td>
                    <td>
                      <button className="admin-action-btn">상세보기</button>
                      <button className="admin-action-btn admin-action-btn-warning">권한수정</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#1003</td>
                    <td>법률상담전문</td>
                    <td>legal@viet.com</td>
                    <td><span className="admin-badge admin-badge-green">✅ 인증</span></td>
                    <td>2025-03-05</td>
                    <td><span className="admin-status admin-status-pending">대기</span></td>
                    <td>
                      <button className="admin-action-btn">상세보기</button>
                      <button className="admin-action-btn admin-action-btn-warning">권한수정</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="admin-placeholder">
              <p>💡 사용자 상세 정보 조회 및 권한 수정 기능은 구현 예정입니다</p>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="admin-tab-content">
            <h2 className="admin-section-title">콘텐츠 관리</h2>
            <p className="admin-section-subtitle">
              질문, 답변, 댓글 관리 및 신고 처리
            </p>

            {/* Content Type Tabs */}
            <div className="admin-subtabs">
              <button className="admin-subtab admin-subtab-active">
                📝 질문 관리
              </button>
              <button className="admin-subtab">
                💬 답변 관리
              </button>
              <button className="admin-subtab">
                🚨 신고 관리
              </button>
            </div>

            {/* Content List */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>제목/내용</th>
                    <th>작성자</th>
                    <th>카테고리</th>
                    <th>작성일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#Q001</td>
                    <td>
                      <div className="admin-content-preview">
                        <strong>E-9 비자 연장 신청 방법이 궁금합니다</strong>
                        <p>현재 E-9 비자로 근무 중인데...</p>
                      </div>
                    </td>
                    <td>user123</td>
                    <td><span className="admin-category-tag">비자</span></td>
                    <td>2025-10-10</td>
                    <td><span className="admin-status admin-status-active">공개</span></td>
                    <td>
                      <button className="admin-action-btn">보기</button>
                      <button className="admin-action-btn admin-action-btn-danger">숨기기</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#Q002</td>
                    <td>
                      <div className="admin-content-preview">
                        <strong>한국 취업 준비 과정</strong>
                        <p>베트남에서 한국 취업을 준비하려면...</p>
                      </div>
                    </td>
                    <td>jobseeker</td>
                    <td><span className="admin-category-tag">취업</span></td>
                    <td>2025-10-12</td>
                    <td><span className="admin-status admin-status-active">공개</span></td>
                    <td>
                      <button className="admin-action-btn">보기</button>
                      <button className="admin-action-btn admin-action-btn-danger">숨기기</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="admin-placeholder">
              <p>💡 콘텐츠 상세 보기, 수정, 삭제 기능은 구현 예정입니다</p>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="admin-tab-content">
            <h2 className="admin-section-title">인증 관리</h2>
            <p className="admin-section-subtitle">
              사용자 인증 문서 검토 및 승인/거부
            </p>

            {/* Verification Status */}
            <div className="admin-verification-status">
              <div className="admin-verification-stat">
                <div className="admin-verification-count">12</div>
                <div className="admin-verification-label">대기 중</div>
              </div>
              <div className="admin-verification-stat">
                <div className="admin-verification-count admin-verification-count-green">45</div>
                <div className="admin-verification-label">승인 완료</div>
              </div>
              <div className="admin-verification-stat">
                <div className="admin-verification-count admin-verification-count-red">8</div>
                <div className="admin-verification-label">거부됨</div>
              </div>
            </div>

            {/* Pending Verifications */}
            <div className="admin-verification-list">
              <div className="admin-verification-card">
                <div className="admin-verification-header">
                  <div className="admin-verification-user">
                    <div className="admin-verification-avatar">베</div>
                    <div>
                      <div className="admin-verification-name">베트남CertifiedUser17년차</div>
                      <div className="admin-verification-email">expert@viet.com</div>
                    </div>
                  </div>
                  <span className="admin-verification-badge admin-verification-badge-pending">
                    ⏰ 대기 중
                  </span>
                </div>

                <div className="admin-verification-docs">
                  <div className="admin-verification-doc-title">제출 문서:</div>
                  <div className="admin-verification-doc-list">
                    <div className="admin-verification-doc-item">
                      📄 외국인등록증.pdf
                      <button className="admin-doc-view-btn">보기</button>
                    </div>
                    <div className="admin-verification-doc-item">
                      📄 재직증명서.pdf
                      <button className="admin-doc-view-btn">보기</button>
                    </div>
                  </div>
                </div>

                <div className="admin-verification-info">
                  <div className="admin-verification-info-item">
                    <strong>신청 분야:</strong> 비자, 취업, 생활
                  </div>
                  <div className="admin-verification-info-item">
                    <strong>신청일:</strong> 2025-10-10 14:30
                  </div>
                </div>

                <div className="admin-verification-actions">
                  <button className="admin-btn admin-btn-success">
                    ✅ 승인
                  </button>
                  <button className="admin-btn admin-btn-danger">
                    ❌ 거부
                  </button>
                  <button className="admin-btn admin-btn-secondary">
                    💬 메시지 보내기
                  </button>
                </div>
              </div>

              <div className="admin-verification-card">
                <div className="admin-verification-header">
                  <div className="admin-verification-user">
                    <div className="admin-verification-avatar">법</div>
                    <div>
                      <div className="admin-verification-name">법률상담전문</div>
                      <div className="admin-verification-email">legal@viet.com</div>
                    </div>
                  </div>
                  <span className="admin-verification-badge admin-verification-badge-pending">
                    ⏰ 대기 중
                  </span>
                </div>

                <div className="admin-verification-docs">
                  <div className="admin-verification-doc-title">제출 문서:</div>
                  <div className="admin-verification-doc-list">
                    <div className="admin-verification-doc-item">
                      📄 변호사자격증.pdf
                      <button className="admin-doc-view-btn">보기</button>
                    </div>
                    <div className="admin-verification-doc-item">
                      📄 재직증명서.pdf
                      <button className="admin-doc-view-btn">보기</button>
                    </div>
                  </div>
                </div>

                <div className="admin-verification-info">
                  <div className="admin-verification-info-item">
                    <strong>신청 분야:</strong> 법률, 민원
                  </div>
                  <div className="admin-verification-info-item">
                    <strong>신청일:</strong> 2025-10-12 09:15
                  </div>
                </div>

                <div className="admin-verification-actions">
                  <button className="admin-btn admin-btn-success">
                    ✅ 승인
                  </button>
                  <button className="admin-btn admin-btn-danger">
                    ❌ 거부
                  </button>
                  <button className="admin-btn admin-btn-secondary">
                    💬 메시지 보내기
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-placeholder">
              <p>💡 문서 미리보기, 승인/거부 처리 기능은 구현 예정입니다</p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="admin-tab-content">
            <h2 className="admin-section-title">데이터 관리</h2>
            <p className="admin-section-subtitle">
              데이터베이스 백업, 복원 및 시스템 로그
            </p>

            <div className="admin-data-actions">
              <div className="admin-data-card">
                <div className="admin-data-icon">💾</div>
                <h3 className="admin-data-title">데이터베이스 백업</h3>
                <p className="admin-data-description">
                  현재 데이터베이스를 백업합니다
                </p>
                <button className="admin-btn admin-btn-primary admin-btn-block">
                  백업 실행
                </button>
              </div>

              <div className="admin-data-card">
                <div className="admin-data-icon">📥</div>
                <h3 className="admin-data-title">데이터 복원</h3>
                <p className="admin-data-description">
                  백업 파일에서 데이터를 복원합니다
                </p>
                <button className="admin-btn admin-btn-warning admin-btn-block">
                  복원 실행
                </button>
              </div>

              <div className="admin-data-card">
                <div className="admin-data-icon">📊</div>
                <h3 className="admin-data-title">시스템 로그</h3>
                <p className="admin-data-description">
                  시스템 활동 로그를 확인합니다
                </p>
                <button className="admin-btn admin-btn-secondary admin-btn-block">
                  로그 보기
                </button>
              </div>

              <div className="admin-data-card">
                <div className="admin-data-icon">📤</div>
                <h3 className="admin-data-title">데이터 내보내기</h3>
                <p className="admin-data-description">
                  CSV/Excel 형식으로 데이터 내보내기
                </p>
                <button className="admin-btn admin-btn-secondary admin-btn-block">
                  내보내기
                </button>
              </div>
            </div>

            <div className="admin-placeholder">
              <p>💡 데이터 백업, 복원, 내보내기 기능은 구현 예정입니다</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
        }

        .admin-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .admin-access-denied {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background: #f5f7fa;
        }

        .admin-access-denied-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          padding: 3rem 2rem;
          text-align: center;
          max-width: 400px;
        }

        .admin-access-denied-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .admin-access-denied-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 0.5rem;
        }

        .admin-access-denied-text {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .admin-access-denied-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-access-denied-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1.5rem 2rem;
        }

        .admin-header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-header-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .admin-header-icon {
          font-size: 2rem;
        }

        .admin-header-subtitle {
          color: #6b7280;
          font-size: 0.938rem;
        }

        .admin-header-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-header-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .admin-header-username {
          font-weight: 600;
          color: #374151;
        }

        .admin-tabs {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          overflow-x: auto;
        }

        .admin-tab {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .admin-tab-icon {
          font-size: 1.25rem;
        }

        .admin-tab:hover {
          color: #3b82f6;
        }

        .admin-tab-active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .admin-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .admin-stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .admin-stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          flex-shrink: 0;
        }

        .admin-stat-icon-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
        }

        .admin-stat-icon-green {
          background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
        }

        .admin-stat-icon-orange {
          background: linear-gradient(135deg, #fed7aa 0%, #fb923c 100%);
        }

        .admin-stat-icon-yellow {
          background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
        }

        .admin-stat-content {
          flex: 1;
        }

        .admin-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .admin-stat-value-warning {
          color: #f59e0b;
        }

        .admin-stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .admin-stat-change {
          font-size: 0.813rem;
          color: #6b7280;
        }

        .admin-stat-change-up {
          color: #10b981;
          font-weight: 600;
        }

        .admin-stat-change-warning {
          color: #f59e0b;
          font-weight: 600;
        }

        .admin-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .admin-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .admin-section-subtitle {
          color: #6b7280;
          font-size: 0.938rem;
          margin-bottom: 1.5rem;
        }

        .admin-role-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .admin-role-card {
          text-align: center;
          padding: 2rem 1rem;
          border-radius: 12px;
        }

        .admin-role-card-gray {
          background: #f9fafb;
        }

        .admin-role-card-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .admin-role-card-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .admin-role-card-purple {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
        }

        .admin-role-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .admin-role-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .admin-role-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .admin-two-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .admin-system-status {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .admin-system-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .admin-system-label {
          font-weight: 500;
          color: #374151;
        }

        .admin-system-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 6px;
          font-size: 0.813rem;
          font-weight: 600;
        }

        .admin-system-badge-green {
          background: #d1fae5;
          color: #065f46;
        }

        .admin-system-badge-yellow {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .admin-activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
        }

        .admin-activity-item-blue {
          background: #dbeafe;
        }

        .admin-activity-item-green {
          background: #d1fae5;
        }

        .admin-activity-item-yellow {
          background: #fef3c7;
        }

        .admin-activity-icon {
          font-size: 1.5rem;
        }

        .admin-activity-content {
          flex: 1;
        }

        .admin-activity-title {
          font-weight: 600;
          color: #111827;
          font-size: 0.938rem;
        }

        .admin-activity-time {
          color: #6b7280;
          font-size: 0.813rem;
        }

        .admin-tab-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .admin-toolbar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .admin-search-input,
        .admin-filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.938rem;
          flex: 1;
          min-width: 200px;
        }

        .admin-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.938rem;
        }

        .admin-btn-primary {
          background: #3b82f6;
          color: white;
        }

        .admin-btn-primary:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .admin-btn-success {
          background: #10b981;
          color: white;
        }

        .admin-btn-success:hover {
          background: #059669;
        }

        .admin-btn-danger {
          background: #ef4444;
          color: white;
        }

        .admin-btn-danger:hover {
          background: #dc2626;
        }

        .admin-btn-warning {
          background: #f59e0b;
          color: white;
        }

        .admin-btn-warning:hover {
          background: #d97706;
        }

        .admin-btn-secondary {
          background: #6b7280;
          color: white;
        }

        .admin-btn-secondary:hover {
          background: #4b5563;
        }

        .admin-btn-block {
          width: 100%;
        }

        .admin-table-container {
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .admin-table tr:hover {
          background: #f9fafb;
        }

        .admin-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.813rem;
          font-weight: 600;
          display: inline-block;
        }

        .admin-badge-green {
          background: #d1fae5;
          color: #065f46;
        }

        .admin-badge-blue {
          background: #dbeafe;
          color: #1e40af;
        }

        .admin-status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.813rem;
          font-weight: 600;
          display: inline-block;
        }

        .admin-status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .admin-status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-action-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.813rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 0.5rem;
          transition: all 0.2s;
        }

        .admin-action-btn:hover {
          background: #f9fafb;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .admin-action-btn-warning {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .admin-action-btn-warning:hover {
          background: #fffbeb;
        }

        .admin-action-btn-danger {
          border-color: #ef4444;
          color: #ef4444;
        }

        .admin-action-btn-danger:hover {
          background: #fef2f2;
        }

        .admin-content-preview strong {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .admin-content-preview p {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .admin-category-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.813rem;
          font-weight: 600;
        }

        .admin-subtabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .admin-subtab {
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .admin-subtab:hover {
          color: #3b82f6;
        }

        .admin-subtab-active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .admin-verification-status {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .admin-verification-stat {
          text-align: center;
          padding: 2rem 1rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .admin-verification-count {
          font-size: 3rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .admin-verification-count-green {
          color: #10b981;
        }

        .admin-verification-count-red {
          color: #ef4444;
        }

        .admin-verification-label {
          color: #6b7280;
          font-weight: 500;
        }

        .admin-verification-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-verification-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          background: white;
        }

        .admin-verification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .admin-verification-user {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .admin-verification-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .admin-verification-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .admin-verification-email {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .admin-verification-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.813rem;
          font-weight: 600;
        }

        .admin-verification-badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-verification-docs {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .admin-verification-doc-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .admin-verification-doc-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .admin-verification-doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .admin-doc-view-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.375rem 1rem;
          border-radius: 6px;
          font-size: 0.813rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-doc-view-btn:hover {
          background: #2563eb;
        }

        .admin-verification-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .admin-verification-info-item {
          color: #374151;
          font-size: 0.938rem;
        }

        .admin-verification-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-data-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .admin-data-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
        }

        .admin-data-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .admin-data-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .admin-data-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .admin-placeholder {
          background: #f0f9ff;
          border: 2px dashed #3b82f6;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          color: #3b82f6;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 1rem;
          }

          .admin-header {
            padding: 1rem;
          }

          .admin-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr;
          }

          .admin-role-grid {
            grid-template-columns: 1fr 1fr;
          }

          .admin-two-columns {
            grid-template-columns: 1fr;
          }

          .admin-toolbar {
            flex-direction: column;
          }

          .admin-search-input,
          .admin-filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
