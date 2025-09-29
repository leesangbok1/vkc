'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, Edit, Trash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface AnswerCardProps {
  answer: {
    id: string
    content: string
    is_accepted: boolean
    created_at: string
    users: {
      id: string
      name: string
      avatar_url: string
      role: string
    }
  }
  questionId: string
}

export function AnswerCard({ answer, questionId }: AnswerCardProps) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/answers/${answer.id}/accept`, {
        method: 'PUT',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || '답변 채택 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
      alert('답변 채택 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 답변을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/answers/${answer.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || '답변 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('답변 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={answer.is_accepted ? 'border-green-200 bg-green-50' : ''}>
      <CardContent className="p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={answer.users.avatar_url} />
              <AvatarFallback>
                {answer.users.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{answer.users.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {answer.users.role}
                </Badge>
                {answer.is_accepted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    채택됨
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatDistanceToNow(new Date(answer.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-2">
            {!answer.is_accepted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAccept}
                disabled={loading}
                className="text-green-600 hover:text-green-800"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                채택
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              수정
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

        {/* 답변 내용 */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">{answer.content}</div>
        </div>
      </CardContent>
    </Card>
  )
}