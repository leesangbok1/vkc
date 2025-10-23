export type LeaderboardEntry = {
  rank: number
  name: string
  role: 'guest' | 'user' | 'verified' | 'admin'
  score: number
  streak: number
  answered: number
}

export type RankTier = {
  label: string
  scoreRange: string
  highlight: string
  color: string
}

export type WeeklyMission = {
  title: string
  description: string
  progress: number
  target: number
  due: string
}

export type RankSummary = {
  label: string
  value: string
  caption: string
  accent?: string
}

export const RANK_SUMMARY_CARDS: RankSummary[] = [
  {
    label: '이번 주 누적 점수',
    value: '1,280 pts',
    caption: '최고 기록을 계속 갱신해보세요!',
    accent: 'var(--vk-primary)'
  },
  {
    label: '연속 활동',
    value: '6 days 🔥',
    caption: '하루 1회 답변으로 보너스 유지',
    accent: '#f97316'
  },
  {
    label: '다음 티어 진입 조건',
    value: 'Community Expert',
    caption: '900 ~ 1190점 • 답변 추천 배지 & 피드 상단 노출',
    accent: '#10b981'
  }
]

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, name: '레 투안', role: 'verified', score: 1280, streak: 6, answered: 42 },
  { rank: 2, name: '팜 티란', role: 'verified', score: 1120, streak: 5, answered: 35 },
  { rank: 3, name: '김서현', role: 'user', score: 980, streak: 3, answered: 27 },
  { rank: 4, name: '응우옌 바오', role: 'user', score: 920, streak: 2, answered: 22 },
  { rank: 5, name: '이정민', role: 'user', score: 880, streak: 4, answered: 19 }
]

export const RANK_TIERS: RankTier[] = [
  { label: 'Certified Legend', scoreRange: '1200+ 점', highlight: '인증 사용자 전용 상담 Q&A 우선 노출', color: '#2563eb' },
  { label: 'Community Expert', scoreRange: '900 ~ 1190점', highlight: '답변 추천 배지 + 피드 상단 2배 노출', color: '#10b981' },
  { label: 'Rising Helper', scoreRange: '600 ~ 899점', highlight: '미션 보상 1.5배, 인증 신청 시 가산점', color: '#f59e0b' },
  { label: 'Explorer', scoreRange: '0 ~ 599점', highlight: '첫 질문/답변 시 웰컴 보너스 제공', color: '#6b7280' }
]

export const WEEKLY_MISSIONS: WeeklyMission[] = [
  {
    title: '새로운 질문 3개 답변하기',
    description: '관심 카테고리에서 최신 질문에 답변하면 보너스 200점 지급',
    progress: 2,
    target: 3,
    due: 'D-2'
  },
  {
    title: 'Certified User 추천하기',
    description: '신규 인증 신청자를 초대하면 1건당 150점 적립',
    progress: 1,
    target: 2,
    due: 'D-4'
  },
  {
    title: '처음 온 사용자 환영 댓글 남기기',
    description: '첫 질문 사용자에게 인사 댓글 남기기',
    progress: 4,
    target: 5,
    due: 'D-1'
  }
]

export const UPCOMING_PLANS = [
  'Supabase 통계 뷰를 활용한 실시간 랭킹 집계 및 정렬(주간/월간/누적)',
  'Certified User 검증 상태와 연동된 보상 구조(Booster Mission, 점수 승급)',
  '랭킹 알림·축하 배너 자동 발송 및 커뮤니티 관리자용 인사이트 패널'
]
