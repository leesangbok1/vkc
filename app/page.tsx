import { Suspense } from 'react'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Plus,
  TrendingUp,
  Clock,
  Users,
  MessageCircle,
  Star,
  ChevronRight,
  Eye,
  ThumbsUp,
} from 'lucide-react'

// 로딩 컴포넌트
function LoadingGrid() {
  return (
    <div className="grid gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  )
}

// 통계 카드 컴포넌트
function StatsCard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{value.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// 전문가 카드 컴포넌트
function ExpertCard({ expert }: { expert: any }) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={expert.avatar_url} />
        <AvatarFallback>{expert.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {expert.name}
        </p>
        <p className="text-sm text-gray-500">
          {expert.certification || '전문가'}
        </p>
      </div>
      <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
        <Star className="w-3 h-3 mr-1" />
        전문가
      </Badge>
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  // 최신 질문들 조회
  const { data: recentQuestions } = await supabase
    .from('questions')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // 인기 질문들 조회 (조회수 기준)
  const { data: trendingQuestions } = await supabase
    .from('questions')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role
      )
    `)
    .order('view_count', { ascending: false })
    .limit(5)

  // 전체 통계 조회
  const [
    { count: totalQuestions },
    { count: totalAnswers },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('answers').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true })
  ])

  // 전문가 사용자 조회 (역할이 expert이거나 admin인 사용자)
  const { data: experts } = await supabase
    .from('users')
    .select('*')
    .in('role', ['admin', 'moderator'])
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Viet K-Connect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              베트남 한인 커뮤니티의 모든 궁금증을 해결하는 Q&A 플랫폼
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/questions/new">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Plus className="mr-2 h-5 w-5" />
                  질문하기
                </Button>
              </Link>
              <Link href="/questions">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  질문 보기
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 통계 섹션 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="전체 질문"
              value={totalQuestions || 0}
              icon={MessageCircle}
              color="text-blue-600"
            />
            <StatsCard
              title="답변"
              value={totalAnswers || 0}
              icon={ThumbsUp}
              color="text-green-600"
            />
            <StatsCard
              title="커뮤니티 멤버"
              value={totalUsers || 0}
              icon={Users}
              color="text-purple-600"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 최신 질문 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Clock className="mr-2 h-6 w-6 text-blue-600" />
                  최신 질문
                </h2>
                <Link href="/questions?sort=created_at">
                  <Button variant="outline" size="sm">
                    전체 보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <Suspense fallback={<LoadingGrid />}>
                <div className="space-y-4">
                  {recentQuestions && recentQuestions.length > 0 ? (
                    recentQuestions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        showAuthor={true}
                        showStats={true}
                        showCategory={false}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          아직 질문이 없습니다
                        </h3>
                        <p className="text-gray-500 mb-4">
                          첫 번째 질문을 작성해보세요!
                        </p>
                        <Link href="/questions/new">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            질문 작성하기
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Suspense>
            </section>

            {/* 인기 질문 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <TrendingUp className="mr-2 h-6 w-6 text-red-600" />
                  인기 질문
                </h2>
                <Link href="/questions?sort=view_count">
                  <Button variant="outline" size="sm">
                    전체 보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <Suspense fallback={<LoadingGrid />}>
                <div className="space-y-4">
                  {trendingQuestions && trendingQuestions.length > 0 ? (
                    trendingQuestions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        showAuthor={true}
                        showStats={true}
                        showCategory={false}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          인기 질문이 없습니다
                        </h3>
                        <p className="text-gray-500">
                          더 많은 활동이 필요합니다.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Suspense>
            </section>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 인기 태그 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-600" />
                  인기 태그
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['비자', '생활정보', 'TOPIK', '취업', '전세', '건강보험', '운전면허', '법률'].map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 추천 전문가 */}
            {experts && experts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-green-600" />
                    커뮤니티 전문가
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {experts.map((expert) => (
                      <ExpertCard key={expert.id} expert={expert} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 커뮤니티 가이드 */}
            <Card>
              <CardHeader>
                <CardTitle>커뮤니티 가이드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>구체적이고 명확한 질문을 작성해주세요</span>
                  </div>
                  <div className="flex items-start space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>도움이 되는 답변에는 좋아요를 눌러주세요</span>
                  </div>
                  <div className="flex items-start space-x-2 mt-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>정확한 답변을 채택해 주세요</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}