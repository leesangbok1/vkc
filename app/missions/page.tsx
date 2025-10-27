'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { BRAND_NAME } from '@/lib/constants/branding'

export default function MissionsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userProgress, setUserProgress] = useState({
    certifiedAnswers: 0,
    normalAnswers: 0,
    activeDays: 0
  })

  useEffect(() => {
    checkAuth()
    loadUserProgress()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        const data = json.data
        setIsLoggedIn(true)
        setUserName(data?.name || data?.email || '사용자')
      } else {
        router.push('/auth/login?redirectTo=/missions')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?redirectTo=/missions')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  function loadUserProgress() {
    // Mock: localStorage에서 사용자 진행도 로드
    const progress = localStorage.getItem('mission_progress')
    if (progress) {
      setUserProgress(JSON.parse(progress))
    }
  }

  if (isCheckingAuth) {
    return (
      <PageLayout variant="centered">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p className="notranslate" translate="no" suppressHydrationWarning>로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
            🎯 {BRAND_NAME} 베타 오픈 챌린지
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '1rem',
            opacity: 0.95,
            position: 'relative',
            zIndex: 1
          }}>
            한국 생활 질문답변 하고 적립금 받아가세요!
          </p>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            borderRadius: '25px',
            position: 'relative',
            zIndex: 1
          }}>
            📅 10월 9일 ~ 11월 30일
          </div>
        </div>

        {/* User Progress Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#333'
          }}>
            👤 {userName}님의 미션 진행 현황
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                {userProgress.certifiedAnswers}개
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Certified User 답변</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                {userProgress.normalAnswers}개
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>누구나 답변</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                {userProgress.activeDays}일
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>활동 일수</div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            color: '#856404'
          }}>
            ⚠️ <strong>중요:</strong> 모든 미션은 미션 기간 안에 달성해야 혜택 대상자가 됩니다.
          </p>
        </div>

        {/* Certified User Missions */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔥 Certified User 답변 분야
          </h2>

          {/* Mission 1 */}
          <div style={{
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            background: userProgress.certifiedAnswers >= 10 ? '#f0f4ff' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  첫 번째 미션: Certified User 답변 10개 작성하기
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  💰 혜택: 네이버페이 10,000원 지급
                </div>
              </div>
              {userProgress.certifiedAnswers >= 10 && (
                <div style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ 달성
                </div>
              )}
            </div>
            <div style={{
              background: '#e9ecef',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: `${Math.min((userProgress.certifiedAnswers / 10) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              {userProgress.certifiedAnswers} / 10 답변 완료
            </p>
          </div>

          {/* Mission 2 */}
          <div style={{
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            background: userProgress.certifiedAnswers >= 20 ? '#f0f4ff' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  두 번째 미션: Certified User 답변 20개 작성하기
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  💰 혜택: 20명 추첨, 네이버페이 10,000원 지급
                </div>
              </div>
              {userProgress.certifiedAnswers >= 20 && (
                <div style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ 달성
                </div>
              )}
            </div>
            <div style={{
              background: '#e9ecef',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: `${Math.min((userProgress.certifiedAnswers / 20) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              {userProgress.certifiedAnswers} / 20 답변 완료
            </p>
          </div>

          {/* Mission 3 */}
          <div style={{
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '1.5rem',
            background: (userProgress.certifiedAnswers >= 60 && userProgress.activeDays >= 10) ? '#f0f4ff' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  세 번째 미션: 10일 이상 활동, 60개 이상 답변 완료
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  🎁 혜택: 40명 추첨, 신세계 상품권 50,000원 지급
                </div>
              </div>
              {(userProgress.certifiedAnswers >= 60 && userProgress.activeDays >= 10) && (
                <div style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ 달성
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666', fontWeight: '600' }}>
                답변 수: {userProgress.certifiedAnswers} / 60
              </p>
              <div style={{
                background: '#e9ecef',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  height: '100%',
                  width: `${Math.min((userProgress.certifiedAnswers / 60) * 100, 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666', fontWeight: '600' }}>
                활동 일수: {userProgress.activeDays} / 10일
              </p>
              <div style={{
                background: '#e9ecef',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  height: '100%',
                  width: `${Math.min((userProgress.activeDays / 10) * 100, 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Newcomer Missions */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🆕 누구나 답변 분야
          </h2>

          {/* Mission 1 */}
          <div style={{
            border: '2px solid #4facfe',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            background: userProgress.normalAnswers >= 10 ? '#f0f9ff' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  첫 번째 미션: 누구나 답변 10개 작성하기
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  💰 혜택: 네이버페이 1,000원 지급
                </div>
              </div>
              {userProgress.normalAnswers >= 10 && (
                <div style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ 달성
                </div>
              )}
            </div>
            <div style={{
              background: '#e9ecef',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                height: '100%',
                width: `${Math.min((userProgress.normalAnswers / 10) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              {userProgress.normalAnswers} / 10 답변 완료
            </p>
          </div>

          {/* Mission 2 */}
          <div style={{
            border: '2px solid #4facfe',
            borderRadius: '12px',
            padding: '1.5rem',
            background: userProgress.normalAnswers >= 20 ? '#f0f9ff' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  두 번째 미션: 누구나 답변 20개 작성하기
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  💰 혜택: 전체 회원 대상
                </div>
              </div>
              {userProgress.normalAnswers >= 20 && (
                <div style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ 달성
                </div>
              )}
            </div>
            <div style={{
              background: '#e9ecef',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                height: '100%',
                width: `${Math.min((userProgress.normalAnswers / 20) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              {userProgress.normalAnswers} / 20 답변 완료
            </p>
          </div>
        </div>

        {/* Event Schedule */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📅 이벤트 일정
          </h2>
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                이벤트 기간
              </div>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>
                10월 9일 ~ 11월 30일
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                혜택 대상자 발표
              </div>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>
                12월 7일 (금)
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                보상 지급 날짜
              </div>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>
                12월 10일 (월)
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                보상 지급 방식
              </div>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>
                카카오톡 혹은 문자로 쿠폰 발송
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem 3rem',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={() => router.push('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            🚀 미션 달성하러 가기
          </button>
        </div>
    </PageLayout>
  )
}
