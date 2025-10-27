import { NextRequest, NextResponse } from 'next/server'

// 임시 mock 데이터 - 실제 DB 연결 시 교체
const mockQuestions = [
  {
    id: '1',
    title: '비자 연장 관련 질문입니다',
    content: '현재 E-2 비자를 가지고 있는데 연장 신청을 어떻게 해야 하나요? 필요한 서류가 무엇인지 알고 싶습니다.',
    category: { name: '비자', slug: 'visa' },
    author: { name: '김민수' },
    answer_count: 3,
    view_count: 125,
    created_at: '2024-01-15T09:30:00Z',
    status: 'open'
  },
  {
    id: '2', 
    title: '한국에서 취업비자 신청 방법',
    content: '대학 졸업 후 한국에서 취업하고 싶은데 어떤 비자를 신청해야 하나요?',
    category: { name: '취업', slug: 'employment' },
    author: { name: '박지영' },
    answer_count: 7,
    view_count: 234,
    created_at: '2024-01-14T14:20:00Z',
    status: 'resolved'
  },
  {
    id: '3',
    title: '건강보험 가입 문의',
    content: '외국인도 국민건강보험에 가입할 수 있나요? 절차가 어떻게 되는지 궁금합니다.',
    category: { name: '의료', slug: 'healthcare' },
    author: { name: '레투안' },
    answer_count: 5,
    view_count: 189,
    created_at: '2024-01-13T11:45:00Z',
    status: 'open'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 })
    }

    // 간단한 텍스트 검색 (실제로는 DB에서 LIKE 쿼리나 전문검색 사용)
    const results = mockQuestions.filter(question => 
      question.title.toLowerCase().includes(query.toLowerCase()) ||
      question.content.toLowerCase().includes(query.toLowerCase()) ||
      question.category.name.includes(query)
    )

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
      total: results.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}