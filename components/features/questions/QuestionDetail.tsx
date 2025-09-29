'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Clock, Edit, Trash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'

interface QuestionDetailProps {
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
      role: string
    }
  }
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  const [loading, setLoading] = useState(false)

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

  const handleDelete = async () => {
    if (!confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.href = '/questions'
      } else {
        const data = await response.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">{question.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Badge className={getCategoryColor(question.category)}>
                {question.category}
              </Badge>

              <span className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                조회 {question.view_count}
              </span>

              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatDistanceToNow(new Date(question.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/questions/${question.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-800"
            >
              <Trash className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={question.users.avatar_url} />
            <AvatarFallback>
              {question.users.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{question.users.name}</div>
            <div className="text-sm text-gray-500">{question.users.role}</div>
          </div>
        </div>

        {/* 질문 내용 */}
        <div className="prose max-w-none mb-6">
          <div className="whitespace-pre-wrap">{question.content}</div>
        </div>

        {/* 태그 */}
        {question.tags && question.tags.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}