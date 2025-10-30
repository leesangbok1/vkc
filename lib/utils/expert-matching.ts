import { QuestionWithRelations, UserWithStats } from '@/lib/types/api'

type CertifiedUser = UserWithStats

interface CertifiedMatch {
  certifiedUser: CertifiedUser
  score: number
  match_reasons: string[]
}

// 베트남 커뮤니티 인증 사용자 매칭 알고리즘
export function findCertifiedMatches(
  question: QuestionWithRelations,
  availableCertifiedUsers: CertifiedUser[]
): CertifiedMatch[] {
  const matches = availableCertifiedUsers.map(certifiedUser => {
    let score = 0

    // 1. 인증 분야 매칭 (40점)
    if (certifiedUser.specialty_areas && certifiedUser.specialty_areas.length > 0) {
      const normalizedTags = (question.tags ?? []).map((tag) => tag.toLowerCase())
      const categoryMatch = certifiedUser.specialty_areas.some((specialty) => {
        if (typeof specialty !== 'string') return false
        const lower = specialty.toLowerCase()
        return normalizedTags.includes(lower) || question.title.toLowerCase().includes(lower)
      })
      if (categoryMatch) score += 40
    }

    // 2. 신뢰도 점수 (20점)
    const trustRatio = (certifiedUser.trust_score || 0) / 1000
    score += Math.min(trustRatio * 20, 20)

    // 3. 거주 기간 (경험) (15점)
    const yearsScore = Math.min((certifiedUser.years_in_korea || 0) * 3, 15)
    score += yearsScore

    // 4. 답변 활동성 (10점)
    const answerRatio = (certifiedUser.helpful_answer_count || 0) / Math.max(certifiedUser.answer_count || 1, 1)
    score += answerRatio * 10

    // 5. 배지 보너스 (10점)
    if (certifiedUser.badges?.certified) score += 5
    if (certifiedUser.badges?.verified) score += 3
    if (certifiedUser.badges?.helper) score += 2

    // 6. 최근 활동성 (5점)
    const lastActive = new Date(certifiedUser.last_active || 0)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceActive <= 7) score += 5
    else if (daysSinceActive <= 30) score += 3
    else if (daysSinceActive <= 90) score += 1

    return {
      certifiedUser,
      score: Math.round(score),
      match_reasons: generateMatchReasons(certifiedUser, question, score)
    }
  })

  // 점수 기준 정렬 후 상위 5명 반환
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(match => match.score >= 30) // 최소 30점 이상만
}

// 매칭 이유 생성
function generateMatchReasons(
  certifiedUser: CertifiedUser,
  question: QuestionWithRelations,
  score: number
): string[] {
  const reasons: string[] = []

  const normalizedTags = (question.tags ?? []).map((tag) => tag.toLowerCase())
  const specialtyHit = certifiedUser.specialty_areas?.some((specialty) =>
    typeof specialty === 'string' && normalizedTags.includes(specialty.toLowerCase())
  )
  if (specialtyHit) {
    reasons.push('관련 분야 인증 사용자')
  }

  if ((certifiedUser.years_in_korea ?? 0) >= 5) {
    reasons.push(`한국 거주 ${certifiedUser.years_in_korea}년 경험`)
  }

  if (certifiedUser.badges.certified) {
    reasons.push('인증된 사용자')
  }

  if (certifiedUser.trust_score >= 800) {
    reasons.push('높은 신뢰도')
  }

  if (certifiedUser.helpful_answer_count >= 50) {
    reasons.push('활발한 답변 활동')
  }

  return reasons
}

interface Answer {
  content?: string
  response_time_hours?: number
  author?: {
    trust_score?: number
    badges?: Record<string, boolean>
  }
}

// 답변 품질 평가 알고리즘
export function evaluateAnswerQuality(answer: Answer, question: QuestionWithRelations): number {
  let qualityScore = 0

  // 1. 답변 길이 (최대 20점)
  const contentLength = answer.content?.length || 0
  if (contentLength >= 500) qualityScore += 20
  else if (contentLength >= 200) qualityScore += 15
  else if (contentLength >= 100) qualityScore += 10
  else if (contentLength >= 50) qualityScore += 5

  // 2. 구조화된 답변 (최대 15점)
  const hasNumbering = /\d+\.|•|▪|→/.test(answer.content)
  const hasFormatting = /\*\*|\n\n|###|##/.test(answer.content)
  if (hasNumbering) qualityScore += 10
  if (hasFormatting) qualityScore += 5

  // 3. 전문성 키워드 (최대 15점)
  const normalizedContent = answer.content?.toLowerCase() ?? ''
  const expertKeywords = ['서류', '신청', '절차', '방법', '팁', '주의', '경험', '추천']
  const keywordMatches = expertKeywords.filter((keyword) =>
    normalizedContent.includes(keyword)
  ).length
  qualityScore += Math.min(keywordMatches * 2, 15)

  // 4. 베트남 특화 정보 (최대 10점)
  const vietnamKeywords = ['베트남', '아포스티유', '영사확인', '번역공증', '한국어']
  const vietnamMatches = vietnamKeywords.filter((keyword) =>
    normalizedContent.includes(keyword.toLowerCase())
  ).length
  qualityScore += Math.min(vietnamMatches * 2, 10)

  // 5. 작성자 신뢰도 (최대 20점)
  const authorTrust = (answer.author?.trust_score || 0) / 1000
  qualityScore += Math.min(authorTrust * 20, 20)

  // 6. 인증 사용자 여부 (최대 10점)
  if (answer.author?.badges?.certified) qualityScore += 10
  else if (answer.author?.badges?.verified) qualityScore += 5

  // 7. 응답 속도 보너스 (최대 10점)
  const responseTime = answer.response_time_hours ?? Number.POSITIVE_INFINITY
  if (responseTime <= 1) qualityScore += 10
  else if (responseTime <= 6) qualityScore += 7
  else if (responseTime <= 24) qualityScore += 5
  else if (responseTime <= 72) qualityScore += 3

  return Math.min(Math.round(qualityScore), 100)
}

// Alias for backward compatibility
export const findExpertMatches = findCertifiedMatches
