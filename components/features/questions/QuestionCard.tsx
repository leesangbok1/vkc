import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface QuestionCardProps {
  question: {
    id: string
    title: string
    content: string
    created_at: string
    view_count: number
    category: string
    tags: string[] | null
    users: {
      id: string
      name: string
      avatar_url: string
    }
  }
}

export function QuestionCard({ question }: QuestionCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '일반': 'bg-gray-100 text-gray-800',
      '취업': 'bg-blue-100 text-blue-800',
      '비자': 'bg-green-100 text-green-800',
      '주거': 'bg-yellow-100 text-yellow-800',
      '교육': 'bg-purple-100 text-purple-800',
      '문화': 'bg-red-100 text-red-800',
    }
    return colors[category] || colors['일반']
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* 사용자 아바타 */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.users.avatar_url} />
            <AvatarFallback>
              {question.users.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* 제목 */}
            <Link
              href={`/questions/${question.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 block"
            >
              {question.title}
            </Link>

            {/* 내용 미리보기 */}
            <p className="text-gray-600 mt-2 line-clamp-2">
              {question.content}
            </p>

            {/* 태그 */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {/* 카테고리 */}
                <Badge className={getCategoryColor(question.category)}>
                  {question.category}
                </Badge>

                {/* 작성자 */}
                <span>{question.users.name}</span>

                {/* 작성 시간 */}
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(question.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>

              {/* 통계 */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {question.view_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}