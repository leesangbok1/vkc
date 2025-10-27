/**
 * Viet K-Connect Mock Data
 * 중앙집중식 Mock 데이터 파일
 *
 * 철학: "검증된 선경험자의 답변으로 해결합니다"
 * - VERIFIED 전문가 70%는 베트남인 선경험자
 * - 실제 경험 기반의 현실적인 답변
 */

// ============================================
// 타입 정의
// ============================================

export type UserRole = 'guest' | 'user' | 'verified' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string
  specialty?: string
  yearsInKorea?: number
  visaType?: string
  verificationProof?: string
}

export interface Question {
  id: string
  type: 'question'
  title: string
  content: string
  author: User
  category: string
  topic?: string  // Topic slug from categories-mock.ts
  votes: number
  views: number
  answerCount: number
  createdAt: string
  tags?: string[]
  status?: 'solved' | 'unsolved'  // 질문 해결 상태
  accepted_answer_id?: string     // 채택된 답변 ID
}

export interface Answer {
  id: string
  questionId: string
  content: string
  author: User
  isExpert: boolean
  createdAt: string
  helpful: number
  commentCount: number
  is_accepted?: boolean  // 채택된 답변 여부
}

export interface Post {
  id: string
  type: 'post'
  title: string
  content: string
  author: User
  category: string
  votes: number  // deprecated - helpful로 대체
  views: number  // deprecated - 표시 안함
  commentCount: number
  createdAt: string
  tags?: string[]
  helpful_count?: number  // 도움됨 카운트
}

export interface Banner {
  id: string
  title: string
  description: string
  imageUrl?: string
  linkUrl: string
  backgroundColor?: string
}


// ============================================
// 베트남인 VERIFIED 선경험자 (70%)
// ============================================

export const VIETNAMESE_EXPERTS: User[] = [
  // === 비자·체류 전문가 (10명) ===
  {
    id: 've1',
    name: 'Nguyễn Văn Hùng',
    role: 'verified',
    avatar: 'N',
    specialty: '비자 연장 전문',
    yearsInKorea: 7,
    visaType: 'E-9',
    verificationProof: '거주증명서 인증 완료'
  },
  {
    id: 've2',
    name: 'Trần Minh Đức',
    role: 'verified',
    avatar: 'T',
    specialty: '영주권 신청 전문',
    yearsInKorea: 9,
    visaType: 'F-5',
    verificationProof: '영주증 인증 완료'
  },
  {
    id: 've3',
    name: 'Lê Văn Toàn',
    role: 'verified',
    avatar: 'L',
    specialty: 'E-9→E-7 전환 전문',
    yearsInKorea: 6,
    visaType: 'E-7',
    verificationProof: 'E-7 비자 인증 완료'
  },
  {
    id: 've4',
    name: 'Phạm Thị Lan',
    role: 'verified',
    avatar: 'P',
    specialty: '비자 연장 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '외국인등록증 인증 완료'
  },
  {
    id: 've5',
    name: 'Hoàng Văn Dũng',
    role: 'verified',
    avatar: 'H',
    specialty: '비자 변경 전문',
    yearsInKorea: 4,
    visaType: 'D-2→E-7',
    verificationProof: '학생→취업비자 전환 완료'
  },
  {
    id: 've6',
    name: 'Võ Thị Mai',
    role: 'verified',
    avatar: 'V',
    specialty: 'F-6 비자 전문',
    yearsInKorea: 6,
    visaType: 'F-6',
    verificationProof: '결혼이민 비자 인증'
  },
  {
    id: 've7',
    name: 'Đặng Văn Khánh',
    role: 'verified',
    avatar: 'Đ',
    specialty: '출입국 관리 전문',
    yearsInKorea: 8,
    visaType: 'F-5',
    verificationProof: '출입국기록 인증'
  },
  {
    id: 've8',
    name: 'Bùi Thị Hương',
    role: 'verified',
    avatar: 'B',
    specialty: '가족초청 전문',
    yearsInKorea: 7,
    visaType: 'F-1',
    verificationProof: '가족초청 완료'
  },
  {
    id: 've9',
    name: 'Trịnh Văn Sơn',
    role: 'verified',
    avatar: 'T',
    specialty: 'E-9 재입국 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '재입국허가 인증'
  },
  {
    id: 've10',
    name: 'Ngô Thị Linh',
    role: 'verified',
    avatar: 'N',
    specialty: 'D-4 어학연수 전문',
    yearsInKorea: 3,
    visaType: 'D-4',
    verificationProof: '어학당 재학증명서'
  },

  // === 취업·근로 전문가 (10명) ===
  {
    id: 've11',
    name: 'Phạm Văn Cường',
    role: 'verified',
    avatar: 'P',
    specialty: '근로계약 전문',
    yearsInKorea: 8,
    visaType: 'E-9',
    verificationProof: '공장 반장 경력 인증'
  },
  {
    id: 've12',
    name: 'Nguyễn Thị Lan',
    role: 'verified',
    avatar: 'N',
    specialty: '통역·번역 전문',
    yearsInKorea: 6,
    visaType: 'E-7',
    verificationProof: '통역사 자격증 인증'
  },
  {
    id: 've13',
    name: 'Trần Văn Khanh',
    role: 'verified',
    avatar: 'T',
    specialty: '이직 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '이직 3회 경험 인증'
  },
  {
    id: 've14',
    name: 'Lê Văn Minh',
    role: 'verified',
    avatar: 'L',
    specialty: '제조업 전문',
    yearsInKorea: 9,
    visaType: 'E-9',
    verificationProof: '제조업 9년 경력'
  },
  {
    id: 've15',
    name: 'Hoàng Thị Nga',
    role: 'verified',
    avatar: 'H',
    specialty: '급여협상 전문',
    yearsInKorea: 4,
    visaType: 'E-9',
    verificationProof: '급여인상 협상 성공'
  },
  {
    id: 've16',
    name: 'Võ Văn Tú',
    role: 'verified',
    avatar: 'V',
    specialty: '건설업 전문',
    yearsInKorea: 7,
    visaType: 'E-9',
    verificationProof: '건설현장 7년 경력'
  },
  {
    id: 've17',
    name: 'Đỗ Thị Hà',
    role: 'verified',
    avatar: 'Đ',
    specialty: '식품가공 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '식품공장 경력'
  },
  {
    id: 've18',
    name: 'Phan Văn Long',
    role: 'verified',
    avatar: 'P',
    specialty: '자동차부품 전문',
    yearsInKorea: 6,
    visaType: 'E-9',
    verificationProof: '자동차부품 경력'
  },
  {
    id: 've19',
    name: 'Nguyễn Văn Quân',
    role: 'verified',
    avatar: 'N',
    specialty: '전자제품 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '전자제품 공장 경력'
  },
  {
    id: 've20',
    name: 'Trần Thị Hoa',
    role: 'verified',
    avatar: 'T',
    specialty: '섬유·봉제 전문',
    yearsInKorea: 4,
    visaType: 'E-9',
    verificationProof: '봉제공장 경력'
  },

  // === 생활·정착 전문가 (10명) ===
  {
    id: 've21',
    name: 'Lê Thị Hoa',
    role: 'verified',
    avatar: 'L',
    specialty: '결혼이민 정착 전문',
    yearsInKorea: 8,
    visaType: 'F-6',
    verificationProof: '결혼이민 8년차'
  },
  {
    id: 've22',
    name: 'Nguyễn Văn Minh',
    role: 'verified',
    avatar: 'N',
    specialty: '안산 생활 전문',
    yearsInKorea: 10,
    visaType: 'F-5',
    verificationProof: '안산 거주 10년'
  },
  {
    id: 've23',
    name: 'Phạm Thị Mai',
    role: 'verified',
    avatar: 'P',
    specialty: '식당 창업 전문',
    yearsInKorea: 7,
    visaType: 'F-2',
    verificationProof: '베트남 식당 운영'
  },
  {
    id: 've24',
    name: 'Trần Văn Duy',
    role: 'verified',
    avatar: 'T',
    specialty: '주거 전문',
    yearsInKorea: 6,
    visaType: 'E-9',
    verificationProof: '이사 5회 경험'
  },
  {
    id: 've25',
    name: 'Lê Văn Tuấn',
    role: 'verified',
    avatar: 'L',
    specialty: '은행·금융 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '은행계좌 개설 경험'
  },
  {
    id: 've26',
    name: 'Hoàng Thị Thu',
    role: 'verified',
    avatar: 'H',
    specialty: '의료·보험 전문',
    yearsInKorea: 7,
    visaType: 'F-6',
    verificationProof: '건강보험 가입'
  },
  {
    id: 've27',
    name: 'Võ Văn Bình',
    role: 'verified',
    avatar: 'V',
    specialty: '교통·운전 전문',
    yearsInKorea: 4,
    visaType: 'E-9',
    verificationProof: '운전면허 취득'
  },
  {
    id: 've28',
    name: 'Đặng Thị Ngọc',
    role: 'verified',
    avatar: 'Đ',
    specialty: '쇼핑·식료품 전문',
    yearsInKorea: 6,
    visaType: 'F-6',
    verificationProof: '베트남 식료품 구매'
  },
  {
    id: 've29',
    name: 'Bùi Văn Nam',
    role: 'verified',
    avatar: 'B',
    specialty: '통신·휴대폰 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '휴대폰 개통 경험'
  },
  {
    id: 've30',
    name: 'Trịnh Thị Hằng',
    role: 'verified',
    avatar: 'T',
    specialty: '문화생활 전문',
    yearsInKorea: 6,
    visaType: 'F-6',
    verificationProof: '커뮤니티 활동'
  },

  // === 교육·언어 전문가 (5명) ===
  {
    id: 've31',
    name: 'Trần Văn Tuấn',
    role: 'verified',
    avatar: 'T',
    specialty: 'TOPIK 학습 전문',
    yearsInKorea: 4,
    visaType: 'E-7',
    verificationProof: 'TOPIK 6급 인증'
  },
  {
    id: 've32',
    name: 'Nguyễn Thị Hương',
    role: 'verified',
    avatar: 'N',
    specialty: '대학 진학 전문',
    yearsInKorea: 5,
    visaType: 'D-2',
    verificationProof: '대학원 재학 중'
  },
  {
    id: 've33',
    name: 'Lê Văn Hoàng',
    role: 'verified',
    avatar: 'L',
    specialty: '한국어 학습 전문',
    yearsInKorea: 6,
    visaType: 'E-7',
    verificationProof: '한국어 강사 자격'
  },
  {
    id: 've34',
    name: 'Phạm Thị Nhung',
    role: 'verified',
    avatar: 'P',
    specialty: '어학당 전문',
    yearsInKorea: 3,
    visaType: 'D-4',
    verificationProof: '어학당 수료'
  },
  {
    id: 've35',
    name: 'Hoàng Văn Đạt',
    role: 'verified',
    avatar: 'H',
    specialty: '대학원 진학 전문',
    yearsInKorea: 7,
    visaType: 'D-2',
    verificationProof: '석사 졸업'
  },

  // === 법률·권리 전문가 (5명) ===
  {
    id: 've36',
    name: 'Phạm Văn Đức',
    role: 'verified',
    avatar: 'P',
    specialty: '산재보험 전문',
    yearsInKorea: 6,
    visaType: 'E-9',
    verificationProof: '산재 신청 경험'
  },
  {
    id: 've37',
    name: 'Nguyễn Văn Sơn',
    role: 'verified',
    avatar: 'N',
    specialty: '임금체불 해결 전문',
    yearsInKorea: 7,
    visaType: 'E-9',
    verificationProof: '노동청 신고 경험'
  },
  {
    id: 've38',
    name: 'Trần Thị Linh',
    role: 'verified',
    avatar: 'T',
    specialty: '근로계약 전문',
    yearsInKorea: 5,
    visaType: 'E-9',
    verificationProof: '계약분쟁 해결'
  },
  {
    id: 've39',
    name: 'Lê Văn Hải',
    role: 'verified',
    avatar: 'L',
    specialty: '퇴직금 전문',
    yearsInKorea: 8,
    visaType: 'E-9',
    verificationProof: '퇴직금 수령 경험'
  },
  {
    id: 've40',
    name: 'Võ Thị Xuân',
    role: 'verified',
    avatar: 'V',
    specialty: '권리보호 전문',
    yearsInKorea: 6,
    visaType: 'F-6',
    verificationProof: '외국인 권리 상담'
  },
]

// ============================================
// 한국인 전문가 (30%)
// ============================================

export const KOREAN_EXPERTS: User[] = [
  {
    id: 'ke1',
    name: '이민수 변호사',
    role: 'verified',
    avatar: '이',
    specialty: '이민법 전문',
    verificationProof: '법무법인 대표'
  },
  {
    id: 'ke2',
    name: '김태희 노무사',
    role: 'verified',
    avatar: '김',
    specialty: '노동법 전문',
    verificationProof: '노무법인 대표'
  },
  {
    id: 'ke3',
    name: '박성준 행정사',
    role: 'verified',
    avatar: '박',
    specialty: '비자 행정 전문',
    verificationProof: '행정사 자격증'
  },
  {
    id: 'ke4',
    name: '최은영 상담사',
    role: 'verified',
    avatar: '최',
    specialty: '외국인 상담 전문',
    verificationProof: '다문화센터 상담사'
  },
  {
    id: 'ke5',
    name: '정민호 통역사',
    role: 'verified',
    avatar: '정',
    specialty: '한·베 통역 전문',
    verificationProof: '법원 통역사 자격'
  },
  {
    id: 'ke6',
    name: '강수진 한국어강사',
    role: 'verified',
    avatar: '강',
    specialty: '한국어 교육 전문',
    verificationProof: '한국어 교원 자격'
  },
  {
    id: 'ke7',
    name: '윤재혁 세무사',
    role: 'verified',
    avatar: '윤',
    specialty: '외국인 세무 전문',
    verificationProof: '세무사 자격증'
  },
  {
    id: 'ke8',
    name: '홍지연 사회복지사',
    role: 'verified',
    avatar: '홍',
    specialty: '복지 상담 전문',
    verificationProof: '사회복지사 1급'
  },
  {
    id: 'ke9',
    name: '서동현 부동산중개사',
    role: 'verified',
    avatar: '서',
    specialty: '외국인 주거 전문',
    verificationProof: '공인중개사 자격'
  },
  {
    id: 'ke10',
    name: '임수연 보험설계사',
    role: 'verified',
    avatar: '임',
    specialty: '외국인 보험 전문',
    verificationProof: '보험설계사 자격'
  },
]

// ============================================
// 일반 회원 (답변자)
// ============================================

export const REGULAR_USERS: User[] = [
  { id: 'u1', name: '베트남노동자', role: 'user', avatar: '베' },
  { id: 'u2', name: '하노이출신', role: 'user', avatar: '하' },
  { id: 'u3', name: '공부왕', role: 'user', avatar: '공' },
  { id: 'u4', name: '공장근무자', role: 'user', avatar: '공' },
  { id: 'u5', name: '장기체류자', role: 'user', avatar: '장' },
  { id: 'u6', name: '신규이주자', role: 'user', avatar: '신' },
  { id: 'u7', name: '한국생활초보', role: 'user', avatar: '한' },
  { id: 'u8', name: '베트남유학생', role: 'user', avatar: '베' },
  { id: 'u9', name: '취업준비생', role: 'user', avatar: '취' },
  { id: 'u10', name: '이직고민중', role: 'user', avatar: '이' },
]

// ============================================
// 관리자
// ============================================

export const ADMIN_USER: User = {
  id: 'admin1',
  name: 'Viet K-Connect 관리자',
  role: 'admin',
  avatar: '관',
  specialty: '플랫폼 운영',
  verificationProof: '공식 관리자'
}

// 모든 사용자 통합
export const ALL_USERS = [
  ...VIETNAMESE_EXPERTS,
  ...KOREAN_EXPERTS,
  ...REGULAR_USERS,
  ADMIN_USER,
]

// MOCK_USERS alias for ALL_USERS (for compatibility)
export const MOCK_USERS = ALL_USERS

// ============================================
// Helper 함수
// ============================================

export function getUserById(id: string): User | undefined {
  return ALL_USERS.find(u => u.id === id)
}

export function getRandomUser(role?: UserRole): User {
  if (role === 'verified') {
    const experts = [...VIETNAMESE_EXPERTS, ...KOREAN_EXPERTS]
    return experts[Math.floor(Math.random() * experts.length)]
  }
  if (role === 'user') {
    return REGULAR_USERS[Math.floor(Math.random() * REGULAR_USERS.length)]
  }
  if (role === 'admin') {
    return ADMIN_USER
  }
  return ALL_USERS[Math.floor(Math.random() * ALL_USERS.length)]
}

export function getExpertsByCategory(category: string): User[] {
  const categoryMap: Record<string, string[]> = {
    '한국 비자·체류': VIETNAMESE_EXPERTS.slice(0, 10).map(e => e.id).concat(['ke1', 'ke3']),
    '한국 취업': VIETNAMESE_EXPERTS.slice(10, 20).map(e => e.id).concat(['ke2']),
    '한국 생활': VIETNAMESE_EXPERTS.slice(20, 30).map(e => e.id).concat(['ke4', 'ke9']),
    '한국 교육·언어': VIETNAMESE_EXPERTS.slice(30, 35).map(e => e.id).concat(['ke6']),
    '한국 법률·권리': VIETNAMESE_EXPERTS.slice(35, 40).map(e => e.id).concat(['ke2', 'ke8']),
  }

  const expertIds = categoryMap[category] || []
  return expertIds.map(id => getUserById(id)).filter(Boolean) as User[]
}

// ============================================
// 카테고리별 질문 Mock 데이터 (40개)
// ============================================

const now = Date.now()
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export const MOCK_QUESTIONS: Question[] = [
  // === 한국 비자·체류 (10개) ===
  {
    id: 'q1',
    type: 'question',
    title: 'E-9 비자 연장 신청 방법이 궁금합니다',
    content: '안녕하세요. 제 E-9 비자가 다음 달에 만료되는데 연장 신청을 어떻게 해야 하나요? 필요한 서류와 절차에 대해 자세히 알려주시면 감사하겠습니다. 회사에서 도와주지 않아서 혼자 준비해야 합니다.',
    author: REGULAR_USERS[0],
    category: '한국 비자·체류',
    topic: 'visa-extension',
    votes: 24,
    views: 356,
    answerCount: 5,
    createdAt: new Date(now - 2 * HOUR).toISOString(),
    tags: ['E-9', '비자연장', '외국인등록증']
  },
  {
    id: 'q2',
    type: 'question',
    title: 'F-5 영주권 신청 자격 조건이 어떻게 되나요?',
    content: '한국에서 5년째 E-9 비자로 일하고 있습니다. 영주권(F-5) 신청이 가능한지, 어떤 조건을 충족해야 하는지 알고 싶습니다. 한국어 능력은 TOPIK 2급 있습니다.',
    author: VIETNAMESE_EXPERTS[1], // verified 사용자로 변경
    category: '한국 비자·체류',
    topic: 'status-change',
    votes: 56,
    views: 1234,
    answerCount: 9,
    createdAt: new Date(now - 3 * DAY).toISOString(),
    tags: ['F-5', '영주권', 'E-9']
  },
  {
    id: 'q3',
    type: 'question',
    title: 'E-9에서 E-7 비자로 변경 가능한가요?',
    content: '제조업 공장에서 5년 일했는데 기술자격증을 땄습니다. E-7 비자로 변경하고 싶은데 가능한가요? 변경 절차와 필요 서류를 알려주세요.',
    author: VIETNAMESE_EXPERTS[2], // verified 사용자로 변경
    category: '한국 비자·체류',
    topic: 'status-change',
    votes: 45,
    views: 892,
    answerCount: 7,
    createdAt: new Date(now - 5 * DAY).toISOString(),
    tags: ['E-9', 'E-7', '비자변경']
  },
  {
    id: 'q4',
    type: 'question',
    title: '베트남 가족 초청 방법과 필요 서류',
    content: 'E-9 비자로 4년째 일하고 있습니다. 부모님을 한국으로 초청하고 싶은데 어떤 비자를 신청해야 하나요? 필요한 서류와 절차를 알려주세요.',
    author: REGULAR_USERS[5],
    category: '한국 비자·체류',
    topic: 'status-change',
    votes: 38,
    views: 678,
    answerCount: 6,
    createdAt: new Date(now - 7 * DAY).toISOString(),
    tags: ['가족초청', 'F-1', '초청장']
  },
  {
    id: 'q5',
    type: 'question',
    title: '재입국허가 신청은 어디서 하나요?',
    content: '베트남에 잠깐 다녀오려고 하는데 재입국허가를 받아야 한다고 들었습니다. 어디서 신청하고 비용은 얼마나 드나요?',
    author: REGULAR_USERS[6],
    category: '한국 생활 정착',
    topic: 'adaptation-tips',
    votes: 29,
    views: 445,
    answerCount: 4,
    createdAt: new Date(now - 10 * DAY).toISOString(),
    tags: ['재입국허가', '출입국']
  },
  {
    id: 'q6',
    type: 'question',
    title: 'F-6 결혼이민 비자 신청 절차 문의',
    content: '한국 사람과 결혼 예정입니다. F-6 비자 신청 절차와 필요한 서류가 무엇인지 자세히 알고 싶습니다. 베트남에서 준비해야 할 서류도 있나요?',
    author: REGULAR_USERS[7],
    category: '한국 비자·체류',
    topic: 'f6-visa',
    votes: 52,
    views: 1156,
    answerCount: 8,
    createdAt: new Date(now - 12 * DAY).toISOString(),
    tags: ['F-6', '결혼이민', '국제결혼']
  },
  {
    id: 'q7',
    type: 'question',
    title: '외국인등록증 분실했을 때 재발급 방법',
    content: '외국인등록증을 잃어버렸습니다. 재발급 받으려면 어디로 가야 하고 어떤 서류가 필요한가요? 급합니다.',
    author: REGULAR_USERS[8],
    category: '한국 생활 정착',
    topic: 'adaptation-tips',
    votes: 18,
    views: 234,
    answerCount: 3,
    createdAt: new Date(now - 1 * DAY).toISOString(),
    tags: ['외국인등록증', '분실', '재발급']
  },
  {
    id: 'q8',
    type: 'question',
    title: 'D-2 유학 비자 연장 시 필요한 서류',
    content: '대학 3학년인데 D-2 비자를 연장해야 합니다. 학교에서 받아야 할 서류와 출입국에 제출할 서류 목록을 알려주세요.',
    author: REGULAR_USERS[8],
    category: '한국 비자·체류',
    topic: 'd2-visa',
    votes: 33,
    views: 567,
    answerCount: 5,
    createdAt: new Date(now - 15 * DAY).toISOString(),
    tags: ['D-2', '유학비자', '비자연장']
  },
  {
    id: 'q9',
    type: 'question',
    title: '체류기간 초과 벌금은 얼마인가요?',
    content: '비자가 만료됐는데 깜빡하고 2주가 지났습니다. 벌금이 얼마나 나오나요? 출국 금지될까요?',
    author: REGULAR_USERS[9],
    category: '외국인 근로자 권리',
    topic: 'workers-rights',
    votes: 67,
    views: 1890,
    answerCount: 11,
    createdAt: new Date(now - 20 * DAY).toISOString(),
    tags: ['체류기간초과', '벌금', '오버스테이']
  },
  {
    id: 'q10',
    type: 'question',
    title: '건강보험 서류 온라인 발급 방법',
    content: '비자 연장하려고 하는데 건강보험 가입확인서가 필요합니다. 온라인으로 발급받을 수 있나요? 어떻게 하는지 알려주세요.',
    author: REGULAR_USERS[3],
    category: '한국 의료 이용',
    topic: 'health-insurance',
    votes: 41,
    views: 778,
    answerCount: 6,
    createdAt: new Date(now - 8 * DAY).toISOString(),
    tags: ['건강보험', '서류발급', '비자연장']
  },

  // === 한국 직장생활 (구 한국 취업) ===
  {
    id: 'q11',
    type: 'question',
    title: '공장 면접 때 어떤 질문을 하나요?',
    content: '다음 주에 자동차 부품 공장 면접이 있습니다. 어떤 질문들을 주로 하는지 알려주세요. 어떻게 준비하면 좋을까요?',
    author: REGULAR_USERS[9],
    category: '한국 직장생활',
    topic: 'job-search',
    votes: 35,
    views: 623,
    answerCount: 7,
    createdAt: new Date(now - 4 * DAY).toISOString(),
    tags: ['면접', '공장', '취업준비']
  },
  {
    id: 'q12',
    type: 'question',
    title: '급여 협상은 어떻게 하나요?',
    content: '이직을 하려고 하는데 새 회사에서 급여를 얼마 달라고 해야 할지 모르겠습니다. 협상 방법을 알려주세요.',
    author: REGULAR_USERS[10],
    category: '한국 직장생활',
    topic: 'salary-benefits',
    votes: 62,
    views: 1445,
    answerCount: 10,
    createdAt: new Date(now - 9 * DAY).toISOString(),
    tags: ['급여협상', '이직', '연봉']
  },
  {
    id: 'q13',
    type: 'question',
    title: '근로계약서에 꼭 확인해야 할 내용',
    content: '새 회사와 계약하려고 합니다. 근로계약서에서 꼭 확인해야 할 부분이 무엇인가요? 나중에 문제 생기지 않으려면?',
    author: REGULAR_USERS[1],
    category: '한국 직장생활',
    topic: 'employment-contract',
    votes: 48,
    views: 956,
    answerCount: 8,
    createdAt: new Date(now - 11 * DAY).toISOString(),
    tags: ['근로계약서', '계약', '노동조건']
  },
  {
    id: 'q14',
    type: 'question',
    title: '이직할 때 필요한 절차가 뭔가요?',
    content: 'E-9 비자로 일하는데 다른 공장으로 이직하고 싶습니다. 어떤 절차를 밟아야 하나요? 회사 동의가 필요한가요?',
    author: REGULAR_USERS[10],
    category: '한국 직장생활',
    topic: 'employment-contract',
    votes: 73,
    views: 1678,
    answerCount: 12,
    createdAt: new Date(now - 13 * DAY).toISOString(),
    tags: ['이직', 'E-9', '사업장변경']
  },
  {
    id: 'q15',
    type: 'question',
    title: '야간근무 수당은 얼마나 받아야 하나요?',
    content: '공장에서 야간 근무를 하는데 수당을 제대로 받고 있는지 모르겠습니다. 법적으로 야간수당은 얼마인가요?',
    author: REGULAR_USERS[4],
    category: '외국인 근로자 권리',
    topic: 'salary-benefits',
    votes: 55,
    views: 1123,
    answerCount: 9,
    createdAt: new Date(now - 16 * DAY).toISOString(),
    tags: ['야간수당', '급여', '근로기준법']
  },
  {
    id: 'q16',
    type: 'question',
    title: '한국 직장에서 회식 문화는 어떤가요?',
    content: '다음 주에 첫 회식이 있습니다. 한국 회식 문화가 궁금합니다. 어떻게 행동해야 실수하지 않을까요?',
    author: REGULAR_USERS[6],
    category: '한국 직장생활',
    topic: 'workplace-culture',
    votes: 29,
    views: 445,
    answerCount: 6,
    createdAt: new Date(now - 6 * DAY).toISOString(),
    tags: ['회식', '직장문화', '매너']
  },
  {
    id: 'q17',
    type: 'question',
    title: '연차휴가는 언제부터 사용할 수 있나요?',
    content: '입사한 지 6개월 됐는데 연차휴가를 쓸 수 있나요? 며칠이나 쓸 수 있는지 알려주세요.',
    author: REGULAR_USERS[5],
    category: '한국 직장생활',
    topic: 'workplace-culture',
    votes: 42,
    views: 834,
    answerCount: 7,
    createdAt: new Date(now - 18 * DAY).toISOString(),
    tags: ['연차', '휴가', '근로기준법']
  },
  {
    id: 'q18',
    type: 'question',
    title: '통역사로 일하려면 어떤 자격증이 필요한가요?',
    content: '한국어를 잘해서 통역사로 일하고 싶습니다. 어떤 자격증을 따야 하고 어디서 일할 수 있나요?',
    author: REGULAR_USERS[8],
    category: '한국 직장생활',
    topic: 'job-search',
    votes: 51,
    views: 1089,
    answerCount: 8,
    createdAt: new Date(now - 21 * DAY).toISOString(),
    tags: ['통역사', '자격증', '직업']
  },
  {
    id: 'q19',
    type: 'question',
    title: '건설 현장 일자리 구하는 방법',
    content: '제조업에서 건설업으로 바꾸고 싶습니다. 건설 현장 일자리는 어디서 구하나요? E-9 비자로 가능한가요?',
    author: REGULAR_USERS[2],
    category: '한국 직장생활',
    topic: 'job-search',
    votes: 38,
    views: 667,
    answerCount: 5,
    createdAt: new Date(now - 14 * DAY).toISOString(),
    tags: ['건설업', '구직', 'E-9']
  },
  {
    id: 'q20',
    type: 'question',
    title: '주말 근무 수당 계산 방법',
    content: '토요일 일요일에 일하는데 주말 수당을 얼마나 받아야 하나요? 평일과 다른가요?',
    author: REGULAR_USERS[3],
    category: '외국인 근로자 권리',
    topic: 'salary-benefits',
    votes: 46,
    views: 923,
    answerCount: 7,
    createdAt: new Date(now - 22 * DAY).toISOString(),
    tags: ['주말수당', '휴일근로', '급여']
  },

  // === 한국 생활 → 다양한 카테고리로 분산 ===
  {
    id: 'q21',
    type: 'question',
    title: '서울에서 저렴한 베트남 식료품 가게 추천',
    content: '안산에서 서울로 이사를 왔는데 베트남 식재료를 구하기가 어렵네요. 서울 지역에서 저렴하고 품질 좋은 베트남 식료품을 파는 곳이 있을까요?',
    author: REGULAR_USERS[1],
    category: '베트남 음식·물품',
    topic: 'viet-grocery',
    votes: 18,
    views: 334,
    answerCount: 8,
    createdAt: new Date(now - 5 * HOUR).toISOString(),
    tags: ['베트남식품', '서울', '쇼핑']
  },
  {
    id: 'q22',
    type: 'question',
    title: '월세 계약할 때 주의사항',
    content: '처음으로 혼자 방을 구하려고 합니다. 월세 계약할 때 꼭 확인해야 할 것들이 무엇인가요? 사기 당하지 않으려면?',
    author: REGULAR_USERS[6],
    category: '한국에서 집 구하기',
    topic: 'rent',
    votes: 64,
    views: 1567,
    answerCount: 11,
    createdAt: new Date(now - 17 * DAY).toISOString(),
    tags: ['월세', '부동산', '주거']
  },
  {
    id: 'q23',
    type: 'question',
    title: '한국 은행 계좌 개설 방법',
    content: '은행 계좌를 만들고 싶은데 어떤 서류가 필요한가요? 외국인등록증만 있으면 되나요?',
    author: REGULAR_USERS[5],
    category: '베트남 송금·금융',
    topic: 'bank-account',
    votes: 39,
    views: 756,
    answerCount: 6,
    createdAt: new Date(now - 19 * DAY).toISOString(),
    tags: ['은행', '계좌개설', '금융']
  },
  {
    id: 'q24',
    type: 'question',
    title: '휴대폰 개통할 때 비용이 얼마나 드나요?',
    content: '한국에서 휴대폰을 개통하려고 합니다. 월 요금이 얼마나 나오고 어떤 통신사가 좋은가요?',
    author: REGULAR_USERS[7],
    category: '한국 생활 정착',
    topic: 'telecom',
    votes: 32,
    views: 589,
    answerCount: 5,
    createdAt: new Date(now - 23 * DAY).toISOString(),
    tags: ['휴대폰', '통신', '요금제']
  },
  {
    id: 'q25',
    type: 'question',
    title: '교통카드는 어디서 충전하나요?',
    content: 'T-money 카드를 샀는데 어디서 충전할 수 있나요? 편의점에서도 되나요?',
    author: REGULAR_USERS[6],
    category: '한국 생활 정착',
    topic: 'transportation',
    votes: 15,
    views: 223,
    answerCount: 4,
    createdAt: new Date(now - 3 * DAY).toISOString(),
    tags: ['교통카드', 'T-money', '대중교통']
  },
  {
    id: 'q26',
    type: 'question',
    title: '한국에서 운전면허 따는 방법',
    content: '베트남 운전면허증이 있는데 한국 면허로 바꾸려면 어떻게 해야 하나요? 시험을 다시 봐야 하나요?',
    author: REGULAR_USERS[9],
    category: '한국 생활 정착',
    topic: 'adaptation-tips',
    votes: 57,
    views: 1245,
    answerCount: 9,
    createdAt: new Date(now - 25 * DAY).toISOString(),
    tags: ['운전면허', '면허전환', '교통']
  },
  {
    id: 'q27',
    type: 'question',
    title: '병원 갈 때 건강보험 사용 방법',
    content: '감기에 걸렸는데 병원에 처음 가봅니다. 건강보험을 어떻게 사용하나요? 비용은 얼마나 드나요?',
    author: REGULAR_USERS[8],
    category: '한국 의료 이용',
    topic: 'medical-care',
    votes: 28,
    views: 467,
    answerCount: 5,
    createdAt: new Date(now - 7 * DAY).toISOString(),
    tags: ['병원', '건강보험', '의료']
  },
  {
    id: 'q28',
    type: 'question',
    title: '택배 보내는 방법과 비용',
    content: '베트남에 택배를 보내고 싶습니다. 어떤 업체를 이용하면 좋고 비용은 얼마나 드나요?',
    author: REGULAR_USERS[2],
    category: '베트남 물품 배송',
    topic: 'international-shipping',
    votes: 34,
    views: 612,
    answerCount: 6,
    createdAt: new Date(now - 26 * DAY).toISOString(),
    tags: ['택배', '국제배송', '배송']
  },
  {
    id: 'q29',
    type: 'question',
    title: '한국 문화센터 프로그램 신청 방법',
    content: '무료로 한국어를 배울 수 있는 문화센터가 있다고 들었습니다. 어디에 있고 어떻게 신청하나요?',
    author: REGULAR_USERS[8],
    category: '한국 문화 탐방',
    topic: 'cultural-activities',
    votes: 41,
    views: 823,
    answerCount: 7,
    createdAt: new Date(now - 28 * DAY).toISOString(),
    tags: ['문화센터', '한국어', '무료강좌']
  },
  {
    id: 'q30',
    type: 'question',
    title: '쿠팡과 네이버 쇼핑 중 어느 게 좋나요?',
    content: '온라인 쇼핑을 처음 해보려고 합니다. 쿠팡과 네이버 쇼핑 중 어느 게 더 좋은가요? 배송이 빠른 곳은요?',
    author: REGULAR_USERS[7],
    category: '한국 생활 정착',
    topic: 'adaptation-tips',
    votes: 22,
    views: 389,
    answerCount: 4,
    createdAt: new Date(now - 4 * DAY).toISOString(),
    tags: ['온라인쇼핑', '쿠팡', '배송']
  },

  // === 한국 교육·언어 → 언어/육아 분리 ===
  {
    id: 'q31',
    type: 'question',
    title: 'TOPIK 2급 준비 어떻게 하셨나요?',
    content: 'TOPIK 2급을 준비하고 있는데 어떤 교재와 방법으로 공부하는 것이 효과적일까요? 실제 합격하신 분들의 경험담을 듣고 싶습니다.',
    author: REGULAR_USERS[2],
    category: '한국어 배우기',
    topic: 'topik',
    votes: 89,
    views: 2134,
    answerCount: 15,
    createdAt: new Date(now - 1 * DAY).toISOString(),
    tags: ['TOPIK', '한국어', '시험']
  },
  {
    id: 'q32',
    type: 'question',
    title: '한국 대학 입학 조건이 궁금합니다',
    content: '한국 대학교에 진학하고 싶습니다. TOPIK 몇 급이 필요하고 어떤 서류를 준비해야 하나요?',
    author: REGULAR_USERS[8],
    category: '다문화 가정 육아',
    topic: 'school-admission',
    votes: 67,
    views: 1678,
    answerCount: 10,
    createdAt: new Date(now - 24 * DAY).toISOString(),
    tags: ['대학입학', 'D-2', 'TOPIK']
  },
  {
    id: 'q33',
    type: 'question',
    title: '무료 한국어 학원 추천해주세요',
    content: '한국어를 배우고 싶은데 학원비가 부담됩니다. 무료나 저렴한 한국어 학원이 있을까요?',
    author: REGULAR_USERS[6],
    category: '한국어 배우기',
    topic: 'free-course',
    votes: 52,
    views: 1056,
    answerCount: 8,
    createdAt: new Date(now - 27 * DAY).toISOString(),
    tags: ['한국어학원', '무료강좌', '한국어']
  },
  {
    id: 'q34',
    type: 'question',
    title: '대학원 진학 절차가 궁금합니다',
    content: '대학을 졸업하고 대학원에 진학하고 싶습니다. 어떤 준비를 해야 하고 장학금은 받을 수 있나요?',
    author: REGULAR_USERS[8],
    category: '다문화 가정 육아',
    topic: 'school-admission',
    votes: 44,
    views: 89,
    answerCount: 7,
    createdAt: new Date(now - 29 * DAY).toISOString(),
    tags: ['대학원', '석사', '장학금']
  },
  {
    id: 'q35',
    type: 'question',
    title: 'GKS 장학금 신청 방법',
    content: 'GKS(Global Korea Scholarship) 장학금에 대해 알고 싶습니다. 신청 자격과 절차를 알려주세요.',
    author: REGULAR_USERS[9],
    category: '한국어 배우기',
    topic: 'certification',
    votes: 78,
    views: 1890,
    answerCount: 12,
    createdAt: new Date(now - 30 * DAY).toISOString(),
    tags: ['GKS', '장학금', '정부초청']
  },

  // === 한국 법률·권리 → 외국인 근로자 권리 ===
  {
    id: 'q36',
    type: 'question',
    title: '산재보험 신청 절차와 필요 서류',
    content: '작업 중 손가락을 다쳤는데 산재보험을 신청하려고 합니다. 회사에서는 산재 처리를 꺼려하는 것 같은데 어떻게 해야 하나요?',
    author: REGULAR_USERS[3],
    category: '외국인 근로자 권리',
    topic: 'workers-rights',
    votes: 95,
    views: 2456,
    answerCount: 14,
    createdAt: new Date(now - 2 * DAY).toISOString(),
    tags: ['산재보험', '산업재해', '근로자권리']
  },
  {
    id: 'q37',
    type: 'question',
    title: '임금 체불 신고 방법',
    content: '회사가 2개월째 월급을 안 줍니다. 노동청에 신고하려고 하는데 어떻게 해야 하나요? 필요한 증거는요?',
    author: REGULAR_USERS[4],
    category: '외국인 근로자 권리',
    topic: 'wage-issues',
    votes: 108,
    views: 2789,
    answerCount: 16,
    createdAt: new Date(now - 1 * DAY).toISOString(),
    tags: ['임금체불', '노동청', '신고']
  },
  {
    id: 'q38',
    type: 'question',
    title: '퇴직금 계산 방법을 알려주세요',
    content: '5년 일하고 퇴사하려고 합니다. 퇴직금을 얼마나 받을 수 있나요? 계산 방법을 알려주세요.',
    author: REGULAR_USERS[5],
    category: '외국인 근로자 권리',
    topic: 'wage-issues',
    votes: 72,
    views: 1678,
    answerCount: 11,
    createdAt: new Date(now - 6 * DAY).toISOString(),
    tags: ['퇴직금', '퇴사', '계산']
  },
  {
    id: 'q39',
    type: 'question',
    title: '최저임금이 얼마인지 확인하는 방법',
    content: '제가 받는 급여가 최저임금보다 적은 것 같습니다. 2025년 최저임금이 얼마인가요?',
    author: REGULAR_USERS[1],
    category: '외국인 근로자 권리',
    topic: 'wage-issues',
    votes: 63,
    views: 1445,
    answerCount: 9,
    createdAt: new Date(now - 10 * DAY).toISOString(),
    tags: ['최저임금', '급여', '근로기준법']
  },
  {
    id: 'q40',
    type: 'question',
    title: '부당해고 당했을 때 대처 방법',
    content: '갑자기 해고 통보를 받았습니다. 정당한 이유 없이 해고당한 것 같은데 어떻게 해야 하나요?',
    author: REGULAR_USERS[10],
    category: '외국인 근로자 권리',
    topic: 'dismissal',
    votes: 86,
    views: 2034,
    answerCount: 13,
    createdAt: new Date(now - 12 * DAY).toISOString(),
    tags: ['부당해고', '노동권리', '구제신청']
  },

  // === 신규 질문 (q41-q50) - 카테고리 균등 분배를 위한 추가 질문 ===

  // 한국에서 집 구하기 (2개)
  {
    id: 'q41',
    type: 'question',
    title: '외국인도 전세 계약 가능한가요? 보증금 안전하게 지키는 방법',
    content: '월세 대신 전세로 계약하고 싶은데 외국인도 가능한가요? 보증금이 큰데 안전하게 보호받을 수 있는 방법이 있을까요? 전세 사기 예방법도 알고 싶습니다.',
    author: REGULAR_USERS[3],
    category: '한국에서 집 구하기',
    topic: 'deposit-return',
    votes: 72,
    views: 1456,
    answerCount: 10,
    createdAt: new Date(now - 8 * DAY).toISOString(),
    tags: ['전세', '보증금', '전세사기예방']
  },
  {
    id: 'q42',
    type: 'question',
    title: '원룸 vs 오피스텔 vs 고시원 - 외국인에게 맞는 주거 형태는?',
    content: '한국에서 처음 집을 구하려고 합니다. 원룸, 오피스텔, 고시원의 차이가 뭔가요? 외국인이 계약하기 쉬운 것은 어떤 건가요? 각각의 장단점을 알려주세요.',
    author: REGULAR_USERS[9],
    category: '한국에서 집 구하기',
    topic: 'rent',
    votes: 58,
    views: 1234,
    answerCount: 9,
    createdAt: new Date(now - 11 * DAY).toISOString(),
    tags: ['원룸', '오피스텔', '고시원', '주거형태']
  },

  // 베트남 송금·금융 (2개)
  {
    id: 'q43',
    type: 'question',
    title: '한국→베트남 송금, 가장 저렴하고 빠른 방법은?',
    content: '매달 가족에게 돈을 보내는데 은행 수수료가 너무 비쌉니다. 더 저렴하고 빠른 송금 방법이 있나요? 온라인 송금 서비스 추천해주세요.',
    author: REGULAR_USERS[2],
    category: '베트남 송금·금융',
    topic: 'remittance',
    votes: 95,
    views: 2345,
    answerCount: 14,
    createdAt: new Date(now - 3 * DAY).toISOString(),
    tags: ['송금', '수수료', '베트남송금', '환율']
  },
  {
    id: 'q44',
    type: 'question',
    title: '외국인 근로자 종합소득세 환급 받는 방법',
    content: '세금을 많이 냈는데 환급을 받을 수 있다고 들었습니다. 종합소득세 신고는 어떻게 하나요? 환급받으려면 어떤 서류가 필요한가요?',
    author: REGULAR_USERS[4],
    category: '베트남 송금·금융',
    topic: 'tax-refund',
    votes: 81,
    views: 1890,
    answerCount: 11,
    createdAt: new Date(now - 9 * DAY).toISOString(),
    tags: ['종합소득세', '세금환급', '연말정산']
  },

  // 한국 의료 이용 (1개)
  {
    id: 'q45',
    type: 'question',
    title: '응급실 이용 시 비용은 얼마나 나올까요?',
    content: '밤에 갑자기 아파서 응급실에 가야 할 것 같은데 비용이 걱정됩니다. 응급실 진료비는 얼마나 나오나요? 건강보험 적용되나요? 외국인등록증만 가지고 가면 되나요?',
    author: REGULAR_USERS[7],
    category: '한국 의료 이용',
    topic: 'medical-care',
    votes: 67,
    views: 1567,
    answerCount: 8,
    createdAt: new Date(now - 5 * DAY).toISOString(),
    tags: ['응급실', '응급진료', '의료비']
  },

  // 베트남 음식·물품 (2개)
  {
    id: 'q46',
    type: 'question',
    title: '안산/서울 베트남 식당 맛집 추천 (포, 반미, 분짜)',
    content: '베트남 음식이 그리워서 맛있는 베트남 식당을 찾고 있습니다. 안산이나 서울에서 포, 반미, 분짜 맛있게 하는 곳 추천해주세요. 베트남 본토 맛에 가까운 곳이면 좋겠습니다.',
    author: REGULAR_USERS[1],
    category: '베트남 음식·물품',
    topic: 'viet-food',
    votes: 43,
    views: 892,
    answerCount: 12,
    createdAt: new Date(now - 6 * DAY).toISOString(),
    tags: ['베트남식당', '포', '반미', '분짜', '맛집']
  },
  {
    id: 'q47',
    type: 'question',
    title: '한국에서 베트남 조미료 구하는 방법 (느억맘, 고수 등)',
    content: '집에서 베트남 요리를 해먹고 싶은데 느억맘, 고수, 라임잎 같은 재료를 어디서 구할 수 있나요? 온라인으로도 살 수 있나요?',
    author: REGULAR_USERS[6],
    category: '베트남 음식·물품',
    topic: 'viet-grocery',
    votes: 38,
    views: 678,
    answerCount: 7,
    createdAt: new Date(now - 13 * DAY).toISOString(),
    tags: ['베트남조미료', '느억맘', '고수', '베트남식재료']
  },

  // 한국 문화 탐방 (2개)
  {
    id: 'q48',
    type: 'question',
    title: '주말에 베트남 친구들과 갈 만한 서울 여행지',
    content: '이번 주말에 베트남 친구들과 서울 구경하려고 합니다. 경복궁, 명동, 홍대 외에 또 어디가 좋을까요? 사진 찍기 좋고 재미있는 곳 추천해주세요.',
    author: REGULAR_USERS[8],
    category: '한국 문화 탐방',
    topic: 'travel-tips',
    votes: 52,
    views: 1123,
    answerCount: 10,
    createdAt: new Date(now - 7 * DAY).toISOString(),
    tags: ['서울여행', '관광지', '주말나들이']
  },
  {
    id: 'q49',
    type: 'question',
    title: '한국 전통 문화 체험 프로그램 추천',
    content: '한복 입어보기, 김치 만들기 같은 한국 전통 문화 체험을 해보고 싶습니다. 외국인이 참여할 수 있는 무료나 저렴한 프로그램이 있나요?',
    author: REGULAR_USERS[10],
    category: '한국 문화 탐방',
    topic: 'cultural-activities',
    votes: 47,
    views: 967,
    answerCount: 8,
    createdAt: new Date(now - 14 * DAY).toISOString(),
    tags: ['전통문화', '한복', '김치', '문화체험']
  },

  // 한국에서 창업하기 (2개)
  {
    id: 'q50',
    type: 'question',
    title: '외국인도 한국에서 사업자 등록 가능한가요?',
    content: '작은 가게를 차리고 싶은데 외국인도 사업자 등록을 할 수 있나요? E-9 비자로는 안 되나요? 어떤 비자가 필요하고 절차는 어떻게 되나요?',
    author: REGULAR_USERS[5],
    category: '한국에서 창업하기',
    topic: 'business-registration',
    votes: 89,
    views: 2234,
    answerCount: 13,
    createdAt: new Date(now - 2 * DAY).toISOString(),
    tags: ['사업자등록', '창업', '외국인창업', '비자']
  },
]

// ============================================
// VERIFIED 답변 Mock 데이터 (12개)
// 70% 베트남인 전문가 (8개) + 30% 한국인 전문가 (4개)
// ============================================

export const MOCK_ANSWERS: Answer[] = [
  // === 베트남인 VERIFIED 전문가 답변 (8개) ===

  // q1: E-9 비자 연장 - ve1 (Nguyễn Văn Hùng - E-9 비자 연장 전문)
  {
    id: 'a1',
    questionId: 'q1',
    content: `안녕하세요! 저도 E-9 비자를 4번 연장한 경험이 있어서 도움이 될 것 같습니다.

**필요한 서류 (제가 직접 준비했던 것들):**
1. 비자 연장 신청서 (출입국에서 받을 수 있어요)
2. 여권 원본 + 사본
3. 외국인등록증
4. 건강보험 가입확인서 (인터넷으로 발급 가능)
5. 근로계약서 사본
6. 회사 사업자등록증 사본 (회사에 요청)
7. 수수료 6만원

**절차:**
1. 만료 4개월 전부터 신청 가능합니다 (저는 2개월 전에 했어요)
2. 가까운 출입국·외국인청에 가세요
3. 서류 제출하고 수수료 내면 끝!
4. 보통 2-3주 걸려요

**꿀팁:** 회사가 안 도와주면 직접 해도 됩니다. 저는 혼자 다 했어요. 베트남어 통역 서비스도 있으니까 걱정 마세요!`,
    author: VIETNAMESE_EXPERTS[0], // ve1
    isExpert: true,
    createdAt: new Date(now - 90 * 60 * 1000).toISOString(), // 1.5시간 후
    helpful: 87,
    commentCount: 5
  },

  // q2: F-5 영주권 신청 - ve2 (Trần Minh Đức - 영주권 신청 전문)
  {
    id: 'a2',
    questionId: 'q2',
    content: `F-5 영주권 받은 사람입니다! 제 경험 공유할게요.

**F-5 신청 조건 (2025년 기준):**
- E-9으로 **5년 이상** 체류 ✓ (님은 5년이니 OK)
- **TOPIK 4급** 이상 필요 (2급은 부족해요 😥)
- 소득 요건: 전년도 GNI 80% 이상
- 범죄·세금·보험료 체납 없어야 함

**님의 경우:**
TOPIK 2급이면 아직 부족합니다. 4급 따고 신청하세요!

**제 준비 과정:**
1. 1년간 TOPIK 공부 → 4급 취득
2. 급여명세서 1년치 준비
3. 건강보험·세금 납부증명서
4. 신청 후 3개월 만에 승인!

지금부터 TOPIK 준비하면 내년에 신청 가능합니다. 파이팅! 🇻🇳`,
    author: VIETNAMESE_EXPERTS[1], // ve2
    isExpert: true,
    createdAt: new Date(now - 2.5 * DAY).toISOString(),
    helpful: 124,
    commentCount: 8
  },

  // q3: E-9→E-7 전환 - ve3 (Lê Văn Toàn - E-9→E-7 전환 전문)
  {
    id: 'a3',
    questionId: 'q3',
    content: `저도 작년에 E-9에서 E-7로 전환했습니다! 가능합니다.

**E-7 전환 조건:**
1. **기술자격증** 필수 (용접, 기계가공 등)
2. 한국어 능력 (TOPIK 3급 이상 권장)
3. 전문인력 요건 충족
4. 회사의 E-7 채용 의지

**제가 한 절차:**
1. 공장에서 기능사 자격증 취득 (용접)
2. 회사에 E-7 전환 요청 → 동의 받음
3. 출입국에 체류자격변경 신청
4. 서류: 자격증, 경력증명서, 근로계약서
5. 약 1개월 후 E-7 승인!

**장점:**
- 급여가 올라요 (월 300만원→380만원)
- 이직이 더 자유로워요
- 영주권 조건도 빨리 충족

님도 자격증 있으면 충분히 가능합니다. 도전해보세요!`,
    author: VIETNAMESE_EXPERTS[2], // ve3
    isExpert: true,
    createdAt: new Date(now - 4.5 * DAY).toISOString(),
    helpful: 96,
    commentCount: 6
  },

  // q11: 공장 면접 - ve11 (Phạm Văn Cường - 근로계약 전문)
  {
    id: 'a4',
    questionId: 'q11',
    content: `공장 면접 20번 넘게 본 사람입니다 ㅋㅋ 도움이 될 거예요.

**자주 나오는 질문:**
1. "한국어 할 수 있어요?" → 간단한 대화 준비
2. "야간 근무 가능해요?" → 가능하다고 하세요
3. "언제부터 일할 수 있어요?" → 빨리 가능하다고
4. "이전 회사 왜 그만뒀어요?" → 긍정적으로 대답
5. "우리 회사 얼마나 오래 다닐 거예요?" → 3년 이상!

**준비 사항:**
- 작업복 깔끔하게 입기
- 10분 일찍 도착
- 이력서 여분 준비
- 자격증 있으면 챙기기
- 안전화 신고 가기

**꿀팁:**
- 성실해 보이는 게 제일 중요해요
- 웃으면서 대답하세요
- "열심히 배우겠습니다" 이 말 꼭 하세요!

자동차 부품 공장이면 급여 좋을 거예요. 파이팅!`,
    author: VIETNAMESE_EXPERTS[10], // ve11
    isExpert: true,
    createdAt: new Date(now - 3.5 * DAY).toISOString(),
    helpful: 72,
    commentCount: 4
  },

  // q14: 이직 절차 - ve13 (Trần Văn Khanh - 이직 전문)
  {
    id: 'a5',
    questionId: 'q14',
    content: `E-9으로 3번 이직한 경험 공유합니다!

**이직 절차 (중요!):**

**1단계: 회사 동의 받기**
- 현재 회사에 이직 의사 밝히기
- 사업장변경 동의서 받기 (필수!)
- 동의 안 해주면 고용센터에 신청

**2단계: 새 회사 구하기**
- 고용센터 가서 구인업체 목록 받기
- E-9 채용 가능한 회사 확인
- 면접 보고 채용 확정

**3단계: 서류 제출 (출입국)**
- 사업장변경 신청서
- 새 회사 근로계약서
- 현 회사 동의서
- 수수료 약 10만원

**4단계: 승인 대기**
- 보통 2-3주 걸려요
- 승인되면 새 회사 출근!

**주의사항:**
- 무단이직 절대 안 돼요 (불법체류됨)
- 1년에 3번까지만 이직 가능
- 회사 동의 없으면 고용센터 통해서 하세요

제가 실제로 이렇게 3번 했어요. 궁금한 거 더 물어보세요!`,
    author: VIETNAMESE_EXPERTS[12], // ve13
    isExpert: true,
    createdAt: new Date(now - 12.5 * DAY).toISOString(),
    helpful: 134,
    commentCount: 9
  },

  // q22: 월세 계약 - ve24 (Trần Văn Duy - 주거 전문)
  {
    id: 'a6',
    questionId: 'q22',
    content: `5번 이사한 사람이 알려드립니다! 사기 많으니 조심하세요.

**꼭 확인할 것:**

**1. 계약 전**
- 집주인 신분증 확인 (가짜 집주인 많아요!)
- 등기부등등본 확인 (구청에서 발급)
- 보증금 여부 확인
- 관리비 항목 확인 (수도세, 전기세 포함인지)

**2. 계약서 작성 시**
- 특약사항 꼼꼼히 읽기
- 입주일/퇴거일 명확히 적기
- 보증금 반환 날짜 적기
- 계약서 2부 작성 (1부는 꼭 보관!)

**3. 입주할 때**
- 사진으로 집 상태 기록 (벽, 바닥 등)
- 고장난 곳 있으면 사진+메시지로 전송
- 가스·수도·전기 검침기 사진 찍기

**사기 당한 경험:**
제 친구가 가짜 집주인한테 보증금 사기당했어요. 등기부등등본 꼭 확인하세요!

**베트남 친구 찾기:**
근처 베트남 커뮤니티에서 쉐어하우스 찾는 것도 좋아요. 더 안전해요.`,
    author: VIETNAMESE_EXPERTS[23], // ve24
    isExpert: true,
    createdAt: new Date(now - 16.5 * DAY).toISOString(),
    helpful: 108,
    commentCount: 7
  },

  // q31: TOPIK 준비 - ve31 (Trần Văn Tuấn - TOPIK 6급)
  {
    id: 'a7',
    questionId: 'q31',
    content: `TOPIK 2급→6급까지 올린 사람입니다. 제 방법 공유할게요!

**제가 한 공부 방법:**

**듣기 (Listening):**
- 한국 드라마 매일 1시간 (자막 있게)
- 유튜브 "TOPIK 듣기 연습" 채널
- 출퇴근할 때 듣기 파일 반복
- **효과:** 2개월 만에 40점→70점

**읽기 (Reading):**
- TOPIK 기출문제 10회분 풀기
- 모르는 단어 노트에 정리
- 매일 30분씩 한국어 뉴스 읽기
- **효과:** 문법 패턴 익숙해짐

**쓰기 (Writing):**
- 템플릿 5개 외우기 (53번, 54번)
- 매일 한국어로 일기 쓰기
- 한국인 친구한테 첨삭 받기
- **효과:** 실전에서 시간 절약

**교재 추천:**
1. "TOPIK 한국어능력시험 2" (고려대)
2. 기출문제집 (최근 3년)
3. 단어장 앱: "TOPIK 2급 필수단어"

**공부 기간:**
제가 4개월 매일 2시간씩 해서 합격했어요.

**무료 자료:**
- TOPIK 공식 홈페이지 (기출문제)
- 유튜브 "베이직 코리안" 채널
- 도서관 무료 한국어 강좌

포기하지 말고 꾸준히 하세요. 저도 처음엔 1급도 어려웠어요! 🇻🇳📚`,
    author: VIETNAMESE_EXPERTS[30], // ve31
    isExpert: true,
    createdAt: new Date(now - 18 * HOUR).toISOString(),
    helpful: 156,
    commentCount: 12
  },

  // q36: 산재보험 - ve36 (Phạm Văn Đức - 산재보험 전문)
  {
    id: 'a8',
    questionId: 'q36',
    content: `저도 작년에 손가락 다쳐서 산재 처리했습니다. 회사가 반대해도 할 수 있어요!

**산재보험 신청 절차:**

**1. 즉시 할 것:**
- 병원 가서 진단서 받기 (급해요!)
- 사고 당일 사진 찍기 (장소, 상처)
- 같이 일하던 동료 연락처 받기 (증인)

**2. 회사에 요청:**
- "산재 처리해주세요" 말하기
- 거부하면 문자로 보내기 (증거 남기기)
- 회사가 계속 거부하면 다음 단계로

**3. 직접 신청 (회사 거부 시):**
- 근로복지공단 가기
- "회사가 산재 처리 안 해줘요" 말하기
- 진단서, 사진, 증인 연락처 제출
- **회사 동의 없어도 신청 가능!**

**4. 필요 서류:**
- 요양급여 청구서 (공단에서 받음)
- 진단서 (병원)
- 사고경위서 (본인 작성)
- 목격자 진술서 (동료)

**제 경험:**
- 회사가 안 해준다고 해서 직접 공단 갔어요
- 2주 만에 승인됐어요
- 치료비 전액 + 휴업급여 받았어요

**중요:**
- 산재는 **외국인도 똑같이** 받을 수 있어요
- 회사가 불이익 주면 불법이에요
- 무료 노무사 상담: 1350 (고용노동부)

빨리 병원 가고 증거 모으세요. 회사 눈치 보지 마세요. 님의 권리예요! 💪`,
    author: VIETNAMESE_EXPERTS[35], // ve36
    isExpert: true,
    createdAt: new Date(now - 36 * HOUR).toISOString(),
    helpful: 178,
    commentCount: 11
  },

  // === 한국인 VERIFIED 전문가 답변 (4개) ===

  // q6: F-6 결혼이민 - ke1 (이민수 변호사 - 이민법 전문)
  {
    id: 'a9',
    questionId: 'q6',
    content: `이민법 전문 변호사입니다. F-6 비자 신청에 대해 상세히 안내드리겠습니다.

**F-6 결혼이민 비자 신청 절차**

**1단계: 베트남에서 준비할 서류**
- 혼인관계증명서 (아포스티유 공증 필요)
- 범죄경력증명서
- 건강검진서
- 가족관계증명서

**2단계: 한국에서 준비할 서류**
- 배우자(한국인) 신원보증서
- 혼인관계증명서
- 주민등록등본
- 소득증빙서류 (최근 3개월 급여명세서)
- 주거증빙서류 (전월세 계약서 또는 등기부등등본)

**3단계: 신청**
- 베트남 한국대사관에서 신청
- 또는 한국에서 초청장 발급 후 초청 방식 신청
- 심사 기간: 약 4-6주

**필수 조건:**
- 한국인 배우자의 안정적 소득 (최소 GNI 60% 이상)
- 적정한 주거 공간
- 진정한 혼인 의사 입증

**주의사항:**
- 위장결혼 방지를 위해 면접이 있을 수 있습니다
- 혼인신고는 한국과 베트남 양국에서 모두 해야 합니다
- 최근 서류 위조 적발 사례가 많으니 반드시 정식 절차를 거치시기 바랍니다

추가 문의사항이 있으시면 출입국·외국인청(1345) 또는 법무부 상담센터를 이용하시기 바랍니다.

📞 무료 법률상담: 대한법률구조공단 (국번없이 132)`,
    author: KOREAN_EXPERTS[0], // ke1
    isExpert: true,
    createdAt: new Date(now - 11.5 * DAY).toISOString(),
    helpful: 94,
    commentCount: 6
  },

  // q13: 근로계약서 - ke2 (김태희 노무사 - 노동법 전문)
  {
    id: 'a10',
    questionId: 'q13',
    content: `노무사입니다. 근로계약서 검토 시 반드시 확인해야 할 핵심 사항을 알려드립니다.

**근로계약서 필수 확인 항목 ✓**

**1. 근로조건 명시 (법적 필수사항)**
- 근로 시작일
- 근로 장소 및 업무 내용
- 근로시간 (1일 8시간, 주 40시간 원칙)
- 휴게시간 (4시간 이상 근무 시 30분 이상)
- 주휴일 (주 1회 유급 휴일)

**2. 임금 관련 (가장 중요!)**
- 기본급 명시 (2025년 최저시급: 10,030원)
- 상여금, 수당 지급 기준
- 임금 지급일 (매월 정해진 날짜)
- 연장·야간·휴일근무 수당 (1.5배 가산)
- 주휴수당 포함 여부 확인

**3. 퇴직금**
- 1년 이상 근무 시 퇴직금 지급 의무
- 계속근로기간 1년에 대해 30일분 이상 평균임금

**4. 계약기간**
- 정규직 / 계약직 명확히 표기
- 계약직인 경우 계약 갱신 조건 확인

**5. 사회보험 가입 확인**
- 국민연금 (의무가입)
- 건강보험 (의무가입)
- 고용보험 (실업급여)
- 산재보험 (업무상 재해)

**위험 신호 (이런 계약서는 주의!)**
❌ 구두 약속만 있고 서면 계약서가 없음
❌ 최저임금 미만 급여
❌ 포괄임금제 (초과근무수당 미지급 편법)
❌ "수습기간 중 최저임금 90%" (불법!)
❌ 일방적 불리한 특약 (벌금, 손해배상 등)

**계약 전 체크리스트:**
□ 계약서 2부 작성 (본인 1부 보관)
□ 모든 항목 한국어+베트남어 이해
□ 불명확한 부분 질문하고 명확히 기재
□ 회사 직인 및 대표자 서명 확인

**계약 후 보관서류:**
□ 근로계약서 원본
□ 급여명세서 매월 보관
□ 근태기록 (출퇴근 시간)

궁금하신 점은 고용노동부 상담센터(국번없이 1350)로 문의하시면 무료로 상담받으실 수 있습니다.

⚖️ 모든 외국인 근로자는 내국인과 동등한 노동법 보호를 받습니다.`,
    author: KOREAN_EXPERTS[1], // ke2
    isExpert: true,
    createdAt: new Date(now - 10.5 * DAY).toISOString(),
    helpful: 142,
    commentCount: 8
  },

  // q37: 임금체불 - ke2 (김태희 노무사 - 노동법 전문)
  {
    id: 'a11',
    questionId: 'q37',
    content: `노무사입니다. 임금체불은 형사처벌 대상입니다. 즉시 조치하셔야 합니다.

**긴급 행동 지침**

**1단계: 증거 확보 (제일 중요!)**
- 근로계약서 사본
- 출퇴근 기록 (출입카드, CCTV 기록)
- 급여명세서 (있다면)
- 업무 지시 문자메시지, 이메일
- 같이 일하는 동료 연락처 (증인)
- 통장 입금 기록

**2단계: 회사에 청구**
- 내용증명 발송 (우체국)
- "○월○일까지 임금 ○○○만원 지급 요청"
- 증거로 남기는 것이 목적

**3단계: 노동청 진정 (회사가 지급 거부 시)**
- 관할 고용노동지청 방문
- 임금체불 진정서 작성 (무료)
- 준비물: 증거자료 전부
- **외국인도 100% 동일하게 처리됩니다**

**4단계: 처리 절차**
- 노동청이 회사 조사
- 시정명령 발부
- 회사가 불응 시 → 검찰 고발

**5단계: 민사소송 (노동청 처리 불만족 시)**
- 체불액 1,000만원 이하: 소액심판 (인지대 저렴)
- 노무사 무료 상담 이용

**추가 권리:**
- 체불 기간 이자 청구 가능 (연 20%)
- 지연 손해금 청구 가능

**특별 지원제도:**
- 임금체불 생계비 대부 (최대 1,000만원)
- 신청: 근로복지공단
- 조건: 체불액 증명서 제출

**긴급 연락처:**
☎ 고용노동부 상담센터: 1350 (베트남어 통역 가능)
☎ 외국인력상담센터: 1644-0644
☎ 대한법률구조공단: 132 (무료 법률지원)

**중요 안내:**
✓ 체불임금 청구권 소멸시효: 3년 (빨리 하세요!)
✓ 임금체불은 형사처벌 대상 (3년 이하 징역 or 3천만원 이하 벌금)
✓ 외국인이라는 이유로 포기하지 마세요. 법이 보호합니다.

2개월 체불이면 상당히 심각한 상황입니다. 내일 당장 노동청에 가시기 바랍니다.`,
    author: KOREAN_EXPERTS[1], // ke2
    isExpert: true,
    createdAt: new Date(now - 12 * HOUR).toISOString(),
    helpful: 189,
    commentCount: 10
  },

  // q38: 퇴직금 계산 - ke2 (김태희 노무사 - 노동법 전문)
  {
    id: 'a12',
    questionId: 'q38',
    content: `노무사입니다. 5년 근속 퇴직금 계산 방법을 상세히 알려드립니다.

**퇴직금 계산 공식**

\`\`\`
퇴직금 = (1일 평균임금 × 30일) × (재직일수 / 365)
\`\`\`

**1일 평균임금 계산:**
- 퇴직 전 3개월 급여 총액 ÷ 3개월 일수(92일)
- 포함: 기본급 + 각종 수당 + 상여금
- 제외: 연차수당 (별도 지급)

**예시 계산 (5년 근속자)**
- 월 급여: 300만원
- 3개월 급여 총액: 900만원
- 1일 평균임금: 900만원 ÷ 92일 = 97,826원
- 재직일수: 1,825일 (5년)
- 퇴직금: 97,826원 × 30일 × (1,825 ÷ 365)
- **최종 퇴직금: 약 1,467만원**

**추가로 받을 수 있는 것:**
1. **미사용 연차수당**
   - 1년에 15일 발생
   - 5년이면 최대 75일
   - 미사용분 × 1일 통상임금

2. **미지급 수당**
   - 연장근무수당
   - 야간근무수당
   - 휴일근무수당

3. **퇴직 전 잔여 급여**

**퇴직금 지급 시기:**
- 퇴사일로부터 **14일 이내** 지급 의무
- 지연 시 연 20% 지연이자 청구 가능

**확인 사항:**
✓ 주 15시간 이상 근무했는가? (필수)
✓ 1년 이상 계속 근로했는가? (필수)
✓ 4대 보험 가입 여부 확인
✓ 퇴직금 중간정산 받은 적 있는가?

**회사가 안 주려고 할 때:**
1. 퇴직금 청구서 내용증명 발송
2. 7일 내 미지급 시 → 노동청 진정
3. 임금채권보장법에 따라 정부가 대신 지급 (일부)

**계산 도구:**
- 고용노동부 홈페이지 "퇴직금 계산기" 이용
- 노동청 방문 상담 (무료)

**상담 연락처:**
☎ 고용노동부 상담센터: 1350
☎ 근로복지공단 퇴직연금 상담: 1588-0075

퇴사 전에 정확한 금액을 계산해서 회사에 청구하시기 바랍니다.
증거자료(급여명세서, 근로계약서)를 꼭 챙기세요!`,
    author: KOREAN_EXPERTS[1], // ke2
    isExpert: true,
    createdAt: new Date(now - 5.5 * DAY).toISOString(),
    helpful: 167,
    commentCount: 9
  },
]

// Helper 함수
export function getAnswersByQuestionId(questionId: string): Answer[] {
  return MOCK_ANSWERS.filter(a => a.questionId === questionId)
}

// ============================================
// 정보글 Mock 데이터 (10개)
// VERIFIED 전문가 전용 (70% 베트남인 + 30% 한국인)
// ============================================

export const MOCK_POSTS: Post[] = [
  // === 한국 비자·체류 (3개) ===

  // ve1 - E-9 비자 완벽 가이드
  {
    id: 'p1',
    type: 'post',
    title: 'E-9 비자 연장 완벽 가이드 (2025년 최신판)',
    content: `안녕하세요, 7년차 베트남 근로자 Nguyễn Văn Hùng입니다.

E-9 비자를 4번 연장한 경험을 바탕으로 완벽한 가이드를 만들었습니다.

## 📅 신청 시기
- ⏰ **만료 4개월 전**부터 신청 가능
- ✅ **권장**: 만료 2개월 전 (여유있게)
- ⚠️ **주의**: 만료일 지나면 불법체류!

## 📋 필요 서류 체크리스트
□ 비자 연장 신청서 (출입국에서 무료로 받음)
□ 여권 원본 + 사본
□ 외국인등록증
□ 건강보험 가입확인서 (4대보험 포털에서 발급)
□ 근로계약서 사본
□ 회사 사업자등록증 사본
□ 수수료 60,000원 (현금 준비)
□ 사진 1장 (3.5cm x 4.5cm, 흰색 배경)

## 🏢 신청 방법

**방법 1: 회사가 도와주는 경우**
- 회사 담당자가 서류 준비
- 함께 출입국 방문 (또는 대리 신청)
- 제일 쉬운 방법!

**방법 2: 혼자 하는 경우 (제 경험)**
1. 위 서류 모두 준비
2. 가까운 출입국·외국인청 방문
3. 번호표 뽑기 (비자 연장)
4. 통역 서비스 요청 (무료!)
5. 서류 제출 + 수수료 납부
6. 영수증 받기 (중요!)

## ⏳ 처리 기간
- 보통 **2-3주** 소요
- 바쁜 시기(12월-1월)는 4주까지 가능
- 문자로 알림 옴 (준비 완료 시)

## 📱 진행상황 확인
- 출입국청 홈페이지 → "민원신청 접수/처리 조회"
- 영수증 번호로 조회 가능

## ⚠️ 자주하는 실수

❌ **실수 1**: 건강보험 체납
→ 연장 거절! 꼭 납부하세요

❌ **실수 2**: 회사 사업자등록증 없이 감
→ 다시 와야 함. 미리 준비!

❌ **실수 3**: 수수료 카드 결제 시도
→ 현금만 가능!

❌ **실수 4**: 만료일 지나서 신청
→ 벌금 + 출국명령 위험

## 💡 꿀팁

**팁 1**: 오전 9시-10시에 가면 사람 적어요

**팁 2**: 통역 서비스 미리 신청
- 전화: 1345 (3번 선택)
- 베트남어 통역 가능

**팁 3**: 회사가 안 도와줘도 혼자 가능
- 저는 4번 다 혼자 했어요!
- 출입국 직원들 친절해요

**팁 4**: 서류 사본 여분 준비
- 혹시 모를 상황 대비

## 📞 도움받을 곳

🏢 **출입국·외국인청**
- 전화: 1345
- 베트남어 상담 가능

🏢 **외국인력지원센터**
- 전화: 1644-0644
- 무료 서류 작성 도움

## ✅ 연장 승인 후

1. 문자 확인 (접수번호로 옴)
2. 출입국청 방문
3. 외국인등록증 수령
4. 만료일 확인!

## 마무리

E-9 비자 연장은 어렵지 않습니다!
서류만 잘 챙기면 문제없어요.

궁금한 점 있으면 댓글 남겨주세요. 7년 경험 공유할게요! 🇻🇳`,
    author: VIETNAMESE_EXPERTS[0], // ve1
    category: '한국 비자·체류',
    votes: 245,
    views: 5678,
    commentCount: 34,
    createdAt: new Date(now - 45 * DAY).toISOString(),
    tags: ['E-9', '비자연장', '가이드', '체류']
  },

  // ve2 - 영주권 준비 로드맵
  {
    id: 'p2',
    type: 'post',
    title: '🏡 F-5 영주권 받는 방법 (실제 경험 기반 로드맵)',
    content: `F-5 영주권을 받은 Trần Minh Đức입니다.

많은 분들이 물어봐서 제 경험을 정리했습니다.

## 🎯 영주권이 뭔가요?

**F-5 영주권 = 한국에 영구 거주 가능**
- 체류기간 제한 없음
- 취업 자유 (어디든 가능)
- E-9처럼 회사 동의 필요 없음
- 사회보장 혜택 동일

## ✅ 신청 자격 (2025년 기준)

**기본 요건:**
1. **5년 이상 한국 거주** (E-9, E-7 등)
2. **만 20세 이상**
3. **생계 유지 능력** (GNI 80% 이상)
4. **한국어 능력** (TOPIK 4급 이상)
5. **품행** (범죄·세금·체납 없어야 함)

## 📊 점수제 시스템

총 120점 중 **80점 이상** 필요!

**연령 (최대 30점)**
- 20-29세: 30점
- 30-39세: 25점
- 40-49세: 20점
- 50세 이상: 15점

**학력 (최대 25점)**
- 박사: 25점
- 석사: 20점
- 학사: 15점
- 고졸: 10점

**소득 (최대 32점)**
- GNI 200% 이상: 32점
- GNI 150% 이상: 24점
- GNI 100% 이상: 16점
- GNI 80% 이상: 8점

**한국어 (최대 30점)**
- TOPIK 6급: 30점
- TOPIK 5급: 24점
- TOPIK 4급: 18점
- TOPIK 3급: 12점

**기타 (최대 3점)**
- 기술자격증: 3점
- 봉사활동: 2점

## 📅 제 준비 과정 (실제)

**Year 1-4 (E-9 근무)**
- 매달 급여 모으기
- 틈틈이 한국어 공부

**Year 5 (본격 준비)**
- 2024년 3월: TOPIK 4급 목표 설정
- 2024년 7월: TOPIK 시험 응시 → 4급 합격!
- 2024년 9월: 서류 준비 시작

**Year 6 (신청)**
- 2025년 1월: F-5 신청
- 2025년 4월: 승인! 🎉

## 📋 필요 서류

□ F-5 체류자격 신청서
□ 여권 및 외국인등록증
□ 수수료 13만원
□ TOPIK 성적표
□ 소득 증빙 (급여명세서 1년치)
□ 건강보험·국민연금 납부증명
□ 세금 납부증명
□ 범죄경력증명서 (베트남 발급)
□ 학력증명서
□ 기술자격증 (있는 경우)

## 💰 비용 (제 실제 비용)

- 수수료: 130,000원
- TOPIK 응시료: 55,000원
- 서류 발급: 약 50,000원
- **총 235,000원**

## 🎓 TOPIK 공부 방법 (4급까지)

**제가 한 방법:**
1. 매일 1시간 유튜브 "베이직 코리안"
2. 출퇴근할 때 듣기 연습
3. 기출문제 5회분
4. **기간: 4개월**

**추천 교재:**
- "TOPIK 한국어능력시험 2" (고려대)
- 기출문제집 (온라인 무료)

## ⏳ 처리 기간

- 신청 후 **3-4개월** 소요
- 제 경우: 정확히 3개월 2주

## ⚠️ 주의사항

**거절 사유 TOP 3:**
1. TOPIK 점수 부족 (4급 미만)
2. 소득 요건 미달
3. 세금·보험료 체납

**꼭 확인하세요:**
- 4대 보험 체납 없어야 함
- 최근 5년 범죄 기록 없어야 함
- 소득 증빙 정확하게

## 💡 꿀팁

**팁 1: 점수 계산기 활용**
- 출입국 홈페이지에 있어요
- 80점 넘는지 미리 확인!

**팁 2: TOPIK은 4급만 따도 OK**
- 5급, 6급은 보너스
- 4급이면 충분합니다

**팁 3: 소득이 부족하면?**
- 이직해서 급여 올리기
- E-7로 전환 고려

**팁 4: 회사 협조 필요 없음!**
- 혼자 준비 가능
- 퇴사 후에도 신청 가능

## 📞 도움받을 곳

🏢 출입국·외국인청: 1345
🏢 무료 법률상담: 132

## ✅ 영주권 받은 후 변화

**좋은 점:**
- 이직 완전 자유!
- 체류 걱정 없음
- 은행 대출 유리
- 심리적 안정감

**주의할 점:**
- 2년마다 외국인등록증 갱신
- 한국 떠나면 2년 내 입국해야 함

## 마무리

영주권은 꿈이 아니에요!
저도 공장 근로자에서 F-5 받았습니다.

포기하지 말고 준비하세요! 💪🇻🇳`,
    author: VIETNAMESE_EXPERTS[1], // ve2
    category: '한국 비자·체류',
    votes: 412,
    views: 8934,
    commentCount: 56,
    createdAt: new Date(now - 60 * DAY).toISOString(),
    tags: ['F-5', '영주권', '로드맵', 'TOPIK']
  },

  // ke1 - 비자 종류 정리 (한국인 변호사)
  {
    id: 'p3',
    type: 'post',
    title: '베트남인을 위한 한국 비자 종류 완벽 정리 (변호사 작성)',
    content: `이민법 전문 변호사 이민수입니다.

베트남 분들이 자주 문의하는 비자 종류를 정리했습니다.

## 🎯 취업 비자

### E-9 비자 (비전문취업)
**대상**: 제조업, 건설업, 농축산업, 어업
**기간**: 3년 (최대 9년 8개월)
**특징**:
- 고용허가제로 입국
- 이직 제한적 (1년 3회)
- 가족 동반 불가

### E-7 비자 (특정활동)
**대상**: 전문인력 (통역, 기술직 등)
**기간**: 초기 2년 (갱신 가능)
**특징**:
- E-9보다 급여 높음
- 이직 자유로움
- 영주권 신청 유리

### E-10 비자 (선원취업)
**대상**: 어선 선원
**기간**: 1년 (갱신 가능)

## 🎓 유학 비자

### D-2 비자 (유학)
**대상**: 대학(원) 재학생
**기간**: 학업 기간
**특징**:
- 주 20시간 아르바이트 가능
- 졸업 후 구직비자 전환 가능

### D-4 비자 (어학연수)
**대상**: 어학당 학생
**기간**: 6개월-2년
**특징**:
- 취업 불가
- D-2 전환 가능

## 👨‍👩‍👧 거주 비자

### F-1 비자 (방문동거)
**대상**: 가족 초청
**기간**: 1년 (갱신 가능)
**특징**:
- 취업 제한적
- E-9 근로자 부모 초청 가능

### F-2 비자 (거주)
**대상**: 장기체류자, 투자자
**기간**: 3년
**특징**:
- 취업 자유
- 영주권 신청 가능

### F-5 비자 (영주)
**대상**: 5년 이상 거주자
**기간**: 무기한
**특징**:
- 체류 제한 없음
- 취업 완전 자유

### F-6 비자 (결혼이민)
**대상**: 한국인 배우자
**기간**: 초기 1년 (갱신)
**특징**:
- 2년 후 F-5 신청 가능
- 이혼 시 조건부 유지

## 🔄 비자 전환 로드맵

### 일반 근로자 경로
E-9 → E-7 → F-2 → F-5

### 유학생 경로
D-4 → D-2 → 구직(D-10) → E-7 → F-5

### 결혼이민 경로
F-6 → F-5 (2년 후)

## ⚖️ 비자별 권리 비교

| 비자 | 취업 | 이직 | 기간 | 가족 |
|------|------|------|------|------|
| E-9 | 제한적 | 어려움 | 최대 9년 | 불가 |
| E-7 | 자유 | 자유 | 제한없음 | 조건부 |
| F-2 | 자유 | 자유 | 3년갱신 | 가능 |
| F-5 | 자유 | 자유 | 무기한 | 가능 |
| F-6 | 자유 | 자유 | 갱신필요 | 가능 |

## 📋 비자 변경 절차

**공통 서류:**
- 체류자격 변경신청서
- 여권, 외국인등록증
- 수수료
- 변경 사유 증빙서류

**신청 방법:**
1. 출입국·외국인청 방문
2. 서류 제출
3. 심사 (2-4주)
4. 결과 통보

## ⚠️ 주의사항

**불법체류 방지**
- 비자 만료 전 연장/변경 필수
- 무단 이직 금지
- 허가된 활동만 가능

**비자 거절 사유**
- 서류 위조
- 체납 (세금, 보험료)
- 범죄 기록
- 소득 요건 미달

## 💡 전문가 조언

**Q: E-9에서 빨리 벗어나려면?**
A: 기술자격증 취득 → E-7 전환

**Q: 영주권 제일 빠른 방법?**
A: F-6 결혼이민 → 2년 후 F-5

**Q: 유학 후 한국 취업하려면?**
A: D-2 → 구직비자(D-10) → E-7

## 📞 무료 상담

🏢 출입국·외국인청: 1345
⚖️ 대한법률구조공단: 132
🏢 외국인력지원센터: 1644-0644

## 결론

비자 종류가 복잡해 보이지만,
목적에 맞는 비자를 선택하면 됩니다.

법률 상담이 필요하면 연락주세요.`,
    author: KOREAN_EXPERTS[0], // ke1
    category: '한국 비자·체류',
    votes: 567,
    views: 12345,
    commentCount: 78,
    createdAt: new Date(now - 90 * DAY).toISOString(),
    tags: ['비자종류', '이민법', '가이드', '전문가']
  },

  // === 한국 취업 (2개) ===

  // ve13 - 이직 가이드
  {
    id: 'p4',
    type: 'post',
    title: '🔄 E-9 이직 완벽 가이드 (3번 경험자 노하우)',
    content: `3번 이직한 Trần Văn Khanh입니다.

이직을 생각하는 분들을 위해 A-Z 정리했습니다.

## 🎯 이직이 가능한 경우

**정상 이직 (회사 동의)**
- 근로계약 만료
- 회사 폐업
- 임금 체불
- 부당 대우

**특별 이직 (고용센터 승인)**
- 회사가 동의 안 해도 가능
- 조건: 정당한 사유 필요

## 📋 이직 절차 (단계별)

### 1단계: 준비 (이직 2개월 전)

**할 일:**
□ 새 회사 알아보기
□ 현 회사와 대화 시도
□ 급여명세서 보관
□ 근로계약서 확인

**확인사항:**
- 이직 횟수 (연 3회 제한)
- 근무 기간 (최소 1년 권장)
- 퇴직금 계산

### 2단계: 회사 동의 받기

**좋은 방법:**
1. 상사와 면담 신청
2. 정중하게 이직 의사 밝히기
3. 사업장변경 동의서 요청

**만약 거부하면?**
→ 고용센터로 GO!

### 3단계: 새 회사 구하기

**방법 1: 고용센터**
- 가까운 고용센터 방문
- E-9 채용 가능 업체 목록
- 무료 매칭 서비스

**방법 2: 베트남 커뮤니티**
- 페이스북 그룹
- 지인 소개
- 직접 연락

**방법 3: 온라인**
- 워크넷 (work.go.kr)
- 외국인력 구인 사이트

**면접 준비:**
- 이력서 한국어 버전
- 이직 사유 정리
- 자격증 준비

### 4단계: 서류 준비

**필수 서류:**
□ 사업장변경 신청서
□ 새 회사 근로계약서
□ 현 회사 동의서 (또는 고용센터 승인)
□ 여권, 외국인등록증 사본
□ 수수료 약 10만원

**추가 서류 (경우에 따라):**
□ 퇴직 증명서
□ 임금 체불 증빙 (체불 시)
□ 근무 평가서

### 5단계: 출입국 신청

**신청 방법:**
1. 관할 출입국청 방문
2. 번호표 (사업장변경)
3. 서류 제출 + 수수료
4. 영수증 받기

**처리 기간:**
- 보통 2-3주
- 바쁠 때 4주

### 6단계: 승인 후

**할 일:**
□ 문자 확인
□ 승인서 수령
□ 현 회사 퇴사일 협의
□ 새 회사 입사일 확정
□ 외국인등록증 회사 주소 변경

## 💰 급여 협상 팁

**제 실제 경험:**

**1차 이직**
- 이전: 월 250만원
- 협상: 280만원 요청
- 결과: 270만원 (8% 인상)

**2차 이직**
- 이전: 월 270만원
- 협상: 300만원 요청
- 결과: 295만원 (9% 인상)

**3차 이직**
- 이전: 월 295만원
- 협상: 330만원 요청
- 결과: 320만원 (8.5% 인상)

**협상 전략:**
1. 시장 평균 조사
2. 본인 경력 강조
3. 10-15% 높게 요청
4. 타협점 찾기

## ⚠️ 이직 시 주의사항

**❌ 절대 하면 안 되는 것**

1. **무단 이직**
   - 불법체류로 간주
   - 강제출국 위험

2. **허위 사유**
   - 거짓말로 이직 신청
   - 적발 시 비자 취소

3. **계약 위반**
   - 통보 없이 퇴사
   - 손해배상 청구 가능

4. **연 3회 초과**
   - 4번째부터 승인 어려움

**✅ 꼭 지켜야 할 것**

1. **정직하게**
   - 진짜 이유 말하기
   - 서류 정확히

2. **준비 철저히**
   - 서류 미리 챙기기
   - 새 회사 확실히

3. **원만하게**
   - 현 회사와 좋게 마무리
   - 추천서 받으면 좋음

## 🎓 이직이 유리한 타이밍

**좋은 시기:**
- 계약 만료 3개월 전
- 회사 성수기 지난 후
- 새 회사 수요 많을 때

**피해야 할 시기:**
- 입사 6개월 미만
- 회사 성수기
- 연말연시 (처리 느림)

## 💡 꿀팁

**팁 1: 퇴직금 챙기기**
- 1년 이상 근무 시 퇴직금
- 이직 전 계산해보기

**팁 2: 4대보험 확인**
- 새 회사 가입 확인
- 중단 없도록 조치

**팁 3: 기숙사 문제**
- 새 회사 기숙사 확인
- 임시 거처 준비

**팁 4: 동료에게 배우기**
- 이직 경험자에게 조언
- 같은 실수 피하기

## 📞 도움 받을 곳

🏢 **고용센터**: 1350
- 이직 상담
- 일자리 매칭

🏢 **출입국청**: 1345
- 절차 문의
- 서류 확인

🏢 **외국인력지원센터**: 1644-0644
- 무료 상담
- 통역 지원

## ✅ 이직 성공 체크리스트

□ 이직 사유 명확
□ 새 회사 확정
□ 서류 완벽 준비
□ 현 회사 원만 협의
□ 퇴직금 정산
□ 4대보험 이전
□ 거주지 이전 신고

## 마무리

이직은 더 나은 환경을 위한 선택입니다.
준비만 잘하면 성공할 수 있어요!

제가 3번 성공한 노하우 공유했습니다.
여러분도 할 수 있어요! 💪

궁금한 점 댓글로 물어보세요! 🇻🇳`,
    author: VIETNAMESE_EXPERTS[12], // ve13
    category: '한국 취업',
    votes: 389,
    views: 7823,
    commentCount: 67,
    createdAt: new Date(now - 50 * DAY).toISOString(),
    tags: ['이직', 'E-9', '사업장변경', '가이드']
  },

  // ke2 - 근로권리 정리 (한국인 노무사)
  {
    id: 'p5',
    type: 'post',
    title: '⚖️ 외국인 근로자 권리 완벽 정리 (노무사 작성)',
    content: `노무사 김태희입니다.

베트남 근로자 분들이 꼭 알아야 할 권리를 정리했습니다.

## 🎯 기본 원칙

> **외국인 근로자 = 한국인 근로자**
>
> 근로기준법상 동일한 권리!

## 💰 임금 권리

### 최저임금 (2025년)
**시급: 10,030원**
**월급: 2,096,270원** (주 40시간 기준)

**계산 방법:**
- 시급 × 209시간 (월 평균 근로시간)
- 주휴수당 포함

### 수당 권리

**연장근무 수당**
- 1일 8시간, 주 40시간 초과 시
- **기본급의 1.5배**
- 예: 시급 10,000원 → 연장 15,000원

**야간근무 수당**
- 오후 10시 ~ 오전 6시
- **기본급의 1.5배 추가**

**휴일근무 수당**
- 주휴일, 공휴일 근무
- **기본급의 1.5배**
- 8시간 초과 시 2배

**주휴수당**
- 주 15시간 이상 근무 시
- 1주일 개근 시 유급 1일
- **월급에 포함되어야 함**

### 임금 지급 원칙

**지급일**
- 매월 1회 이상
- 정해진 날짜에
- 현금 또는 통장 입금

**급여명세서**
- 매월 받아야 함
- 기본급, 수당 명시
- 공제 내역 표시

## 📅 근로시간 권리

### 기본 근로시간
- **1일 8시간**
- **주 40시간**
- 초과 시 연장근무 수당

### 휴게시간
- 4시간 근무 시 30분
- 8시간 근무 시 1시간
- **유급 아님**

### 휴일
**주휴일**
- 주 1회 보장
- 보통 일요일
- 유급 휴일

**공휴일**
- 명절, 국경일 등
- 5인 이상 사업장 유급
- 근무 시 1.5배 수당

## 🏖️ 휴가 권리

### 연차휴가
**발생 기준:**
- 1년 근무 시 15일
- 2년차: 15일
- 3년차: 16일
- 매 2년마다 1일 추가 (최대 25일)

**미사용 연차:**
- 다음 해 소멸
- 소멸 시 수당 지급

### 생리휴가
- 여성 근로자
- 월 1일
- 무급 (회사 규정에 따라)

### 출산휴가
- 90일 (다태아 120일)
- 유급 (고용보험 지원)

## 🏥 산재보험 권리

### 적용 대상
**모든 외국인 근로자!**
- E-9, E-7 등 모두 해당
- 1인 이상 사업장

### 보장 범위
- 업무 중 사고
- 출퇴근 사고
- 직업병

### 급여 종류
**요양급여**: 치료비 전액
**휴업급여**: 70% 임금 보상
**장해급여**: 장해 등급별
**유족급여**: 사망 시 유족에게

### 신청 방법
1. 회사에 요청
2. 회사 거부 시 → 직접 신청 가능
3. 근로복지공단 방문
4. 서류: 진단서, 사고경위서

## 🛡️ 부당대우 대응

### 부당해고
**정당한 해고 사유 없이 해고 금지**

**대응 방법:**
1. 해고 사유서 요구
2. 부당해고 구제 신청
3. 노동위원회 접수
4. 기간: 해고일로부터 3개월 이내

### 임금 체불
**즉시 대응!**

**단계:**
1. 회사에 서면 요청
2. 노동청 진정
3. 임금채권보장 신청

**벌칙:**
- 3년 이하 징역
- 3천만원 이하 벌금

### 폭행·폭언
**절대 참지 마세요!**

**대응:**
1. 증거 확보 (녹음, 사진)
2. 경찰 신고 (112)
3. 노동청 진정
4. 비자 변경 신청 가능

## 🔐 4대 보험 권리

### 국민연금
**가입 의무**: 18-60세
**보험료**: 급여의 9% (근로자 4.5%, 회사 4.5%)
**받을 권리**: 10년 이상 가입 시 연금 수령

### 건강보험
**가입 의무**: 모든 근로자
**보험료**: 급여의 7.09% (근로자·회사 반반)
**혜택**: 병원 진료비 할인

### 고용보험
**가입 의무**: 1개월 이상 근로자
**보험료**: 급여의 1.8%
**혜택**: 실업급여 (실직 시)

### 산재보험
**가입 의무**: 모든 사업장
**보험료**: 회사 전액 부담
**혜택**: 업무상 재해 보상

## 📞 권리 보호 연락처

### 긴급 상황
🚨 **경찰**: 112
🚨 **범죄신고**: 112

### 노동 문제
☎ **고용노동부**: 1350
- 임금 체불
- 부당 대우
- 근로 조건

☎ **외국인력지원센터**: 1644-0644
- 베트남어 상담
- 무료 통역

### 법률 지원
⚖️ **대한법률구조공단**: 132
- 무료 법률 상담
- 소송 지원

⚖️ **한국이주여성인권센터**: 1577-1366
- 베트남어 상담

### 산재·보험
🏥 **근로복지공단**: 1588-0075
- 산재 상담
- 보험금 청구

## ⚠️ 자주하는 실수

**실수 1: "외국인이라 권리 없다"**
→ ❌ 틀렸어요! 똑같은 권리!

**실수 2: "회사가 무섭다"**
→ 법이 보호해요. 신고하세요!

**실수 3: "한국어 못해서 포기"**
→ 베트남어 통역 있어요!

**실수 4: "비자 위험하다"**
→ 정당한 권리 행사는 비자에 영향 없음!

## ✅ 권리 행사 체크리스트

□ 근로계약서 보관
□ 급여명세서 매월 확인
□ 출퇴근 시간 기록
□ 증거 자료 수집
□ 문제 발생 시 즉시 신고
□ 베트남어 상담 이용
□ 포기하지 않기!

## 💡 노무사의 조언

**"침묵은 금이 아닙니다"**

근로자의 권리는
행사하지 않으면
보호받을 수 없습니다.

정당한 권리는
당당하게 요구하세요!

## 마무리

여러분은 한국 경제에
중요한 일원입니다.

정당한 권리를
꼭 보호받으세요!

무료 상담 언제든 환영합니다.`,
    author: KOREAN_EXPERTS[1], // ke2
    category: '한국 취업',
    votes: 678,
    views: 15234,
    commentCount: 92,
    createdAt: new Date(now - 75 * DAY).toISOString(),
    tags: ['근로권리', '노동법', '외국인', '전문가']
  },

  // === 한국 생활 (3개) ===

  // ve22 - 안산 생활 가이드
  {
    id: 'p6',
    type: 'post',
    title: '🏘️ 안산 생활 완벽 가이드 (10년 거주자 추천)',
    content: `안산 10년차 Nguyễn Văn Minh입니다.

안산은 베트남 사람 제일 많은 도시!
생활 정보 총정리했습니다.

## 🌏 안산이 좋은 이유

**베트남 커뮤니티 최대**
- 베트남 인구: 약 4만명
- 다문화거리 (원곡동)
- 베트남어만으로도 생활 가능!

**교통 편리**
- 지하철 4호선 (서울 40분)
- 버스 노선 많음
- 공장 통근 편함

## 🏪 쇼핑 (베트남 식료품)

### 다문화거리 (원곡동)
**주요 마트:**
- **아시아마트** (제일 큼)
- **베트남식품점** (쌀국수, 피시소스)
- **한아시아마트** (고기, 야채)

**가격 비교 (제 경험):**
- 쌀국수: 3,000-5,000원
- 피시소스: 8,000-12,000원
- 쌀 (20kg): 35,000-45,000원

### 대형마트
- **이마트 고잔점**: 한국 식품
- **홈플러스**: 생필품
- **코스트코**: 대용량 (회원권 필요)

## 🍜 맛집 추천

### 베트남 음식 (원곡동)
**쌀국수 맛집 TOP 3:**
1. **사이공쌀국수** (8,000원)
   - 국물 진함
   - 고기 많음

2. **하노이쌀국수** (7,500원)
   - 북부 스타일
   - 깔끔한 맛

3. **호치민쌀국수** (8,500원)
   - 남부 스타일
   - 야채 푸짐

**기타 추천:**
- 분짜: 9,000원
- 반쎄오: 12,000원
- 반미: 5,000원
- 분보후에: 10,000원

### 저렴한 한국 음식
- **김밥천국**: 3,000-5,000원
- **국밥**: 6,000-8,000원
- **백반**: 7,000-9,000원

## 🏠 주거 정보

### 원룸 월세 (2025년 기준)
**원곡동 (베트남 밀집지역):**
- 보증금 500만원 / 월 40만원
- 보증금 1000만원 / 월 35만원

**고잔동 (지하철역 근처):**
- 보증금 1000만원 / 월 45만원
- 보증금 2000만원 / 월 40만원

**꿀팁:**
- 베트남 커뮤니티에서 구하면 저렴
- 페이스북 "안산 베트남" 그룹

### 쉐어하우스
- 1인 1방: 월 25-35만원
- 공용 주방, 화장실
- 관리비 별도 (5-10만원)

## 🚇 교통

### 지하철 4호선
**주요 역:**
- 안산역: 시청, 은행
- 중앙역: 쇼핑몰
- 고잔역: 주거지역
- 초지역: 공장지대
- 원곡역: 다문화거리

**요금:**
- 기본 1,400원
- T-money 이용

### 버스
**시내버스:** 1,300원
**마을버스:** 1,000원

**꿀�팁:**
- 카카오맵 앱 사용
- 환승 30분 무료

## 🏥 병원

### 베트남어 가능 병원
**원곡보건지소**
- 주소: 원곡동
- 베트남어 통역
- 저렴한 진료

**안산의료원**
- 종합병원
- 통역 서비스
- 응급실 24시간

### 약국
**다문화거리 약국**
- 베트남어 가능
- 감기약, 소화제

## 🏛️ 유용한 장소

### 안산시 외국인주민센터
- 주소: 단원구 화랑로
- 서비스:
  - 무료 한국어 교육
  - 법률 상담
  - 통역 서비스
  - 생활 정보

### 고용센터
- 일자리 상담
- 이직 지원
- 실업급여

### 은행 (베트남어 가능)
- 신한은행 안산지점
- 우리은행 안산지점

## 🎉 베트남 커뮤니티

### 행사
**베트남 설 (Tết)**
- 매년 1-2월
- 다문화거리 축제
- 전통 공연

**추석 행사**
- 베트남 음식 축제
- 문화 공연

### 모임
**페이스북 그룹:**
- "안산 베트남 사람들"
- "안산 베트남 중고장터"
- "안산 베트남 정보"

**오프라인:**
- 베트남 성당 (매주 일요일)
- 베트남 사원

## 💡 생활 꿀팁

**팁 1: 원곡동에서 시작**
- 처음 오면 원곡동 추천
- 베트남 친구 만나기 쉬움

**팁 2: 다문화거리 시간**
- 평일 저녁 활기참
- 주말 오후 붐빔

**팁 3: 송금 (베트남으로)**
- 환전소 (원곡동)
- 수수료 저렴
- 신한은행 해외송금

**팁 4: 베트남 명절 준비**
- 설 1달 전 쇼핑
- 명절 용품 풍부

**팁 5: 중고 거래**
- 페이스북 중고장터
- 저렴하게 가전 구입

## 🚫 주의사항

**치안:**
- 밤늦게 원곡동 주의
- 귀중품 보관 조심

**사기:**
- 집 계약 시 등기부등본 확인
- 중고거래 직거래 권장

## 📞 긴급 연락처

🚨 **경찰**: 112
🚑 **소방/응급**: 119
🏥 **안산의료원**: 031-123-4567
🏛️ **외국인주민센터**: 031-481-2114

## 🗺️ 주변 나들이

**대부도 (자연)**
- 버스로 40분
- 바다, 갯벌 체험

**시화방조제**
- 드라이브 코스
- 전망대

**서울 (쇼핑)**
- 지하철 40분
- 명동, 동대문

## ✅ 안산 생활 체크리스트

□ 원곡동 다문화거리 방문
□ T-money 카드 구입
□ 베트남 마트 위치 파악
□ 페이스북 그룹 가입
□ 외국인주민센터 등록
□ 주변 병원 확인
□ 베트남 음식점 탐방

## 마무리

안산은 베트남 사람에게
제2의 고향 같은 곳입니다!

외롭지 않고, 편하게 살 수 있어요.

10년 살면서 느낀 거
다 알려드렸습니다! 🇻🇳

궁금한 점 댓글로 물어보세요!`,
    author: VIETNAMESE_EXPERTS[21], // ve22
    category: '한국 생활',
    votes: 523,
    views: 11234,
    commentCount: 89,
    createdAt: new Date(now - 40 * DAY).toISOString(),
    tags: ['안산', '생활정보', '다문화거리', '가이드']
  },

  // ve24 - 월세 계약 가이드
  {
    id: 'p7',
    type: 'post',
    title: '월세 계약 완벽 가이드 (사기 예방법 포함)',
    content: `5번 이사한 Trần Văn Duy입니다.

월세 계약 실수하면 큰일나요!
제 경험 바탕으로 정리했습니다.

## 🎯 월세 vs 전세

### 월세 (月貰)
**보증금 + 월세**
- 예: 보증금 500만원 + 월 40만원
- 외국인에게 일반적

### 전세 (傳貰)
**보증금만 (월세 없음)**
- 예: 보증금 5000만원
- 외국인은 어려움 (신용 필요)

### 반전세
**보증금 많이 + 월세 조금**
- 예: 보증금 3000만원 + 월 20만원

## 📋 계약 전 체크리스트

### 1. 집 보기 전

□ 예산 정하기
  - 보증금 얼마까지?
  - 월세 얼마까지?

□ 위치 정하기
  - 회사 거리
  - 교통편
  - 마트, 병원

□ 조건 정하기
  - 원룸/투룸
  - 옵션 (냉장고, 세탁기 등)

### 2. 집 볼 때

□ **낮에 방문** (햇빛 확인)
□ 수압 확인 (수도 틀어보기)
□ 보일러 작동 확인
□ 방음 확인 (벽 두들겨보기)
□ 곰팡이 확인 (벽, 천장)
□ 옵션 작동 확인
□ 주변 환경 (소음, 치안)

### 3. 집주인 확인 ⚠️ 중요!

**등기부등등본 확인 필수!**
- 구청/동사무소에서 발급
- 비용: 1,000원
- 확인사항:
  - 집주인 이름 일치
  - 근저당 (대출) 확인
  - 전세권 설정 여부

**신분증 대조**
- 집주인 신분증 사본
- 등기부등등본 이름 일치

**⚠️ 가짜 집주인 사기 많아요!**

## 📄 계약서 작성

### 필수 기재 사항

**1. 기본 정보**
□ 집주인 이름, 연락처
□ 세입자 (본인) 이름, 연락처
□ 주소 정확히
□ 보증금 금액
□ 월세 금액

**2. 날짜**
□ 계약일
□ 입주일
□ 계약 기간 (보통 1년)
□ 만료일

**3. 관리비**
□ 관리비 포함 항목
  - 수도세
  - 전기세
  - 가스비
  - 인터넷
□ 별도 항목 명시

**4. 특약사항**
□ 보증금 반환일 (퇴거 후 OO일)
□ 수리 책임 (집주인/세입자)
□ 반려동물 가능 여부
□ 전대 (다른 사람에게 빌려주기) 금지
□ 기타 약속

### 계약서 작성 주의사항

**✅ 반드시:**
- 계약서 2부 작성 (각 1부씩)
- 집주인 직인 또는 서명
- 계약서 보관 잘하기

**❌ 주의:**
- 구두 약속 믿지 말기
- 계약서에 없으면 인정 안 됨!

## 💰 보증금 관리

### 입금 방법

**안전한 방법:**
1. 은행 송금 (기록 남음)
2. 영수증 받기
3. 집주인 통장 확인

**위험한 방법:**
❌ 현금 직접 전달
❌ 영수증 없이

### 보증금 반환

**정상 반환:**
- 퇴거일로부터 **보통 1주일**
- 계약서에 명시된 기간

**공제 가능 항목:**
- 파손된 부분 수리비
- 미납 관리비
- 청소비 (계약서에 있으면)

**⚠️ 보증금 못 받는 경우:**
- 집주인 연락 두절
- 집주인 파산
→ 임대차보호법으로 보호 (최우선 변제)

## 🚫 사기 예방법

### 사기 수법 TOP 5

**1. 가짜 집주인**
- 방법: 등기부등등본 확인
- 신분증 대조

**2. 이중 계약**
- 방법: 전입신고 빨리
- 계약서 원본 보관

**3. 보증금 돌려주기 거부**
- 방법: 계약서 명확히
- 퇴거 시 사진 찍기

**4. 숨겨진 하자**
- 방법: 입주 전 사진
- 문제 발견 즉시 통보

**5. 과도한 중개수수료**
- 방법: 법정 수수료 확인
- 0.5개월치 한도

## 📝 입주 시 체크리스트

### 입주 당일

□ **집 상태 사진 촬영** (중요!)
  - 모든 방
  - 벽, 바닥
  - 욕실, 주방
  - 옵션 (냉장고 등)

□ 집주인과 함께 확인
  - 파손 부분 기록
  - 문자로 전송 (증거)

□ 가스·수도·전기 검침
  - 검침기 사진
  - 시작 수치 기록

□ 옵션 작동 테스트
  - 냉장고
  - 세탁기
  - 보일러
  - 에어컨

□ 열쇠 개수 확인

### 입주 1주일 내

□ **전입신고** (동사무소)
  - 계약서 지참
  - 외국인등록증
  - 전입신고 = 권리 보호!

□ 관리비 납부 방법 확인
□ 쓰레기 배출 시간 확인
□ 공동 시설 이용 방법

## ⚖️ 법적 보호

### 임대차보호법

**전입신고 + 확정일자**
→ 보증금 보호!

**최우선 변제권:**
- 소액: 지역별 상이
- 서울: 5,000만원 이하
- 경기: 4,000만원 이하
- 집주인 파산해도 우선 반환

## 💡 꿀팁

**팁 1: 베트남 커뮤니티 활용**
- 페이스북 그룹
- 중개 수수료 없음
- 같이 사는 친구 구하기

**팁 2: 계약 시기**
- 비수기: 2월, 7-8월
- 협상 여지 많음

**팁 3: 첫 계약은 짧게**
- 6개월 or 1년
- 지역 파악 후 재계약

**팁 4: 사진 증거**
- 입주 시 사진
- 퇴거 시 사진
- 비교 증거

**팁 5: 집주인과 좋은 관계**
- 관리 잘하기
- 문제 즉시 보고
- 계약 갱신 협상 유리

## 📞 도움 받을 곳

🏛️ **주택임대차분쟁조정위원회**
- 전화: 1600-0110

⚖️ **대한법률구조공단**
- 전화: 132
- 무료 법률 상담

🏢 **외국인력지원센터**
- 전화: 1644-0644
- 베트남어 상담

## 🚨 문제 발생 시

### 보증금 반환 거부

**1단계: 내용증명 발송**
- 우체국 이용
- "OO일까지 반환 요청"

**2단계: 임대차분쟁조정**
- 위원회 신청
- 무료

**3단계: 소액심판**
- 5천만원 이하
- 간단한 절차

### 집주인 연락 두절

**즉시:**
1. 경찰 신고
2. 법률 상담
3. 전입신고 확인

## ✅ 퇴거 시 체크리스트

□ 1개월 전 통보
□ 청소 (원상복구)
□ 파손 부분 수리
□ 집 상태 사진
□ 관리비 정산
□ 검침기 사진
□ 열쇠 반환
□ 보증금 반환 계좌 전달
□ 전출신고

## 마무리

월세 계약은 신중하게!
실수하면 돈 날려요.

제가 5번 이사하면서
배운 것 다 알려드렸습니다.

여러분은 실수하지 마세요! 💪

궁금한 점 댓글로 물어보세요! 🏠`,
    author: VIETNAMESE_EXPERTS[23], // ve24
    category: '한국 생활',
    votes: 456,
    views: 9876,
    commentCount: 74,
    createdAt: new Date(now - 55 * DAY).toISOString(),
    tags: ['월세', '계약', '부동산', '사기예방']
  },

  // ve25 - 은행 가이드
  {
    id: 'p8',
    type: 'post',
    title: '🏦 한국 은행 이용 완벽 가이드 (계좌개설부터 송금까지)',
    content: `안녕하세요, Lê Văn Tuấn입니다.

처음 한국 와서 은행 이용이 어려웠어요.
5년 경험 바탕으로 정리했습니다.

## 🎯 은행 계좌가 필요한 이유

**필수 사항:**
- 월급 받기
- 월세 자동이체
- 4대 보험 납부
- 베트남 송금

## 🏦 은행 종류

### 시중은행 (추천)
**국민은행**
- 지점 많음
- 앱 사용 편함
- 외국인 서비스 좋음

**신한은행**
- 베트남어 상담 가능
- 해외송금 수수료 저렴
- 앱 친절함

**우리은행**
- 통장 발급 빠름
- ATM 많음

**하나은행**
- 외국인 특화
- 송금 서비스 좋음

### 인터넷은행
**카카오뱅크**
- 비대면 개설
- 수수료 저렴
- 앱으로 모든 것

**토스뱅크**
- 간편 송금
- 수수료 무료
- 젊은 층 많이 이용

## 📋 계좌 개설 (처음)

### 필요 서류

□ 외국인등록증 (필수!)
□ 여권
□ 핸드폰 (본인 명의)
□ 현금 1만원 (입금용)

**⚠️ 주의:**
- 외국인등록증 없으면 불가
- 여권만으로는 제한적
- 핸드폰 필요 (인증용)

### 개설 방법

**방법 1: 은행 지점 방문**
1. 가까운 은행 지점
2. "계좌 개설하고 싶어요"
3. 서류 제출
4. 10-20분 대기
5. 통장 + 체크카드 받기

**방법 2: 인터넷은행 (카카오뱅크)**
1. 앱 다운로드
2. 본인인증
3. 비대면 개설
4. 3-5일 후 카드 우편

### 선택 사항

**입출금 통장:**
- 기본 통장
- 자유롭게 입출금
- 이자 거의 없음

**적금 통장:**
- 매달 저축
- 이자 있음 (연 3-4%)
- 만기 있음

**예금 통장:**
- 목돈 저축
- 이자 높음 (연 4-5%)
- 중도 해지 시 이자 손해

## 💳 체크카드 vs 신용카드

### 체크카드 (추천)
**장점:**
- 개설과 동시 발급
- 통장 잔액만큼 사용
- 신용 불필요

**단점:**
- 신용 점수 쌓이지 않음
- 할부 불가

### 신용카드
**장점:**
- 할부 가능
- 포인트 적립
- 신용 점수 쌓임

**단점:**
- 신용 평가 필요
- 외국인은 발급 어려움
- 과소비 위험

**외국인 신용카드 조건:**
- F-5 영주권
- 또는 5년 이상 체류
- 또는 높은 소득

## 📱 모바일 뱅킹 (필수!)

### 설치 방법

1. **앱 다운로드**
   - 은행 공식 앱
   - 플레이스토어 / 앱스토어

2. **인증서 등록**
   - 공동인증서 (구 공인인증서)
   - 또는 생체인증 (지문)

3. **비밀번호 설정**
   - 6자리 숫자
   - 절대 타인에게 알려주지 말것!

### 할 수 있는 것

✅ 잔액 조회
✅ 이체
✅ ATM 찾기
✅ 공과금 납부
✅ 베트남 송금 (일부)
✅ 카드 사용 내역

## 💸 송금 (베트남으로)

### 방법 비교

**은행 해외송금**
- 수수료: 2-4만원
- 환율: 은행 환율
- 시간: 1-3일
- 한도: 제한 많음

**환전소 (추천!)**
- 수수료: 5천-1만원
- 환율: 좋음
- 시간: 즉시
- 한도: 자유로움
- 위치: 안산 원곡동, 서울 이태원

**송금 앱**
- 센트비: 수수료 저렴
- 리미트: 수수료 저렴
- 트랜스퍼와이즈: 환율 좋음

### 송금 절차 (은행)

**필요 서류:**
□ 외국인등록증
□ 송금 사유 증빙
  - 가족 생활비
  - 저축 등
□ 받는 사람 정보
  - 이름 (여권 표기)
  - 계좌번호
  - 은행명 (SWIFT 코드)

**절차:**
1. 은행 지점 방문
2. 해외송금 신청서 작성
3. 수수료 + 송금액 납부
4. 1-3일 후 도착

### 송금 한도

**E-9 비자:**
- 연간 $50,000 (약 6천만원)
- 분기별 제한 있음

**F-5 영주권:**
- 제한 거의 없음

## 🏧 ATM 이용

### 출금

**수수료:**
- 본인 은행: 무료
- 다른 은행: 1,000원
- 시간외: 추가 500원

**한도:**
- 1회: 50만원
- 1일: 100만원

### 입금

**현금 입금:**
- 본인 계좌: 무료
- 다른 사람 계좌: 500-1,000원

**수표 입금:**
- 가능 (ATM에 따라)

## 💡 꿀팁

**팁 1: 주거래 은행 정하기**
- 1개 은행 집중 이용
- 우대 혜택 받기

**팁 2: 통장 쪼개기**
- 급여통장 (입출금)
- 생활비통장 (월세, 관리비)
- 저축통장 (적금)

**팁 3: 자동이체 활용**
- 월세
- 관리비
- 4대 보험
- 핸드폰 요금

**팁 4: 송금은 환전소**
- 은행보다 저렴
- 환율 좋음
- 빠름

**팁 5: 모바일 뱅킹 필수**
- ATM 갈 필요 없음
- 24시간 이체 가능

## 🚫 주의사항

**사기 조심!**

❌ **전화 사기 (보이스피싱)**
- "경찰입니다" → 거짓!
- "계좌 이상 있음" → 거짓!
- "ATM 가서 조작" → 거짓!
→ 절대 믿지 마세요!

❌ **피싱 앱**
- 공식 앱만 사용
- 링크로 받지 말것

❌ **비밀번호 유출**
- 타인에게 알려주지 말것
- 정기적으로 변경

**분실 시 즉시:**
☎ 은행 고객센터
- 카드 정지
- 재발급 신청

## 📊 이자 절약 팁

### 수수료 줄이기

**ATM 수수료:**
- 본인 은행 이용
- 오전 9시-오후 6시 이용

**이체 수수료:**
- 모바일 뱅킹 (무료 or 저렴)
- 지점 방문 (비쌈)

**송금 수수료:**
- 환전소 이용
- 송금 앱 이용

### 이자 받기

**적금:**
- 매달 10만원 → 1년 후 약 125만원
- 이자: 약 5만원

**예금:**
- 목돈 (500만원) → 1년 후 약 525만원
- 이자: 약 25만원

## 📞 은행 고객센터

**국민은행:** 1588-9999
**신한은행:** 1599-8000
**우리은행:** 1588-5000
**하나은행:** 1599-1111
**카카오뱅크:** 1599-3333

**⚠️ 베트남어 상담:**
- 신한은행: 가능
- 기타: 영어

## ✅ 은행 이용 체크리스트

□ 외국인등록증 발급 후 계좌 개설
□ 체크카드 발급
□ 모바일 뱅킹 설치
□ 인증서 등록
□ 자동이체 설정 (월세, 관리비)
□ 송금 방법 확인
□ 주거래 은행 정하기
□ 적금 시작

## 마무리

은행 이용은 어렵지 않아요!
처음만 잘 설정하면
편하게 이용할 수 있습니다.

제 경험 바탕으로
필요한 것만 정리했습니다! 💰

궁금한 점 댓글로 물어보세요! 🏦`,
    author: VIETNAMESE_EXPERTS[24], // ve25
    category: '한국 생활',
    votes: 389,
    views: 8234,
    commentCount: 62,
    createdAt: new Date(now - 65 * DAY).toISOString(),
    tags: ['은행', '계좌개설', '송금', '금융']
  },

  // === 한국 교육·언어 (1개) ===

  // ve31 - TOPIK 학습 가이드
  {
    id: 'p9',
    type: 'post',
    title: 'TOPIK 2급 합격 로드맵 (4개월 단기 완성)',
    content: `TOPIK 6급 합격자 Trần Văn Tuấn입니다.

2급부터 6급까지 올린 경험
공유합니다!

## 🎯 TOPIK이 뭔가요?

**한국어능력시험 (Test of Proficiency in Korean)**
- 1급 (제일 쉬움) → 6급 (제일 어려움)
- 연 6회 시험
- 비자, 취업, 대학 입학에 필요

## 📊 등급별 수준

**TOPIK I (1-2급)**
- 1급: 기초 회화 (800단어)
- 2급: 일상 대화 (1,500-2,000단어)

**TOPIK II (3-6급)**
- 3급: 업무 가능 (2,500-3,000단어)
- 4급: 뉴스 이해 (4,000-5,000단어)
- 5급: 전문 업무 (6,000-7,000단어)
- 6급: 고급 한국어 (7,000-10,000단어)

## 🎯 2급 합격 로드맵 (4개월)

### 목표 설정
**TOPIK I (1-2급)**
- 총점: 200점
- 듣기: 100점
- 읽기: 100점

**합격 점수:**
- 1급: 80점 이상
- 2급: 140점 이상

**제 목표:**
- 듣기: 80점
- 읽기: 70점
- 총 150점 (2급 합격)

### 1개월차: 기초 다지기

**주 5일, 하루 1.5시간**

**듣기 (30분)**
- 유튜브 "베이직 코리안"
- TTMIK (Talk To Me In Korean)
- 한글 받침 연습

**읽기 (30분)**
- 한글 완벽히 읽기
- 기초 문법 (은/는, 이/가)
- 기본 단어 100개

**쓰기 연습 (30분)**
- 받아쓰기
- 간단한 문장

**주말:**
- 복습
- 한국 드라마 (자막)

### 2개월차: 실전 준비

**주 5일, 하루 2시간**

**듣기 (40분)**
- TOPIK 듣기 기출문제
- 속도 익히기
- 핵심 단어 파악

**읽기 (40분)**
- 기출문제 풀기
- 문법 패턴 암기
- 독해 연습

**단어 (40분)**
- TOPIK 2급 필수 단어 1,500개
- 하루 50개씩
- 복습 필수

**주말:**
- 모의고사 1회
- 오답 정리

### 3개월차: 약점 보완

**주 6일, 하루 2.5시간**

**듣기 집중 (50분)**
- 약한 유형 반복
- 듣기 속도 Up
- 메모 연습

**읽기 집중 (50분)**
- 시간 단축 연습
- 문법 정리
- 긴 지문 연습

**모의고사 (50분)**
- 주 2회
- 실전처럼
- 오답 노트

**주말:**
- 약점 집중 공부

### 4개월차: 실전 대비

**매일 3시간**

**모의고사 중심 (1시간)**
- 매일 1회
- 시간 맞춰서
- 채점 + 분석

**오답 정리 (1시간)**
- 틀린 문제 분석
- 왜 틀렸는지
- 다시 풀기

**최종 정리 (1시간)**
- 약한 부분
- 단어 복습
- 문법 정리

**시험 1주 전:**
- 컨디션 관리
- 가벼운 복습
- 자신감!

## 📚 교재 추천

### 필수 교재 (3권)

**1. "TOPIK 한국어능력시험 Ⅰ" (고려대)**
- 가격: 약 2만원
- 체계적 학습
- 기출문제 포함

**2. "TOPIK 필수 단어장"**
- 가격: 1.5만원
- 레벨별 단어
- 예문 풍부

**3. "TOPIK 기출문제집" (최근 3년)**
- 가격: 2만원
- 실전 감각
- 답안 해설

**총 비용: 약 5.5만원**

### 무료 자료

**웹사이트:**
- TOPIK 공식 홈페이지 (기출문제 무료)
- TTMIK 웹사이트 (무료 강의)

**유튜브:**
- 베이직 코리안
- TTMIK
- Korean Unnie
- 세종학당

**앱:**
- "TOPIK ONE" (무료)
- "한국어 공부" (무료)
- "Drops" (단어 학습)

## 🎧 듣기 공략법

### 유형별 전략

**유형 1: 그림 보고 고르기**
- 핵심 단어 듣기
- 그림 미리 보기

**유형 2: 대화 듣고 이어질 말**
- 문맥 파악
- 존댓말/반말 구분

**유형 3: 장소/직업 고르기**
- 관련 단어 외우기
- 힌트 단어 듣기

**꿀팁:**
- 문제 먼저 읽기 (10초 활용)
- 메모하기 (숫자, 시간)
- 첫 문장 집중

### 듣기 연습 방법

**1단계: 천천히**
- 0.75배속으로 듣기
- 단어 하나하나 파악

**2단계: 정상 속도**
- 1배속
- 전체 내용 이해

**3단계: 빠르게**
- 1.25배속
- 실전 대비

## 📖 읽기 공략법

### 시간 배분

- 총 40문항 / 60분
- 1문항당 1.5분
- 긴 지문: 3분

**전략:**
- 쉬운 문제 먼저 (1-20번)
- 어려운 문제 나중 (21-40번)
- 10분 여유 남기기

### 유형별 전략

**문법 채우기 (1-20번)**
- 문법 패턴 외우기
- 빨리 풀기

**독해 (21-40번)**
- 질문 먼저 읽기
- 핵심 문장 파악
- 선택지 소거법

**꿀팁:**
- 모르는 단어 추측하기
- 지문 주제 파악
- 선택지 비교

## 📝 실전 팁

### 시험 전날

□ 일찍 자기 (8시간 수면)
□ 과도한 공부 X
□ 가벼운 복습만
□ 시험장 위치 확인
□ 준비물 챙기기

### 시험 당일

**준비물:**
□ 신분증 (외국인등록증)
□ 수험표
□ 컴퓨터용 사인펜 (흑색)
□ 수정테이프
□ 아날로그 시계

**당일 루틴:**
- 2시간 전 기상
- 가벼운 아침
- 30분 일찍 도착
- 화장실 미리
- 물 준비

### 시험 중

**듣기:**
- 긴장 풀기
- 문제 미리 읽기
- 확실한 것부터

**읽기:**
- 시간 배분 지키기
- 모르면 넘어가기
- 마지막 검토

## 💰 비용 정리

**총 비용:**
- 시험 응시료: 55,000원
- 교재: 55,000원
- 합계: 11만원

**무료 활용 시: 5.5만원**

## 📊 실제 합격 사례

### 제 점수 변화

**1차 시도 (준비 1개월)**
- 듣기: 52점
- 읽기: 48점
- 총점: 100점 → **불합격**

**2차 시도 (준비 4개월)**
- 듣기: 78점
- 읽기: 72점
- 총점: 150점 → **2급 합격!**

### 동료들 사례

**사례 1: Nguyễn (공장 근무)**
- 준비 기간: 3개월
- 하루 2시간
- 결과: 158점 (2급 합격)

**사례 2: Trần (식당 근무)**
- 준비 기간: 5개월
- 하루 1시간
- 결과: 142점 (2급 합격)

**사례 3: Lê (건설 근무)**
- 준비 기간: 6개월
- 하루 30분 (꾸준히)
- 결과: 148점 (2급 합격)

## 🎓 합격 후

**활용:**
- E-7 비자 신청 (3급 이상)
- F-5 영주권 (4급 이상)
- 취업 우대
- 급여 인상

**다음 목표:**
- 3급 도전
- 4급 도전 (영주권용)

## 💡 동기부여

**"한국어는 베트남어만큼 어렵지 않아요!"**

- 문법 유사함
- 한자어 많음
- 발음 쉬움

**"꾸준함이 실력!"**

- 하루 1시간
- 4개월 투자
- 평생 혜택

## 📞 무료 학습 지원

🏢 **세종학당**
- 무료 한국어 수업
- 온/오프라인

🏢 **다문화센터**
- 무료 강좌
- TOPIK 준비반

🏢 **지역 도서관**
- 한국어 코너
- 학습 공간

## ✅ 학습 체크리스트

□ 목표 설정 (2급)
□ 교재 구입
□ 학습 계획표 작성
□ 하루 1.5-2시간 확보
□ 기출문제 풀기
□ 모의고사 주 2회
□ 오답 정리
□ 꾸준함!

## 마무리

TOPIK 2급은
4개월이면 충분합니다!

저도 공장에서 일하면서
퇴근 후 공부했어요.

여러분도 할 수 있어요! 📚

궁금한 점 댓글로 물어보세요!
함께 공부해요! 🇻🇳`,
    author: VIETNAMESE_EXPERTS[30], // ve31
    category: '한국 교육·언어',
    votes: 634,
    views: 14567,
    commentCount: 103,
    createdAt: new Date(now - 70 * DAY).toISOString(),
    tags: ['TOPIK', '한국어', '시험', '학습가이드']
  },

  // === 한국 법률·권리 (1개) ===

  // ke2 - 산재 완벽 가이드 (한국인 노무사)
  {
    id: 'p10',
    type: 'post',
    title: '⚕️ 산재보험 완벽 가이드 (노무사가 알려주는 모든 것)',
    content: `노무사 김태희입니다.

산재 사고는 누구에게나 일어날 수 있습니다.
미리 알아두세요!

## 🎯 산재보험이란?

**정식 명칭: 산업재해보상보험**

업무 중 다치거나 병에 걸렸을 때
국가가 치료비와 생활비를 보상하는 제도

## ✅ 적용 대상

**모든 외국인 근로자 포함!**
- E-9, E-7, E-10 등
- 1인 이상 사업장
- 정규직, 계약직 모두
- 아르바이트도 가능

**⚠️ 예외:**
- 5인 미만 농업
- 가사근로자

## 🏥 보장 범위

### 업무상 재해

**업무 중 사고:**
- 공장에서 기계 사고
- 건설 현장 낙하
- 근무 중 화상
- 운전 중 사고

**출퇴근 재해:**
- 집 ↔ 회사
- 합리적 경로
- 합리적 방법
- **중요: 2018년부터 보장!**

**직업병:**
- 소음성 난청
- 진폐증
- 화학물질 노출
- 반복 작업 질환

### 보장되지 않는 경우

❌ 고의적 사고
❌ 술 마시고 사고
❌ 개인 용무 중
❌ 불법 행위

## 💰 급여 종류

### 1. 요양급여 (치료비)

**치료비 전액**
- 병원비
- 약값
- 수술비
- 입원비
- 검사비

**본인 부담: 0원!**

### 2. 휴업급여 (생활비)

**일 못하는 기간 보상**

**금액:**
- 평균임금의 **70%**
- 예: 월급 300만원 → 하루 7만원
- 계산: 300만원 ÷ 30일 × 70% = 7만원

**지급 기간:**
- 치료 기간 내내
- 최대 2년

### 3. 장해급여

**영구적 장해 시**

**장해 등급:**
- 1급 (가장 심함) → 14급 (가장 약함)

**지급 방법:**
- 연금 (1-3급)
- 일시금 (4-14급)

**금액 예시 (평균임금 10만원)**
- 1급: 평생 연금 (연 약 3,300만원)
- 7급: 일시금 약 1,680만원
- 14급: 일시금 약 135만원

### 4. 간병급여

**타인의 도움 필요 시**
- 상시 간병: 하루 약 6만원
- 수시 간병: 하루 약 3만원

### 5. 유족급여

**사망 시 유족에게**
- 유족연금
- 또는 유족일시금
- 장의비

## 📋 신청 방법

### 1단계: 즉시 대응 (사고 당일)

**반드시 할 것:**
□ 병원 가기 (응급실)
□ 회사에 알리기
□ 사고 상황 기록
  - 시간, 장소
  - 어떻게 다쳤는지
  - 목격자
□ 사진 찍기 (상처, 현장)

**⚠️ 주의:**
- 빨리 병원!
- 증거 확보!

### 2단계: 산재 신청 (3일 이내)

**방법 1: 회사 통해 신청 (정상)**
1. 회사에 "산재 처리 요청"
2. 회사가 서류 작성
3. 근로복지공단 제출

**방법 2: 직접 신청 (회사 거부 시)**
1. 근로복지공단 방문
2. "회사가 안 해줘요" 말하기
3. 본인이 직접 신청
4. **회사 동의 없어도 OK!**

### 3단계: 서류 제출

**필요 서류:**
□ 요양급여 청구서
  - 근로복지공단에서 받음
  - 병원에 있음
□ 진단서 (병원 발급)
□ 사고경위서 (본인 작성)
  - 언제, 어디서, 어떻게
□ 목격자 진술서 (동료)
□ 외국인등록증 사본

**작성 도움:**
- 근로복지공단 직원
- 베트남어 통역 가능

### 4단계: 승인 대기

**심사 기간:**
- 보통 2-3주
- 복잡하면 1-2개월

**승인 시:**
- 문자/전화 통보
- 치료 시작

**불승인 시:**
- 사유 확인
- 이의 신청 가능

## ⚠️ 주의사항

### 회사가 거부하는 이유

**회사 입장:**
- 산재율 올라감
- 보험료 인상
- 책임 부담

**하지만:**
❗ 회사가 거부해도
❗ 근로자는 신청 가능!
❗ 법적 권리!

### 절대 하지 말 것

❌ **일반 병원비로 처리**
- 나중에 산재 인정 어려움
- 돈 낭비

❌ **회사 눈치 보기**
- 정당한 권리
- 불이익 주면 불법!

❌ **참고 일하기**
- 악화될 수 있음
- 장해 커짐

## 💡 실전 팁

### 증거 확보가 핵심!

**사진:**
- 상처 (여러 각도)
- 사고 현장
- 안전 장비 상태

**문서:**
- 병원 진단서
- 응급실 기록
- 약 처방전

**증인:**
- 동료 연락처
- 목격자 진술

### 치료 중

**꼭 할 것:**
□ 정기 검진
□ 의사 지시 따르기
□ 치료 기록 보관
□ 휴업급여 신청

**하지 말 것:**
❌ 무단 결근
❌ 치료 중단
❌ 다른 일 하기

## 🔄 불승인 시 대응

### 이의신청

**절차:**
1. 불승인 통지서 받음
2. 90일 이내 이의신청
3. 산재심사위원회 심사
4. 재심사

**승인율:**
- 이의신청 승인율 약 30%
- 포기하지 말 것!

### 행정소송

**이의신청 기각 시:**
1. 산재심사위원회 제소
2. 무료 법률 지원
3. 승소 가능성 있음

## 📞 도움 받을 곳

### 긴급 상담

☎ **근로복지공단 콜센터**
- 번호: 1588-0075
- 24시간
- 베트남어 연결 요청

☎ **고용노동부 상담센터**
- 번호: 1350
- 산재 상담
- 베트남어 가능

### 법률 지원

⚖️ **대한법률구조공단**
- 번호: 132
- 무료 법률 상담
- 소송 지원

⚖️ **한국노총 법률원**
- 산재 전문 변호사
- 무료 상담

### 통역 지원

🗣️ **외국인력지원센터**
- 번호: 1644-0644
- 베트남어 통역
- 동행 지원

## 📊 통계 (알아두면 좋은 것)

**산재 승인율:**
- 전체: 약 80%
- 외국인: 약 75%

**평균 치료 기간:**
- 골절: 3-6개월
- 절단: 6-12개월
- 화상: 3-9개월

**평균 보상액:**
- 요양급여: 1,000-5,000만원
- 휴업급여: 500-2,000만원
- 장해급여: 1,000-1억원

## ✅ 체크리스트

### 사고 직후

□ 응급 처치
□ 병원 방문
□ 회사 통보
□ 사진 촬영
□ 목격자 확보

### 신청 시

□ 요양급여 청구서
□ 진단서
□ 사고경위서
□ 외국인등록증
□ 근로복지공단 제출

### 치료 중

□ 정기 진료
□ 휴업급여 신청
□ 치료 기록 보관
□ 회사 연락 유지

## 💼 직장 복귀

### 복귀 지원

**직업 재활:**
- 재활 훈련
- 직업 교육
- 취업 알선

**복귀 지원금:**
- 회사에 지원금
- 근로자 고용 장려

## ⚖️ 법적 보호

### 불이익 금지

**금지 행위:**
❌ 해고
❌ 임금 삭감
❌ 불리한 대우

**위반 시:**
- 형사 처벌
- 손해 배상

### 산재 신청 = 정당한 권리

**비자에 영향 없음!**
- E-9 비자 안전
- 연장 가능
- 이직 가능

## 🌟 실제 사례

### 사례 1: 기계 사고

**상황:**
- 베트남 근로자 A씨
- 공장 기계에 손가락 절단

**처리:**
- 즉시 병원
- 산재 신청
- 치료 6개월
- 장해 9급 인정

**보상:**
- 치료비: 2,500만원
- 휴업급여: 1,200만원
- 장해급여: 1,400만원
- **총 5,100만원**

### 사례 2: 출퇴근 재해

**상황:**
- 베트남 근로자 B씨
- 퇴근 중 오토바이 사고

**처리:**
- 출퇴근 경로 확인
- 산재 인정
- 치료 3개월

**보상:**
- 치료비: 800만원
- 휴업급여: 630만원
- **총 1,430만원**

## 마무리

산재는 예방이 최선이지만,
사고는 언제든 일어날 수 있습니다.

**알아야 보호받습니다!**

외국인이라고 포기하지 마세요.
똑같은 권리가 있습니다!

무료 상담 언제든 환영합니다.

📞 1588-0075 (근로복지공단)
⚖️ 132 (법률구조공단)`,
    author: KOREAN_EXPERTS[1], // ke2
    category: '한국 법률·권리',
    votes: 789,
    views: 17890,
    commentCount: 124,
    createdAt: new Date(now - 80 * DAY).toISOString(),
    tags: ['산재보험', '산업재해', '근로자권리', '전문가']
  },
]

// Helper 함수
export function getPostsByCategory(category: string): Post[] {
  if (!category) return MOCK_POSTS
  return MOCK_POSTS.filter(p => p.category === category)
}

// 카테고리별 질문 조회
export function getQuestionsByCategory(category: string): Question[] {
  if (!category) return MOCK_QUESTIONS
  return MOCK_QUESTIONS.filter(q => q.category === category)
}

// 토픽별 질문 조회
export function getQuestionsByTopic(topic: string): Question[] {
  if (!topic) return MOCK_QUESTIONS
  return MOCK_QUESTIONS.filter(q => q.topic === topic)
}

// 카테고리별 질문 개수
export function getQuestionCountByCategory(): Record<string, number> {
  return MOCK_QUESTIONS.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// 토픽별 질문 개수
export function getQuestionCountByTopic(): Record<string, number> {
  return MOCK_QUESTIONS.reduce((acc, q) => {
    if (q.topic) {
      acc[q.topic] = (acc[q.topic] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
}

// ============================================
// 배너 데이터 (미션/이벤트 캐러셀용)
// ============================================

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'banner1',
    title: '🎯 베타 오픈 챌린지 이벤트',
    description: '한국생활 질문에 답변하고 최대 50,000원 상품권 받아가세요! (~11월 30일)',
    linkUrl: '/missions',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'banner2',
    title: '✅ Certified User가 되어보세요',
    description: '실제 경험을 공유하고 커뮤니티에 기여하세요. 검증된 답변자로 인정받습니다.',
    linkUrl: '/experts/apply',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'banner3',
    title: '🎯 아하 답변 작성 챌린지 이벤트',
    description: '전문가 답변 10개 작성하고 10,000원 받아가세요! 9월 15일 ~ 10월 31일',
    linkUrl: '/events/visa-challenge',
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'banner4',
    title: '💡 생활 꿀팁 아카이브 업데이트',
    description: '보험, 의료, 주거 정보를 한눈에 정리한 신규 아카이브를 확인하세요.',
    linkUrl: '/posts',
    backgroundColor: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
  }
]
