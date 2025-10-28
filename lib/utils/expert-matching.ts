// 베트남 커뮤니티 전문가 매칭 알고리즘
export function findExpertMatches(question: any, availableExperts: any[]) {
  const matches = availableExperts.map(expert => {
    let score = 0

    // 1. 전문 분야 매칭 (40점)
    if (expert.specialties && question.category) {
      const categoryMatch = expert.specialties.some((specialty: string) =>
        question.category.toLowerCase().includes(specialty.toLowerCase()) ||
        question.title.toLowerCase().includes(specialty.toLowerCase()) ||
        question.tags?.some((tag: string) => tag.toLowerCase().includes(specialty.toLowerCase()))
      )
      if (categoryMatch) score += 40
    }

    // 2. 신뢰도 점수 (20점)
    const trustRatio = (expert.trust_score || 0) / 1000
    score += Math.min(trustRatio * 20, 20)

    // 3. 거주 기간 (경험) (15점)
    const yearsScore = Math.min((expert.residence_years || 0) * 3, 15)
    score += yearsScore

    // 4. 답변 활동성 (10점)
    const answerRatio = (expert.helpful_answer_count || 0) / Math.max(expert.answer_count || 1, 1)
    score += answerRatio * 10

    // 5. 배지 보너스 (10점)
    if (expert.badges?.expert) score += 5
    if (expert.badges?.verified) score += 3
    if (expert.badges?.helpful) score += 2

    // 6. 최근 활동성 (5점)
    const lastActive = new Date(expert.last_active || 0)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceActive <= 7) score += 5
    else if (daysSinceActive <= 30) score += 3
    else if (daysSinceActive <= 90) score += 1

    return {
      expert,
      score: Math.round(score),
      match_reasons: generateMatchReasons(expert, question, score)
    }
  })

  // 점수 기준 정렬 후 상위 5명 반환
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(match => match.score >= 30) // 최소 30점 이상만
}

// 매칭 이유 생성
function generateMatchReasons(expert: any, question: any, score: number) {
  const reasons: string[] = []

  if (expert.specialties?.some((s: string) =>
    question.category?.toLowerCase().includes(s.toLowerCase())
  )) {
    reasons.push(`${question.category} 전문가`)
  }

  if (expert.residence_years >= 5) {
    reasons.push(`한국 거주 ${expert.residence_years}년 경험`)
  }

  if (expert.badges?.expert) {
    reasons.push('인증된 전문가')
  }

  if (expert.trust_score >= 800) {
    reasons.push('높은 신뢰도')
  }

  if (expert.helpful_answer_count >= 50) {
    reasons.push('활발한 답변 활동')
  }

  return reasons
}

// 답변 품질 평가 알고리즘
export function evaluateAnswerQuality(answer: any, question: any) {
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
  const expertKeywords = ['서류', '신청', '절차', '방법', '팁', '주의', '경험', '추천']
  const keywordMatches = expertKeywords.filter(keyword =>
    answer.content?.toLowerCase().includes(keyword)
  ).length
  qualityScore += Math.min(keywordMatches * 2, 15)

  // 4. 베트남 특화 정보 (최대 10점)
  const vietnamKeywords = ['베트남', '아포스티유', '영사확인', '번역공증', '한국어']
  const vietnamMatches = vietnamKeywords.filter(keyword =>
    answer.content?.toLowerCase().includes(keyword.toLowerCase())
  ).length
  qualityScore += Math.min(vietnamMatches * 2, 10)

  // 5. 작성자 신뢰도 (최대 20점)
  const authorTrust = (answer.author?.trust_score || 0) / 1000
  qualityScore += Math.min(authorTrust * 20, 20)

  // 6. 전문가 여부 (최대 10점)
  if (answer.author?.badges?.expert) qualityScore += 10
  else if (answer.author?.badges?.verified) qualityScore += 5

  // 7. 응답 속도 보너스 (최대 10점)
  if (answer.response_time_hours <= 1) qualityScore += 10
  else if (answer.response_time_hours <= 6) qualityScore += 7
  else if (answer.response_time_hours <= 24) qualityScore += 5
  else if (answer.response_time_hours <= 72) qualityScore += 3

  return Math.min(Math.round(qualityScore), 100)
}