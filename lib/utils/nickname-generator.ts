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
export type NicknameContext = {
  residence?: string
  gender?: string
  age?: string
  category?: string
  topics?: string[]
  interests?: string[]
}

const RESIDENCE_LABELS: Record<string, string[]> = {
  korea: ['서울', '코리아', '한강'],
  abroad: ['글로벌', '월드', '어디서나'],
}

const CATEGORY_LABELS: Record<string, string[]> = {
  student: ['유학생', '학생', '학구파'],
  worker: ['직장인', '전문가', '워커'],
  resident: ['정착러', '생활자', '거주민'],
  business: ['비즈니스', '창업자', '사장님'],
  other: ['탐험가', '모험가', '커넥터'],
}

const AGE_LABELS: Record<string, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s': '60대',
}

const TOPIC_LABELS: Record<string, string> = {
  '한국 비자·체류': '비자',
  '한국 직장생활': '직장',
  '한국 생활 정착': '정착',
  '한국에서 집 구하기': '주거',
  '베트남 송금·금융': '금융',
  '한국어 배우기': '한국어',
}

const GENDER_ADJECTIVES: Record<string, string[]> = {
  male: ['열정적인', '든든한', '활기찬'],
  female: ['빛나는', '섬세한', '따뜻한'],
  other: ['대담한', '유연한', '열린'],
}

const DEFAULT_CORE = '커넥터'
const MAX_NICKNAME_LENGTH = 16

const choose = <T>(list: T[]): T | null => {
  if (!Array.isArray(list) || list.length === 0) return null
  const index = Math.floor(Math.random() * list.length)
  return list[index] ?? null
}

const sanitizeNickname = (value: string): string => value.replace(/\s+/g, '')

export function generateNickname(context: NicknameContext = {}): string {
  const baseAdjective =
    choose(GENDER_ADJECTIVES[context.gender ?? ''] || []) ??
    choose(ADJECTIVES) ??
    '즐거운'
  const residence = choose(RESIDENCE_LABELS[context.residence ?? ''] || [])
  const category = choose(CATEGORY_LABELS[context.category ?? ''] || [])
  const age = context.age ? AGE_LABELS[context.age] : undefined
  const topicSource = (context.topics && context.topics.length > 0
    ? context.topics
    : context.interests) || []
  const topicName = topicSource.length > 0 ? choose(topicSource) : null
  const topicLabel =
    (topicName && TOPIC_LABELS[topicName]) ||
    (topicName ? topicName.replace(/(한국|베트남)/g, '').trim() : null)

  const coreSegments = [
    baseAdjective,
    residence,
    age,
    category,
    topicLabel ? `${topicLabel}` : null,
  ].filter((segment): segment is string => Boolean(segment && segment.trim().length > 0))

  let core = coreSegments.join('')
  if (!core || core.length < 2) {
    const fallbackNoun = choose(NOUNS) ?? DEFAULT_CORE
    core = `${baseAdjective}${fallbackNoun}`
  }

  const number = Math.floor(Math.random() * 900) + 100 // 100-999
  let nickname = `${sanitizeNickname(core)}${number}`

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    const trimmedCore = sanitizeNickname(core).slice(0, MAX_NICKNAME_LENGTH - 3)
    nickname = `${trimmedCore}${number}`.slice(0, MAX_NICKNAME_LENGTH)
  }

  if (nickname.length < 4) {
    nickname = `${DEFAULT_CORE}${number}`
  }

  return nickname
}

/**
 * 중복되지 않는 닉네임 생성 (localStorage 기반)
 */
export function generateUniqueNickname(context?: NicknameContext): string {
  let nickname = generateNickname(context)
  let attempts = 0

  // 최대 10번 시도
  while (isNicknameTaken(nickname) && attempts < 10) {
    nickname = generateNickname(context)
    attempts++
  }

  return nickname
}

/**
 * 닉네임 중복 체크 (localStorage 기반)
 */
function isNicknameTaken(nickname: string): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false
  }
  try {
    // Mock: localStorage에서 모든 사용자 체크
    const raw = localStorage.getItem('all_users') || '[]'
    const users = JSON.parse(raw) as Array<{ nickname?: unknown }>
    return users.some((user) => typeof user.nickname === 'string' && user.nickname === nickname)
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
