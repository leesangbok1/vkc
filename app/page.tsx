import { HomeLayout } from '@/components/layout/ResponsiveLayout'
import { QuestionCard } from '@/components/questions/QuestionCard'
import DynamicAIMatchingFlow from '@/components/dynamic/DynamicAIMatchingFlow'

// Mock data for demonstration
const mockQuestions = [
  {
    id: 1,
    title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
    content: '회사에서 E-7 비자 신청을 도와준다고 하는데, 제가 준비해야 할 서류들이 무엇인지 알고 싶습니다. 특히 베트남에서 가져와야 하는 서류가 있을까요?',
    tags: ['E-7비자', '서류', '취업'],
    urgency: 'high',
    view_count: 45,
    answer_count: 3,
    upvote_count: 12,
    downvote_count: 0,
    status: 'open',
    is_pinned: false,
    is_featured: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    author: {
      id: 1,
      name: '레투안',
      avatar_url: '',
      trust_score: 324,
      residence_years: 3,
      badges: { verified: true },
      email: '',
      created_at: '',
      updated_at: ''
    },
    category: {
      id: 1,
      name: '비자/법률',
      slug: 'visa',
      color: '#4285F4',
      created_at: '',
      updated_at: ''
    },
    _count: { count: 3 }
  },
  {
    id: 2,
    title: '서울에서 저렴한 원룸 구하는 방법',
    content: '대학원생이라 예산이 많지 않은데, 서울에서 월 40만원 정도로 살 수 있는 원룸이 있을까요? 어떤 지역을 추천하시나요?',
    tags: ['원룸', '부동산', '서울', '대학원생'],
    urgency: 'normal',
    view_count: 89,
    answer_count: 7,
    upvote_count: 23,
    downvote_count: 1,
    status: 'resolved',
    is_pinned: false,
    is_featured: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
    author: {
      id: 2,
      name: '팜티란',
      avatar_url: '',
      trust_score: 567,
      residence_years: 4,
      badges: { verified: true },
      email: '',
      created_at: '',
      updated_at: ''
    },
    category: {
      id: 2,
      name: '주거/부동산',
      slug: 'housing',
      color: '#9C27B0',
      created_at: '',
      updated_at: ''
    },
    _count: { count: 7 }
  },
  {
    id: 3,
    title: '한국 회사 면접 준비 팁',
    content: '다음 주에 한국 회사 면접이 있는데, 베트남과 다른 문화적 차이점이나 준비해야 할 것들이 있을까요?',
    tags: ['면접', '취업', '회사문화'],
    urgency: 'urgent',
    view_count: 156,
    answer_count: 12,
    upvote_count: 34,
    downvote_count: 2,
    status: 'open',
    is_pinned: true,
    is_featured: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전
    author: {
      id: 3,
      name: '응우옌민',
      avatar_url: '',
      trust_score: 892,
      residence_years: 6,
      badges: { verified: true },
      email: '',
      created_at: '',
      updated_at: ''
    },
    category: {
      id: 3,
      name: '취업/직장',
      slug: 'employment',
      color: '#EA4335',
      created_at: '',
      updated_at: ''
    },
    _count: { count: 12 }
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 - 질문 박스와 질문 목록 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 대형 질문 입력 박스 */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-primary-blue/20 p-12">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  무엇이든 물어보세요! 🙋‍♂️
                </h1>
                <p className="text-xl text-gray-600">
                  한국 생활의 모든 궁금증을 베트남 커뮤니티에서 해결하세요
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <textarea
                    className="w-full h-48 px-6 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/20 resize-none"
                    placeholder="예시: 한국에서 E-7 비자를 신청하려고 하는데, 회사에서 도와준다고 하지만 제가 개인적으로 준비해야 할 서류가 무엇인지 궁금합니다. 특히 베트남에서 가져와야 하는 서류나 번역이 필요한 것들이 있을까요? 또한 신청 과정에서 주의해야 할 점이나 팁이 있다면 알려주세요."
                    style={{ fontSize: '18px', lineHeight: '1.6' }}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                    <select className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                      <option>📋 카테고리 선택</option>
                      <option>🛂 비자/법률</option>
                      <option>🏠 주거/부동산</option>
                      <option>💼 취업/직장</option>
                      <option>🎓 교육/학업</option>
                      <option>🏥 의료/건강</option>
                      <option>🍜 생활/문화</option>
                    </select>
                    <button className="btn-primary-blue px-8 py-3 text-lg font-semibold">
                      질문하기 ✨
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 최신 질문들 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🔥 최신 질문
                </h2>
                <a
                  href="/questions"
                  className="text-primary-blue hover:text-primary-dark transition-colors text-lg font-medium"
                >
                  전체 보기 →
                </a>
              </div>

              <div className="space-y-4">
                {mockQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    className="hover:scale-[1.01] transition-transform duration-200"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* 사이드바 - AI 매칭과 통계 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 커뮤니티 통계 */}
            <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                📊 커뮤니티 현황
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-blue/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary-blue mb-1">2,847</div>
                  <div className="text-sm text-gray-600">활성 회원</div>
                </div>
                <div className="text-center p-4 bg-primary-green/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary-green mb-1">94.2%</div>
                  <div className="text-sm text-gray-600">답변율</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">2.4시간</div>
                  <div className="text-sm text-gray-600">평균 응답시간</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">156</div>
                  <div className="text-sm text-gray-600">오늘 질문</div>
                </div>
              </div>
            </section>

            {/* AI 매칭 시스템 */}
            <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                🤖 AI 전문가 매칭
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                질문을 올리면 AI가 자동으로 가장 적합한 전문가 5명을 찾아드립니다.
              </p>
              <DynamicAIMatchingFlow
                question={{
                  title: 'E-7 비자 신청 관련 질문',
                  content: '회사에서 도와준다고 하는데 제가 준비할 서류가 궁금합니다',
                  category: '비자/법률',
                  urgency: 'high'
                }}
              />
            </section>

            {/* 인기 카테고리 */}
            <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                📂 인기 카테고리
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🛂', name: '비자/법률', count: 142 },
                  { icon: '🏠', name: '주거', count: 89 },
                  { icon: '💼', name: '취업', count: 156 },
                  { icon: '🎓', name: '교육', count: 73 },
                  { icon: '🏥', name: '의료', count: 45 },
                  { icon: '🍜', name: '생활', count: 201 }
                ].map((category, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer text-center"
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="font-medium text-gray-900 text-xs">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.count}개</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA 섹션 */}
            <section className="bg-gradient-to-br from-primary-blue to-primary-green rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-3">
                🚀 전문가가 되어보세요!
              </h3>
              <p className="mb-4 opacity-90 text-sm">
                질문에 답변하고 포인트를 획득하세요
              </p>
              <button className="bg-white text-primary-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm w-full">
                👥 전문가 신청하기
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}