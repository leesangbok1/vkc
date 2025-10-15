'use client'

import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default function VisaChallengeEventPage() {
  const router = useRouter()

  return (
    <main className="main-layout">
      <div className="container">
        <div className="main-content">
          {/* 상단 네비게이션 */}
          <div className="section post-navigation">
            <button
              onClick={() => router.back()}
              className="btn btn-secondary post-back-btn"
            >
              ← 뒤로 가기
            </button>
          </div>

          {/* 이벤트 헤더 */}
          <article className="section card post-detail-card">
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '3rem 2rem',
              borderRadius: '12px 12px 0 0',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>🎯</div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                아하 답변 작성 챌린지 이벤트
              </h1>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                display: 'inline-block',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                <span style={{ marginRight: '0.5rem' }}>⏰</span>
                9월 15일 ~ 10월 31일
              </div>
            </div>

            {/* 이벤트 내용 */}
            <div style={{ padding: '2rem' }}>
              {/* 이벤트 소개 */}
              <div style={{ marginBottom: '3rem' }}>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: '1.8',
                  marginBottom: '1.5rem'
                }}>
                  모든 이벤트 미션 이벤트가 기간 내 한번에 달성되어야 보너스가 부여됩니다.
                </p>
              </div>

              {/* 전문가 답변 분야 */}
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  ✅ 첫 번째 미션 따기
                </h2>

                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      1
                    </span>
                    전문가 답변 미션 10개 작성하기
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    marginLeft: '2.5rem',
                    lineHeight: '1.6'
                  }}>
                    전문가로 인증 받은 답변을 10개 작성하시면 챌린지 달성! 검증된 답변자로서 커뮤니티에 기여하고 보상을 받으세요.
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    marginLeft: '2.5rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ color: '#666' }}>보상</span>
                      <span style={{
                        fontWeight: '600',
                        color: '#4facfe',
                        fontSize: '1.1rem'
                      }}>
                        10,000원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 전문가 되는 방법 */}
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  📝 Certified User가 되는 방법
                </h2>

                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      1
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>
                        전문가 인증 신청
                      </h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6'
                      }}>
                        헤더 프로필 메뉴에서 "Certified User 신청"을 클릭하여 인증 서류를 업로드하세요.
                        국내 인증 또는 국제 인증 중 선택 가능합니다.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      2
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>
                        관리자 승인 대기
                      </h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6'
                      }}>
                        신청하신 서류를 관리자가 검토합니다. 보통 2-3일 내에 승인 결과를 받으실 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      3
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>
                        전문가 답변 시작
                      </h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6'
                      }}>
                        승인 후 Certified User 배지가 부여됩니다. 이제 질문에 답변하면 자동으로 전문가 답변으로 표시됩니다!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 이벤트 유의사항 */}
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#856404',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  유의사항
                </h3>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '1.5rem',
                  color: '#856404',
                  fontSize: '0.95rem',
                  lineHeight: '1.8'
                }}>
                  <li>이벤트 기간: 2025년 9월 15일 ~ 10월 31일</li>
                  <li>전문가 인증은 실제 경험과 자격을 갖춘 분들만 신청 가능합니다</li>
                  <li>부적절한 답변이나 스팸성 답변은 카운트되지 않습니다</li>
                  <li>미션 달성 후 보상은 2일 이내 지급됩니다</li>
                  <li>이벤트는 사전 공지 없이 조기 종료될 수 있습니다</li>
                </ul>
              </div>

              {/* 참여하기 버튼 */}
              <div style={{
                textAlign: 'center',
                padding: '2rem 0'
              }}>
                <button
                  onClick={() => router.push('/experts/apply')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1rem 3rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  ✅ Certified User 신청하기
                </button>

                <p style={{
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  이미 Certified User이신가요? <a href="/" style={{ color: '#667eea', textDecoration: 'underline' }}>질문 답변하러 가기</a>
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <Sidebar showContent={false} />
      </div>
    </main>
  )
}
