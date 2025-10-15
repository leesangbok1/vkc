/**
 * 랜덤 닉네임 생성기
 * 형식: [형용사] + [명사] + [3자리 숫자]
 * 예: "슬기로운 한국생활123", "행복한 서울생활456"
 */

const ADJECTIVES = [
  '슬기로운', '행복한', '즐거운', '활기찬', '밝은',
  '긍정적인', '따뜻한', '친절한', '성실한', '열정적인',
  '용감한', '지혜로운', '똑똑한', '재미있는', '멋진',
  '성공한', '도전하는', '꿈꾸는', '희망찬', '활발한'
]

const NOUNS = [
  '한국생활', '서울생활', '부산생활', '베트남인',
  '유학생', '직장인', '이민자', '여행자', '거주자',
  '친구', '동료', '이웃', '커뮤니티', '멤버',
  '탐험가', '도전자', '개척자', '선구자', '모험가'
]

/**
 * 랜덤 닉네임 생성
 */
export function generateNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(Math.random() * 900) + 100 // 100-999

  return `${adjective} ${noun}${number}`
}

/**
 * 중복되지 않는 닉네임 생성 (localStorage 기반)
 */
export function generateUniqueNickname(): string {
  let nickname = generateNickname()
  let attempts = 0

  // 최대 10번 시도
  while (isNicknameTaken(nickname) && attempts < 10) {
    nickname = generateNickname()
    attempts++
  }

  return nickname
}

/**
 * 닉네임 중복 체크 (localStorage 기반)
 */
function isNicknameTaken(nickname: string): boolean {
  try {
    // Mock: localStorage에서 모든 사용자 체크
    const users = JSON.parse(localStorage.getItem('all_users') || '[]')
    return users.some((u: any) => u.nickname === nickname)
  } catch (error) {
    console.error('닉네임 중복 체크 실패:', error)
    return false
  }
}

/**
 * 닉네임 유효성 검증
 */
export function validateNickname(nickname: string): {
  isValid: boolean
  error?: string
} {
  if (!nickname || nickname.trim().length === 0) {
    return { isValid: false, error: '닉네임을 입력해주세요' }
  }

  if (nickname.length < 2) {
    return { isValid: false, error: '닉네임은 최소 2자 이상이어야 합니다' }
  }

  if (nickname.length > 16) {
    return { isValid: false, error: '닉네임은 최대 16자까지 가능합니다' }
  }

  // 특수문자 체크 (한글, 영문, 숫자, 공백만 허용)
  const validPattern = /^[가-힣a-zA-Z0-9\s]+$/
  if (!validPattern.test(nickname)) {
    return { isValid: false, error: '한글, 영문, 숫자, 공백만 사용 가능합니다' }
  }

  return { isValid: true }
}
