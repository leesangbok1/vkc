// Mock Category and Topic Data for VietKConnect
// 한국 거주 베트남인을 위한 맞춤형 카테고리 및 토픽
import { Category, Topic, HotTopic } from '@/lib/types/category';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: '한국 비자·체류',
    icon: '🛂',
    slug: 'visa',
    description: '비자 신청·연장, 체류 자격 변경 (베트남인)',
    topicCount: 28,
    questionCount: 1845,
    color: '#3b82f6'
  },
  {
    id: '2',
    name: '한국 직장생활',
    icon: '💼',
    slug: 'employment',
    description: '취업, 한국 직장 문화, 근로계약 가이드',
    topicCount: 35,
    questionCount: 2134,
    color: '#8b5cf6'
  },
  {
    id: '3',
    name: '한국에서 집 구하기',
    icon: '🏠',
    slug: 'housing',
    description: '전월세 계약, 외국인 주거 정보',
    topicCount: 42,
    questionCount: 2567,
    color: '#f59e0b'
  },
  {
    id: '4',
    name: '한국어 배우기',
    icon: '📚',
    slug: 'korean-language',
    description: '베트남어 화자를 위한 한국어 학습',
    topicCount: 31,
    questionCount: 1923,
    color: '#10b981'
  },
  {
    id: '5',
    name: '한국 생활 정착',
    icon: '🌏',
    slug: 'daily-life',
    description: '한국 생활 초기 적응, 문화 차이 극복',
    topicCount: 48,
    questionCount: 3245,
    color: '#06b6d4'
  },
  {
    id: '6',
    name: '베트남 송금·금융',
    icon: '💰',
    slug: 'finance',
    description: '베트남 송금, 한국 은행 이용법',
    topicCount: 25,
    questionCount: 1456,
    color: '#eab308'
  },
  {
    id: '7',
    name: '한국 의료 이용',
    icon: '🏥',
    slug: 'healthcare',
    description: '병원 이용법, 건강보험 가입',
    topicCount: 33,
    questionCount: 1987,
    color: '#ef4444'
  },
  {
    id: '8',
    name: '외국인 근로자 권리',
    icon: '⚖️',
    slug: 'legal',
    description: '법률 상담, 권리 보호, 분쟁 해결',
    topicCount: 22,
    questionCount: 1234,
    color: '#64748b'
  },
  {
    id: '9',
    name: '베트남 음식·물품',
    icon: '🍜',
    slug: 'food',
    description: '한국 내 베트남 식당·마트 정보',
    topicCount: 38,
    questionCount: 2345,
    color: '#f97316'
  },
  {
    id: '10',
    name: '한국 문화 탐방',
    icon: '🎎',
    slug: 'culture-tour',
    description: '한국 문화 체험, 여행지 추천',
    topicCount: 29,
    questionCount: 1678,
    color: '#8b5cf6'
  },
  {
    id: '11',
    name: '한국에서 창업하기',
    icon: '🏢',
    slug: 'business',
    description: '외국인 창업, 사업자 등록',
    topicCount: 18,
    questionCount: 987,
    color: '#6366f1'
  },
  {
    id: '12',
    name: '다문화 가정 육아',
    icon: '👶',
    slug: 'education',
    description: '자녀 교육, 다문화 가정 지원',
    topicCount: 26,
    questionCount: 1456,
    color: '#ec4899'
  },
  {
    id: '13',
    name: '베트남 물품 배송',
    icon: '📦',
    slug: 'shipping',
    description: '한국→베트남 배송, 베트남 물품 구매',
    topicCount: 21,
    questionCount: 1123,
    color: '#f59e0b'
  },
  {
    id: '14',
    name: '한-베 문화 교류',
    icon: '🎉',
    slug: 'cultural-exchange',
    description: '베트남 커뮤니티, 문화 행사',
    topicCount: 15,
    questionCount: 876,
    color: '#10b981'
  }
];

export const TOPICS: Record<string, Topic[]> = {
  visa: [
    { id: 'visa-1', name: '베트남인 비자 연장 절차', slug: 'visa-extension', categoryId: '1', questionCount: 456, followersCount: 1234 },
    { id: 'visa-2', name: 'E-9 비전문취업 (제조업)', slug: 'e9-visa', categoryId: '1', questionCount: 389, followersCount: 987 },
    { id: 'visa-3', name: 'D-2 유학비자 (베트남 학생)', slug: 'd2-visa', categoryId: '1', questionCount: 312, followersCount: 756 },
    { id: 'visa-4', name: 'F-6 결혼이민자 비자', slug: 'f6-visa', categoryId: '1', questionCount: 278, followersCount: 645 },
    { id: 'visa-5', name: 'H-2 방문취업 (동포)', slug: 'h2-visa', categoryId: '1', questionCount: 234, followersCount: 543 },
    { id: 'visa-6', name: '체류자격 변경 (베트남인)', slug: 'status-change', categoryId: '1', questionCount: 176, followersCount: 421 }
  ],
  employment: [
    { id: 'emp-1', name: '베트남인 일자리 구하기', slug: 'job-search', categoryId: '2', questionCount: 523, followersCount: 1456 },
    { id: 'emp-2', name: '한국 회사 근로계약서 이해하기', slug: 'employment-contract', categoryId: '2', questionCount: 467, followersCount: 1289 },
    { id: 'emp-3', name: '한국 직장 예절·문화', slug: 'workplace-culture', categoryId: '2', questionCount: 398, followersCount: 1087 },
    { id: 'emp-4', name: '외국인 근로자 임금·수당', slug: 'salary-benefits', categoryId: '2', questionCount: 345, followersCount: 934 },
    { id: 'emp-5', name: '직장 내 차별·부당대우', slug: 'workplace-issues', categoryId: '2', questionCount: 301, followersCount: 756 }
  ],
  housing: [
    { id: 'house-1', name: '외국인도 가능한 전월세', slug: 'rent', categoryId: '3', questionCount: 612, followersCount: 1678 },
    { id: 'house-2', name: '부동산 계약서 해석 (베트남어)', slug: 'contract', categoryId: '3', questionCount: 534, followersCount: 1456 },
    { id: 'house-3', name: '보증금 안전하게 돌려받기', slug: 'deposit-return', categoryId: '3', questionCount: 456, followersCount: 1234 },
    { id: 'house-4', name: '외국인 임대 사기 예방', slug: 'fraud-prevention', categoryId: '3', questionCount: 387, followersCount: 987 },
    { id: 'house-5', name: '베트남인 많이 사는 지역', slug: 'viet-community-area', categoryId: '3', questionCount: 298, followersCount: 756 }
  ],
  'korean-language': [
    { id: 'lang-1', name: 'TOPIK 준비 (베트남어 자료)', slug: 'topik', categoryId: '4', questionCount: 456, followersCount: 1345 },
    { id: 'lang-2', name: '베트남어→한국어 무료 강좌', slug: 'free-course', categoryId: '4', questionCount: 389, followersCount: 1098 },
    { id: 'lang-3', name: '직장에서 쓰는 한국어', slug: 'workplace-korean', categoryId: '4', questionCount: 312, followersCount: 876 },
    { id: 'lang-4', name: '한국어 발음 교정', slug: 'pronunciation', categoryId: '4', questionCount: 267, followersCount: 654 },
    { id: 'lang-5', name: '한국어 능력시험 준비', slug: 'certification', categoryId: '4', questionCount: 499, followersCount: 1123 }
  ],
  'daily-life': [
    { id: 'life-1', name: '한국 지하철·버스 이용법', slug: 'transportation', categoryId: '5', questionCount: 678, followersCount: 1876 },
    { id: 'life-2', name: '외국인 핸드폰 개통 가이드', slug: 'telecom', categoryId: '5', questionCount: 567, followersCount: 1543 },
    { id: 'life-3', name: '한국 생활 적응 팁', slug: 'adaptation-tips', categoryId: '5', questionCount: 789, followersCount: 2134 },
    { id: 'life-4', name: '한-베 문화 차이 이해하기', slug: 'culture-difference', categoryId: '5', questionCount: 456, followersCount: 1234 },
    { id: 'life-5', name: '한국 4계절 날씨 대비', slug: 'weather-season', categoryId: '5', questionCount: 355, followersCount: 987 }
  ],
  finance: [
    { id: 'fin-1', name: '외국인 은행계좌 만들기', slug: 'bank-account', categoryId: '6', questionCount: 445, followersCount: 1234 },
    { id: 'fin-2', name: '한국→베트남 송금 저렴하게', slug: 'remittance', categoryId: '6', questionCount: 523, followersCount: 1567 },
    { id: 'fin-3', name: '외국인 근로자 세금 환급', slug: 'tax-refund', categoryId: '6', questionCount: 298, followersCount: 876 },
    { id: 'fin-4', name: '체크카드·신용카드 발급', slug: 'card', categoryId: '6', questionCount: 190, followersCount: 543 }
  ]
};

export const HOT_TOPICS: HotTopic[] = [
  { id: 'hot-1', name: '베트남인 비자 연장 필수 서류', category: '한국 비자·체류', trend: 'hot', questionCount: 456 },
  { id: 'hot-2', name: '외국인 전월세 사기 예방법', category: '한국에서 집 구하기', trend: 'rising', questionCount: 612 },
  { id: 'hot-3', name: 'TOPIK 준비 (베트남어 자료)', category: '한국어 배우기', trend: 'hot', questionCount: 456 },
  { id: 'hot-4', name: '한국→베트남 저렴한 송금', category: '베트남 송금·금융', trend: 'new', questionCount: 523 },
  { id: 'hot-5', name: '한국 직장 예절 가이드', category: '한국 직장생활', trend: 'rising', questionCount: 467 }
];
