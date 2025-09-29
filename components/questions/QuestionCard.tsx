import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Eye,
  MessageCircle,
  ThumbsUp,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Author {
  id: string
  name: string
  profilePic?: string
  avatar_url?: string
  isExpert?: boolean
  role?: string
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

interface Question {
  id: string
  title: string
  content: string
  created_at: string
  createdAt?: string
  view_count?: number
  views?: number
  vote_count?: number
  likes?: number
  answer_count?: number
  answers?: number
  is_answered?: boolean
  isAnswered?: boolean
  tags?: string[]
  author?: Author
  user?: Author
  users?: Author
  category?: Category | string
  categories?: Category
  category_id?: string
}

interface QuestionCardProps {
  question: Question
  showAuthor?: boolean
  showStats?: boolean
  showCategory?: boolean
  onClick?: (question: Question) => void
}

export function QuestionCard({
  question,
  showAuthor = true,
  showStats = true,
  showCategory = false,
  onClick
}: QuestionCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(question)
    }
    // Link component will handle navigation
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ko,
      })
    } catch (error) {
      return '알 수 없음'
    }
  }

  // 데이터 정규화 - 다양한 형태의 데이터 구조 지원
  const author = question.author || question.user || question.users
  const category = typeof question.category === 'object'
    ? question.category
    : question.categories
  const createdAt = question.created_at || question.createdAt || new Date().toISOString()
  const viewCount = question.view_count ?? question.views ?? 0
  const voteCount = question.vote_count ?? question.likes ?? 0
  const answerCount = question.answer_count ?? question.answers ?? 0
  const isAnswered = question.is_answered ?? question.isAnswered ?? false

  const CardWrapper = onClick ? 'div' : Link

  return (
    <CardWrapper
      {...(onClick ? { onClick: handleClick } : { href: `/questions/${question.id}` })}
      className="block"
    >
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          {/* 카테고리 배지 */}
          {showCategory && category && (
            <div className="mb-3">
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: typeof category === 'object'
                    ? `${category.color}20`
                    : '#f1f5f9'
                }}
              >
                {typeof category === 'object' && category.icon && (
                  <span className="mr-1">{category.icon}</span>
                )}
                {typeof category === 'object' ? category.name : category}
              </Badge>
            </div>
          )}

          {/* 질문 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {question.title}
          </h3>

          {/* 질문 내용 미리보기 */}
          <div className="text-gray-600 mb-3">
            <p className="line-clamp-2 text-sm leading-relaxed">
              {question.content}
            </p>
          </div>

          {/* 태그 */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                  #{tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <span className="text-xs text-gray-500 font-medium">
                  +{question.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 질문 메타 정보 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* 작성자 정보 */}
            {showAuthor && author && (
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author.profilePic || author.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {author.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm text-gray-600 font-medium truncate">
                  {author.name}
                </span>

                {author.isExpert && (
                  <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    전문가
                  </Badge>
                )}
              </div>
            )}

            {/* 작성 시간 */}
            <div className="flex items-center space-x-1 text-gray-500 text-xs whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>

          {/* 통계 정보 */}
          {showStats && (
            <div className="flex items-center space-x-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{viewCount}</span>
              </div>

              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{voteCount}</span>
              </div>

              <div className={`flex items-center space-x-1 ${
                isAnswered ? 'text-green-600 font-medium' : ''
              }`}>
                <MessageCircle className="w-4 h-4" />
                <span>{answerCount}</span>
                {isAnswered && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}