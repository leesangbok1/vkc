#!/usr/bin/env tsx

/**
 * 베트남 특화 목업 데이터 생성 스크립트
 * Agent 7 구현 - Viet K-Connect 커뮤니티 데이터
 */

import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config({ path: '.env.local' })

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// 베트남 특화 카테고리 데이터
const vietnamCategories = [
  { name: '비자/체류', slug: 'visa', icon: '📄', color: '#EA4335', description: '비자 신청, 연장, 체류 관련 정보' },
  { name: '취업/근로', slug: 'work', icon: '💼', color: '#4285F4', description: '구직, 취업, 근로계약 관련 정보' },
  { name: '생활정보', slug: 'life', icon: '🏠', color: '#34A853', description: '일상생활, 주거, 생활팁' },
  { name: '교육/학업', slug: 'education', icon: '📚', color: '#FBBC04', description: '대학, 어학원, 교육 정보' },
  { name: '의료/건강', slug: 'health', icon: '🏥', color: '#FF6D01', description: '병원, 보험, 건강 관리' },
  { name: '금융/세금', slug: 'finance', icon: '💰', color: '#9C27B0', description: '은행, 세금, 금융 서비스' },
  { name: '교통/여행', slug: 'transport', icon: '🚌', color: '#FF5722', description: '교통수단, 여행, 항공편' },
  { name: '법률/행정', slug: 'legal', icon: '⚖️', color: '#607D8B', description: '법률 상담, 행정 절차' },
  { name: '문화/언어', slug: 'culture', icon: '🎭', color: '#E91E63', description: '한국 문화, 언어 학습' },
  { name: '음식/맛집', slug: 'food', icon: '🍜', color: '#795548', description: '베트남 음식, 맛집 추천' }
]

// 베트남 관련 질문 템플릿
const questionTemplates = [
  // 비자/체류
  '베트남에서 한국 비자 {visa_type} 신청하는 방법이 궁금해요',
  '비자 연장 시 필요한 서류는 무엇인가요?',
  '{region}에서 외국인등록 하는 곳 알려주세요',
  '관광비자로 입국해서 학생비자 변경 가능한가요?',
  'E-7 비자에서 F-2 비자로 변경하려면 어떻게 해야 하나요?',

  // 취업/근로
  '{region}에서 베트남어 가능한 일자리 찾고 있어요',
  '한국 회사에서 일할 때 주의할 점이 있을까요?',
  '최저임금이 얼마인지 알고 싶어요',
  '근로계약서 작성 시 확인해야 할 사항은?',
  '베트남 사람들이 많이 하는 일이 뭐가 있나요?',

  // 생활정보
  '{region}에서 원룸 구할 때 팁 좀 알려주세요',
  '한국 생활 적응하는데 어려운 점은 뭔가요?',
  '베트남 음식 재료는 어디서 사나요?',
  '한국 휴대폰 개통 방법 알려주세요',
  '전세보증금 돌려받는 방법이 궁금해요',

  // 교육/학업
  '한국어 무료로 배울 수 있는 곳 있나요?',
  '대학교 입학 절차가 어떻게 되나요?',
  'TOPIK 시험 준비 어떻게 하셨나요?',
  '학비 지원받을 수 있는 제도 있나요?',
  '야간 한국어 수업 추천해주세요',

  // 의료/건강
  '베트남어 가능한 병원 {region}에 있나요?',
  '건강보험 가입 방법 알려주세요',
  '응급실 이용할 때 준비할 것들이 뭐가 있나요?',
  '임신했는데 어떤 병원 가야 하나요?',
  '치과 치료비가 너무 비싼데 저렴한 곳 있나요?',

  // 금융/세금
  '외국인 은행 계좌 개설 어떻게 하나요?',
  '베트남으로 송금하는 좋은 방법 있나요?',
  '세금 신고 어떻게 하는지 모르겠어요',
  '신용카드 만들고 싶은데 조건이 어떻게 되나요?',
  '적금 넣기 좋은 은행 추천해주세요',

  // 교통/여행
  '지하철 이용법 자세히 알려주세요',
  '베트남 항공편 예약할 때 주의사항은?',
  '버스 타는 방법이 복잡해서 어려워요',
  '택시 요금이 너무 비싼데 다른 방법 없나요?',
  '기차표 예매 어떻게 하나요?',

  // 법률/행정
  '교통사고 났을 때 어떻게 해야 하나요?',
  '임금을 못 받았는데 어디에 신고하나요?',
  '계약서 내용을 잘 모르겠어요',
  '법률 상담 무료로 받을 수 있는 곳 있나요?',
  '주민등록등본 발급 받는 방법은?',

  // 문화/언어
  '한국 문화 중 이해하기 어려운 것들이 있어요',
  '한국어 발음 연습하는 좋은 방법 있나요?',
  '한국 친구들과 친해지는 방법이 궁금해요',
  '예의범절 배우고 싶어요',
  '한국 드라마로 한국어 공부 효과 있나요?',

  // 음식/맛집
  '{region}에서 베트남 쌀국수 맛있는 집 어디인가요?',
  '한국 음식 중에 매운 걸 못 먹는데 추천해주세요',
  '베트남 식재료 파는 마트 위치 알려주세요',
  '월남쌈 만들 재료는 어디서 사나요?',
  '한국에서 베트남 커피 마실 수 있는 곳 있나요?'
]

// 베트남 사용자 프로필 데이터
const vietnamUserProfiles = {
  visaTypes: ['E-1', 'E-2', 'E-7', 'F-2', 'F-4', 'F-5', 'D-2', 'D-4', 'H-2'],
  companies: [
    '삼성전자', 'LG전자', '현대자동차', 'SK하이닉스', 'POSCO',
    'CJ그룹', '롯데그룹', '한화그룹', 'GS그룹', '두산그룹',
    '교보생명', '신한은행', 'KB국민은행', '하나은행', 'NH농협',
    '대우조선해양', '한국전력', 'KT', 'SKT', 'LG유플러스',
    '카카오', '네이버', '쿠팡', '배달의민족', '당근마켓'
  ],
  regions: [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ],
  names: [
    '응웬반투', '짠티란', '레반남', '팜티후에', '부이티옥',
    '호앙반남', '당티린', '도반두크', '팜반하이', '응웬티마이',
    '레티투', '호앙티탄', '응웬반호앙', '팜반투', '부이반타인',
    '짠반튀엔', '응웬티흐엉', '레반룽', '팜티화', '호앙반퀀'
  ]
}

// 답변 템플릿 (경험담 포함)
const answerTemplates = [
  '제가 직접 해본 경험을 말씀드리면, {action}. 처음에는 어려웠는데 {tip}하니까 훨씬 쉬워졌어요.',
  '{years}년 한국에서 살면서 배운 건데, {advice}. 특히 {detail}는 꼭 기억하세요.',
  '저도 같은 문제로 고생했어요. {solution}으로 해결했습니다. {result}이었어요.',
  '{location}에서 {experience}했던 경험이 있어서 답변드려요. {recommendation}하시면 됩니다.',
  '한국 생활 {years}년차인데, {insight}. 다른 베트남 분들도 비슷한 경험을 하셨을 거예요.',
  '회사에서 {work_experience}하면서 알게 된 정보예요. {practical_info}하시면 도움이 될 거예요.',
  '최근에 {recent_experience}해봤는데, {process}이었어요. {final_tip}도 참고하세요.',
  '{region} 거주 중인데, 여기서는 {local_info}. 지역마다 조금씩 다를 수 있어요.',
  '친구가 {friend_experience}했다고 하더라고요. {shared_knowledge}라고 하니 참고하세요.',
  '인터넷에서 찾은 정보보다는 {direct_method}가 더 확실해요. {verification}로 확인해보세요.'
]

// 유틸리티 함수들
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function replaceTemplateVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] || match)
}

// 배치 삽입 함수
async function insertInBatches<T>(
  table: string,
  data: T[],
  batchSize: number = 100
): Promise<void> {
  console.log(`📦 Inserting ${data.length} records into ${table} in batches of ${batchSize}`)

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from(table).insert(batch)

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      throw error
    }

    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} completed`)
  }
}

// 메인 데이터 생성 함수
async function generateMockData() {
  console.log('🚀 Starting Vietnamese K-Connect Mock Data Generation...')
  console.log('=' * 60)

  try {
    // 1. 카테고리 생성
    console.log('📁 Creating categories...')
    await supabase.from('categories').delete().neq('id', 0) // 기존 데이터 정리
    await insertInBatches('categories', vietnamCategories)

    // 카테고리 ID 가져오기
    const { data: categories } = await supabase.from('categories').select('id, slug')
    const categoryMap = categories?.reduce((map, cat) => {
      map[cat.slug] = cat.id
      return map
    }, {} as Record<string, number>) || {}

    // 2. 사용자 생성 (150명)
    console.log('👥 Creating users...')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000') // 기존 데이터 정리

    const users = Array.from({ length: 150 }, (_, i) => {
      const name = vietnamUserProfiles.names[i % vietnamUserProfiles.names.length]
      const region = faker.helpers.arrayElement(vietnamUserProfiles.regions)
      const visaType = faker.helpers.arrayElement(vietnamUserProfiles.visaTypes)
      const company = faker.helpers.arrayElement(vietnamUserProfiles.companies)
      const yearsInKorea = faker.number.int({ min: 0, max: 10 })

      return {
        id: faker.string.uuid(),
        email: `${name.toLowerCase().replace(/\s+/g, '')}${i}@example.com`,
        name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        bio: `${region} 거주 ${yearsInKorea}년차 베트남 사람입니다. ${company}에서 일하고 있어요.`,
        provider: faker.helpers.arrayElement(['google', 'kakao']),
        provider_id: faker.string.alphanumeric(10),
        visa_type: visaType,
        company,
        years_in_korea: yearsInKorea,
        region,
        preferred_language: 'ko',
        is_verified: faker.datatype.boolean(0.3), // 30% 인증됨
        trust_score: faker.number.int({ min: 10, max: 100 }),
        badges: {
          senior: yearsInKorea >= 5,
          expert: faker.datatype.boolean(0.1),
          verified: faker.datatype.boolean(0.3),
          helper: faker.datatype.boolean(0.2)
        },
        question_count: 0,
        answer_count: 0,
        helpful_answer_count: 0,
        created_at: faker.date.recent({ days: 365 }).toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    await insertInBatches('users', users)

    // 사용자 ID 목록 가져오기
    const { data: createdUsers } = await supabase.from('users').select('id')
    const userIds = createdUsers?.map(u => u.id) || []

    // 3. 질문 생성 (600개)
    console.log('❓ Creating questions...')
    await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const questions = Array.from({ length: 600 }, (_, i) => {
      const template = faker.helpers.arrayElement(questionTemplates)
      const category = faker.helpers.arrayElement(Object.keys(categoryMap))
      const region = faker.helpers.arrayElement(vietnamUserProfiles.regions)
      const visaType = faker.helpers.arrayElement(vietnamUserProfiles.visaTypes)

      const title = replaceTemplateVars(template, {
        region,
        visa_type: visaType,
        location: region
      })

      const content = `안녕하세요. ${title}에 대해 자세히 알고 싶습니다.\n\n` +
        `현재 ${region}에 거주하고 있고, ${faker.helpers.arrayElement(vietnamUserProfiles.visaTypes)} 비자로 체류 중입니다.\n` +
        `도움 주시면 정말 감사하겠습니다.`

      const tags = getRandomElements([
        '베트남', '한국생활', region, category,
        '외국인', '정보', '도움', '경험담'
      ], faker.number.int({ min: 2, max: 5 }))

      return {
        id: faker.string.uuid(),
        title,
        content,
        author_id: faker.helpers.arrayElement(userIds),
        category_id: categoryMap[category],
        tags,
        urgency: faker.helpers.arrayElement(['low', 'normal', 'high']),
        status: faker.helpers.arrayElement(['open', 'open', 'open', 'solved']), // 75% open
        is_anonymous: faker.datatype.boolean(0.1),
        view_count: faker.number.int({ min: 1, max: 1000 }),
        vote_score: faker.number.int({ min: -5, max: 50 }),
        answer_count: 0,
        created_at: faker.date.recent({ days: 90 }).toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    await insertInBatches('questions', questions)

    // 질문 ID 목록 가져오기
    const { data: createdQuestions } = await supabase.from('questions').select('id')
    const questionIds = createdQuestions?.map(q => q.id) || []

    // 4. 답변 생성 (1,500개)
    console.log('💬 Creating answers...')
    await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const answers = Array.from({ length: 1500 }, (_, i) => {
      const template = faker.helpers.arrayElement(answerTemplates)
      const years = faker.number.int({ min: 1, max: 8 })
      const region = faker.helpers.arrayElement(vietnamUserProfiles.regions)

      const content = replaceTemplateVars(template, {
        action: '필요한 서류를 준비하고 직접 방문했어요',
        tip: '미리 전화로 문의',
        years: years.toString(),
        advice: '차근차근 준비하시면 어렵지 않아요',
        detail: '서류 미리 준비하는 것',
        solution: '인터넷 예약',
        result: '시간도 절약되고 편했어요',
        location: region,
        experience: '같은 일을',
        recommendation: '온라인으로 미리 신청',
        insight: '처음에는 어려워도 익숙해져요',
        work_experience: '비슷한 업무를',
        practical_info: '미리 준비',
        recent_experience: '이것을',
        process: '생각보다 간단',
        final_tip: '서류 미리 준비하는 것',
        local_info: '이런 방법을 많이 써요',
        friend_experience: '같은 경험을',
        shared_knowledge: '이렇게 하면 된다',
        direct_method: '직접 가서 확인하는 것',
        verification: '공식 홈페이지'
      })

      return {
        id: faker.string.uuid(),
        content,
        question_id: faker.helpers.arrayElement(questionIds),
        author_id: faker.helpers.arrayElement(userIds),
        is_anonymous: faker.datatype.boolean(0.05),
        vote_score: faker.number.int({ min: 0, max: 30 }),
        is_helpful: faker.datatype.boolean(0.4),
        is_accepted: faker.datatype.boolean(0.1),
        created_at: faker.date.recent({ days: 85 }).toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    await insertInBatches('answers', answers)

    // 답변 ID 목록 가져오기
    const { data: createdAnswers } = await supabase.from('answers').select('id')
    const answerIds = createdAnswers?.map(a => a.id) || []

    // 5. 투표 생성 (2,000개)
    console.log('👍 Creating votes...')
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const votes = Array.from({ length: 2000 }, () => {
      const targetType = faker.helpers.arrayElement(['question', 'answer'])
      const targetId = targetType === 'question'
        ? faker.helpers.arrayElement(questionIds)
        : faker.helpers.arrayElement(answerIds)

      return {
        id: faker.string.uuid(),
        target_id: targetId,
        target_type: targetType,
        user_id: faker.helpers.arrayElement(userIds),
        vote_type: faker.helpers.arrayElement(['up', 'up', 'up', 'down']), // 75% 추천
        created_at: faker.date.recent({ days: 80 }).toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    await insertInBatches('votes', votes)

    // 6. 댓글 생성 (500개)
    console.log('💭 Creating comments...')
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const comments = Array.from({ length: 500 }, () => {
      const commentTexts = [
        '정말 도움이 되는 정보네요. 감사합니다!',
        '저도 같은 경험이 있어서 공감해요.',
        '혹시 더 자세한 정보 알 수 있을까요?',
        '이런 정보 정말 찾고 있었어요.',
        '정말 유용한 답변이에요. 추천합니다!',
        '저도 비슷한 상황인데 도움이 됐어요.',
        '감사합니다. 참고하겠습니다.',
        '이런 경험담 더 많이 공유해주세요!'
      ]

      return {
        id: faker.string.uuid(),
        content: faker.helpers.arrayElement(commentTexts),
        target_id: faker.helpers.arrayElement([...questionIds, ...answerIds]),
        target_type: faker.helpers.arrayElement(['question', 'answer']),
        author_id: faker.helpers.arrayElement(userIds),
        parent_id: null,
        created_at: faker.date.recent({ days: 75 }).toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    await insertInBatches('comments', comments)

    // 7. 북마크 생성 (300개)
    console.log('🔖 Creating bookmarks...')
    await supabase.from('bookmarks').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const bookmarks = Array.from({ length: 300 }, () => ({
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(userIds),
      target_id: faker.helpers.arrayElement(questionIds),
      target_type: 'question' as const,
      created_at: faker.date.recent({ days: 70 }).toISOString()
    }))

    await insertInBatches('bookmarks', bookmarks)

    // 8. 알림 생성 (400개)
    console.log('🔔 Creating notifications...')
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const notifications = Array.from({ length: 400 }, () => {
      const types = ['answer', 'comment', 'vote', 'mention']
      const type = faker.helpers.arrayElement(types)

      const titles = {
        answer: '새로운 답변이 등록되었습니다',
        comment: '새로운 댓글이 달렸습니다',
        vote: '회원님의 글에 추천을 받았습니다',
        mention: '회원님이 언급되었습니다'
      }

      return {
        id: faker.string.uuid(),
        user_id: faker.helpers.arrayElement(userIds),
        type,
        title: titles[type as keyof typeof titles],
        message: `회원님의 질문에 새로운 활동이 있습니다.`,
        data: {
          question_id: faker.helpers.arrayElement(questionIds),
          from_user: faker.helpers.arrayElement(userIds)
        },
        is_read: faker.datatype.boolean(0.6),
        created_at: faker.date.recent({ days: 65 }).toISOString()
      }
    })

    await insertInBatches('notifications', notifications)

    console.log('\n🎉 Mock data generation completed successfully!')
    console.log('=' * 60)
    console.log('📊 Generated Data Summary:')
    console.log(`📁 Categories: ${vietnamCategories.length}`)
    console.log(`👥 Users: ${users.length}`)
    console.log(`❓ Questions: ${questions.length}`)
    console.log(`💬 Answers: ${answers.length}`)
    console.log(`👍 Votes: ${votes.length}`)
    console.log(`💭 Comments: ${comments.length}`)
    console.log(`🔖 Bookmarks: ${bookmarks.length}`)
    console.log(`🔔 Notifications: ${notifications.length}`)
    console.log('=' * 60)

  } catch (error) {
    console.error('❌ Error generating mock data:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  generateMockData()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}