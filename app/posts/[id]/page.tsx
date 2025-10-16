'use client'

import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import ActionBar from '@/components/common/ActionBar'
import { useState, useEffect } from 'react'
import { MOCK_POSTS } from '@/lib/data/mockData'

// 로컬 Mock 게시글 데이터 (백업용)
const LOCAL_MOCK_POSTS: Record<string, {
  id: string
  title: string
  content: string
  category: string
  categoryIcon: string
  author: {
    name: string
    role: string
    visaType: string
    yearsInKorea: number
  }
  createdAt: string
  viewCount: number
}> = {
  '1': {
    id: '1',
    title: '2025년 E-9 비자 쿼터 확대 발표',
    content: `
# 2025년 E-9 비자 쿼터 확대 발표

고용노동부는 2025년도 비전문 취업(E-9) 비자 쿼터를 전년 대비 15% 확대한다고 발표했습니다.

## 주요 내용

### 1. 쿼터 증가
- **2024년**: 120,000명
- **2025년**: 138,000명 (15% 증가)

### 2. 대상 국가
베트남, 필리핀, 태국, 인도네시아 등 16개 국가에서 근로자 선발 예정

### 3. 선발 분야
- 제조업: 80,000명
- 농축산업: 30,000명
- 어업: 15,000명
- 건설업: 13,000명

### 4. 신청 방법
각 국가별 송출기관을 통해 신청 가능하며, 한국어능력시험(TOPIK) 점수가 우대됩니다.

## 일정
- **신청 접수**: 2025년 1월 15일 ~ 2월 28일
- **서류 심사**: 3월 1일 ~ 3월 31일
- **최종 합격 발표**: 4월 15일
- **입국 시작**: 5월 1일부터

## 문의
고용노동부 외국인력담당관실: 02-2110-1234

자세한 내용은 [고용노동부 공식 홈페이지](https://www.moel.go.kr)를 참고하시기 바랍니다.
    `,
    category: '비자/이민',
    categoryIcon: '🛂',
    author: {
      name: 'VietKConnect 관리자',
      role: 'ADMIN',
      visaType: 'F-4',
      yearsInKorea: 8
    },
    createdAt: '2025-10-14T18:00:00Z',
    viewCount: 1234
  },
  '2': {
    id: '2',
    title: '한국어능력시험(TOPIK) 접수 안내',
    content: `
# 한국어능력시험(TOPIK) 접수 안내

제98회 한국어능력시험(TOPIK) 접수가 시작되었습니다.

## 시험 일정

### TOPIK I (1~2급)
- **시험일**: 2025년 11월 16일 (토)
- **접수 기간**: 2025년 10월 1일 ~ 10월 20일

### TOPIK II (3~6급)
- **시험일**: 2025년 11월 16일 (토)
- **접수 기간**: 2025년 10월 1일 ~ 10월 20일

## 접수 방법

1. [TOPIK 공식 홈페이지](https://www.topik.go.kr) 접속
2. 회원가입 및 로그인
3. 시험 신청 메뉴에서 지역 선택
4. 개인정보 입력 및 사진 업로드
5. 응시료 결제 (40,000원)

## 준비물
- 여권 또는 외국인등록증
- 최근 6개월 이내 촬영한 여권용 사진 (3.5cm x 4.5cm)
- 응시료 결제 수단

## 시험장 안내
전국 주요 도시 대학교에서 실시되며, 접수 시 선택 가능합니다.

## 주의사항
- 접수 마감일 이후 변경 및 취소 불가
- 신분증 미지참 시 응시 불가
- 휴대전화 소지 시 부정행위로 간주

문의사항은 TOPIK 고객센터(1577-0337)로 연락주시기 바랍니다.
    `,
    category: '교육',
    categoryIcon: '🎓',
    author: {
      name: 'VietKConnect 관리자',
      role: 'ADMIN',
      visaType: 'F-4',
      yearsInKorea: 8
    },
    createdAt: '2025-10-14T13:00:00Z',
    viewCount: 892
  },
  '3': {
    id: '3',
    title: '베트남인 근로자 최저임금 인상',
    content: `
# 베트남인 근로자 최저임금 인상

2025년 최저임금이 인상되어 베트남 근로자 분들의 급여가 상승합니다.

## 2025년 최저임금

| 구분 | 2024년 | 2025년 | 인상률 |
|------|--------|--------|--------|
| 시간급 | 9,860원 | 10,030원 | 1.7% |
| 월급 (209시간 기준) | 2,060,740원 | 2,096,270원 | 1.7% |

## 적용 시기
- **시행일**: 2025년 1월 1일부터
- 모든 사업장에 적용

## 급여 계산 예시

### 월급제 근로자
- 기본급: 2,096,270원
- 상여금: 회사 내규에 따름
- 식대: 회사 내규에 따름

### 시급제 근로자
하루 8시간, 월 22일 근무 시:
- 시급: 10,030원
- 일급: 80,240원
- 월급: 1,765,280원

## 주요 내용

### 1. 임금 인상
모든 근로자의 기본급이 최저임금 이상으로 조정됩니다.

### 2. 연장근로수당
- 평일 연장: 시급의 1.5배
- 야간근로: 시급의 1.5배
- 휴일근로: 시급의 2배

### 3. 주휴수당
주 15시간 이상 근무 시 주휴수당 지급

## 확인 방법
급여명세서를 통해 최저임금이 정확히 적용되었는지 확인하시기 바랍니다.

## 신고 방법
최저임금 미준수 사업장은 고용노동부(1350)로 신고 가능합니다.

자세한 내용은 [최저임금위원회 홈페이지](https://www.minimumwage.go.kr)를 참고하시기 바랍니다.
    `,
    category: '취업',
    categoryIcon: '💼',
    author: {
      name: 'VietKConnect 관리자',
      role: 'ADMIN',
      visaType: 'F-4',
      yearsInKorea: 8
    },
    createdAt: '2025-10-13T09:00:00Z',
    viewCount: 2156
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  // MOCK_POSTS 배열에서 ID로 게시글 찾기
  const foundPost = MOCK_POSTS.find(p => p.id === postId)
  const localPost = LOCAL_MOCK_POSTS[postId]

  // Category에서 아이콘 추출 (mockData.ts의 Post는 categoryIcon이 없음)
  function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      '비자/이민': '🛂',
      '교육': '🎓',
      '취업': '💼',
      '한국생활': '🏠',
      '법률': '⚖️',
      '금융': '💰',
      '의료': '🏥',
      '교통': '🚗',
      '부동산': '🏢',
      '기타': '📌'
    }
    return iconMap[category] || '📝'
  }

  // Post 데이터 통합 (categoryIcon 추가)
  const post = foundPost ? {
    ...foundPost,
    categoryIcon: getCategoryIcon(foundPost.category),
    viewCount: foundPost.views
  } : localPost

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 로그인 상태 확인
    const mockSession = localStorage.getItem('mock_session')
    setIsLoggedIn(mockSession === 'true')
  }, [])

  // 게시글이 없으면 404
  if (!post) {
    return (
      <PageLayout variant="centered">
        <div className="section post-error-state">
          <div className="post-error-icon">📄</div>
          <h1 className="post-error-title">게시글을 찾을 수 없습니다</h1>
          <p className="post-error-message">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            홈으로 돌아가기
          </button>
        </div>
      </PageLayout>
    )
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <PageLayout variant="centered">
        {/* 상단 네비게이션 */}
        <div className="section post-navigation">
          <button
            onClick={() => router.back()}
            className="btn btn-secondary post-back-btn"
          >
            ← 뒤로 가기
          </button>
        </div>

        {/* 게시글 카드 */}
        <article className="section card post-detail-card">
          {/* 헤더 */}
          <div className="post-detail-header">
            {/* 카테고리 */}
            <div className="post-category-badge">
              <span className="category-icon">{post.categoryIcon}</span>
              <span className="category-name">{post.category}</span>
            </div>

            {/* 제목 */}
            <h1 className="post-detail-title">{post.title}</h1>

            {/* 메타 정보 */}
            <div className="post-meta">
              <div className="post-author">
                <div className="author-avatar-small"></div>
                <div className="author-details">
                  <div className="author-name">{post.author.name}</div>
                  <div className="author-info">
                    {post.author.visaType && `${post.author.visaType} · `}
                    {post.author.yearsInKorea && `한국 ${post.author.yearsInKorea}년차`}
                  </div>
                </div>
              </div>
              <div className="post-stats">
                <span className="post-stat-item">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="post-detail-content">
            <div className="post-content-body">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .split('\n')
                    .map(line => {
                      // 제목 처리
                      if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold mt-6 mb-4">${line.substring(2)}</h1>`
                      if (line.startsWith('## ')) return `<h2 class="text-xl font-bold mt-5 mb-3">${line.substring(3)}</h2>`
                      if (line.startsWith('### ')) return `<h3 class="text-lg font-bold mt-4 mb-2">${line.substring(4)}</h3>`

                      // 리스트 처리
                      if (line.startsWith('- ')) return `<li class="ml-6 mb-2">${line.substring(2)}</li>`

                      // 강조 처리
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return `<p class="font-bold mb-2">${line.substring(2, line.length - 2)}</p>`
                      }

                      // 테이블 처리 (간단한 구현)
                      if (line.includes('|')) return line

                      // 일반 텍스트
                      if (line.trim()) return `<p class="mb-3 leading-relaxed">${line}</p>`
                      return ''
                    })
                    .join('')
                }}
              />
            </div>
          </div>

          {/* ActionBar: 도움됨/북마크/공유 버튼 */}
          <div style={{ padding: '1rem 0', borderTop: '1px solid #e9ecef' }}>
            <ActionBar
              targetId={post.id}
              targetType="post"
              title={post.title}
              content={post.content}
              url={`/posts/${post.id}`}
              initialHelpfulCount={0}
              compact={false}
              requireLogin={!isLoggedIn}
              onLoginRequired={() => {
                router.push(`/auth/login?redirectTo=/posts/${post.id}`)
              }}
            />
          </div>
        </article>

        {/* 관련 게시글 */}
        <div className="section related-posts">
          <h2 className="section-title">다른 기사</h2>
          <div className="related-posts-grid">
            {MOCK_POSTS
              .filter(p => p.id !== postId)
              .slice(0, 2)
              .map(relatedPost => (
                <a
                  key={relatedPost.id}
                  href={`/posts/${relatedPost.id}`}
                  className="card related-post-card"
                >
                  <div className="related-post-content">
                    <span className="related-post-icon">{getCategoryIcon(relatedPost.category)}</span>
                    <div className="related-post-info">
                      <h3 className="related-post-title">
                        {relatedPost.title}
                      </h3>
                      <div className="related-post-meta">
                        {relatedPost.category} · {formatDate(relatedPost.createdAt)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
        </div>
    </PageLayout>
  )
}
