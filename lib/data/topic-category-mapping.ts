/**
 * Topic to Category Mapping System
 * Maps short topic names from filter modal to full category names
 */

export interface TopicCategoryMapping {
  topic: string // Short topic name used in filter
  category: string // Full category name used in posts
  groupCategory: string // Group category (생활정보, 취업·경력, etc.)
  keywords: string[] // Additional keywords for fuzzy matching
}

/**
 * Complete mapping between filter topics and post categories
 */
export const TOPIC_CATEGORY_MAP: TopicCategoryMapping[] = [
  // 생활정보
  {
    topic: '비자',
    category: '한국 비자·체류',
    groupCategory: '생활정보',
    keywords: ['visa', '체류', '이민', '외국인등록증']
  },
  {
    topic: '주거',
    category: '한국에서 집 구하기',
    groupCategory: '생활정보',
    keywords: ['집', '전월세', '부동산', '계약', '임대']
  },
  {
    topic: '교통',
    category: '한국 생활 정착',
    groupCategory: '생활정보',
    keywords: ['지하철', '버스', '택시', '교통카드', 'T-money']
  },
  {
    topic: '은행',
    category: '베트남 송금·금융',
    groupCategory: '생활정보',
    keywords: ['은행', '계좌', '송금', '환전', '금융']
  },
  {
    topic: '통신',
    category: '한국 생활 정착',
    groupCategory: '생활정보',
    keywords: ['핸드폰', '휴대폰', '통신사', '유심', '인터넷']
  },
  {
    topic: '보험',
    category: '한국 의료 이용',
    groupCategory: '생활정보',
    keywords: ['건강보험', '의료보험', '국민건강보험', '병원']
  },

  // 취업·경력
  {
    topic: '구직',
    category: '한국 직장생활',
    groupCategory: '취업·경력',
    keywords: ['일자리', '취업', '채용', '구인', '알바']
  },
  {
    topic: '이력서',
    category: '한국 직장생활',
    groupCategory: '취업·경력',
    keywords: ['이력서', '자기소개서', '포트폴리오', '이력']
  },
  {
    topic: '면접',
    category: '한국 직장생활',
    groupCategory: '취업·경력',
    keywords: ['면접', '인터뷰', '취업준비']
  },
  {
    topic: '회사생활',
    category: '한국 직장생활',
    groupCategory: '취업·경력',
    keywords: ['직장', '회사', '업무', '동료', '상사']
  },
  {
    topic: '노동법',
    category: '외국인 근로자 권리',
    groupCategory: '취업·경력',
    keywords: ['근로계약', '임금', '해고', '권리', '법률']
  },
  {
    topic: '창업',
    category: '한국에서 창업하기',
    groupCategory: '취업·경력',
    keywords: ['사업', '창업', '자영업', '사업자등록']
  },

  // 한국어·교육
  {
    topic: '한국어학습',
    category: '한국어 배우기',
    groupCategory: '한국어·교육',
    keywords: ['한국어', '언어', '공부', '학습']
  },
  {
    topic: 'TOPIK',
    category: '한국어 배우기',
    groupCategory: '한국어·교육',
    keywords: ['토픽', '한국어능력시험', '시험']
  },
  {
    topic: '유학',
    category: '다문화 가정 육아',
    groupCategory: '한국어·교육',
    keywords: ['대학', '학교', '유학생', '입학']
  },
  {
    topic: '장학금',
    category: '다문화 가정 육아',
    groupCategory: '한국어·교육',
    keywords: ['장학금', '학비', '지원금']
  },
  {
    topic: '학교생활',
    category: '다문화 가정 육아',
    groupCategory: '한국어·교육',
    keywords: ['학교', '교육', '학습', '학생']
  },
  {
    topic: '자격증',
    category: '한국 직장생활',
    groupCategory: '한국어·교육',
    keywords: ['자격증', '면허', '인증', '시험']
  },

  // 문화·여가
  {
    topic: '음식',
    category: '베트남 음식·물품',
    groupCategory: '문화·여가',
    keywords: ['음식', '식당', '요리', '베트남음식', '마트']
  },
  {
    topic: '여행',
    category: '한국 문화 탐방',
    groupCategory: '문화·여가',
    keywords: ['여행', '관광', '여행지', '축제']
  },
  {
    topic: '문화체험',
    category: '한국 문화 탐방',
    groupCategory: '문화·여가',
    keywords: ['문화', '체험', '전통', '행사']
  },
  {
    topic: '친구만들기',
    category: '한국 생활 정착',
    groupCategory: '문화·여가',
    keywords: ['친구', '커뮤니티', '모임', '사교']
  },
  {
    topic: '데이트',
    category: '한국 문화 탐방',
    groupCategory: '문화·여가',
    keywords: ['데이트', '연애', '만남', '이성']
  },
  {
    topic: '취미',
    category: '한국 문화 탐방',
    groupCategory: '문화·여가',
    keywords: ['취미', '여가', '레저', '운동']
  }
]

/**
 * Get category name from topic
 */
export function getCategoryFromTopic(topic: string): string | null {
  const mapping = TOPIC_CATEGORY_MAP.find(m => m.topic === topic)
  return mapping ? mapping.category : null
}

/**
 * Get all categories from selected topics
 */
export function getCategoriesFromTopics(topics: string[]): string[] {
  const categories = topics
    .map(topic => getCategoryFromTopic(topic))
    .filter((cat): cat is string => cat !== null)

  // Return unique categories
  return Array.from(new Set(categories))
}

/**
 * Get topic from category name (reverse lookup)
 */
export function getTopicFromCategory(category: string): string | null {
  const mapping = TOPIC_CATEGORY_MAP.find(m => m.category === category)
  return mapping ? mapping.topic : null
}

/**
 * Check if a question matches selected topics
 */
export function questionMatchesTopics(
  questionCategory: string,
  selectedTopics: string[]
): boolean {
  if (selectedTopics.length === 0) return true

  const matchingCategories = getCategoriesFromTopics(selectedTopics)
  return matchingCategories.includes(questionCategory)
}

/**
 * Get all unique categories (for dropdown)
 */
export function getAllCategories(): string[] {
  const categories = TOPIC_CATEGORY_MAP.map(m => m.category)
  return Array.from(new Set(categories))
}

/**
 * Get category group
 */
export function getCategoryGroup(category: string): string | null {
  const mapping = TOPIC_CATEGORY_MAP.find(m => m.category === category)
  return mapping ? mapping.groupCategory : null
}
