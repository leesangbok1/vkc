'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnswerFormProps {
  questionId: string
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setContent('')
        window.location.reload() // 새로운 답변을 표시하기 위해 페이지 새로고침
      } else {
        alert(data.error || '답변 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error creating answer:', error)
      alert('답변 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>답변 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="도움이 되는 답변을 작성해주세요"
            rows={6}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? '작성 중...' : '답변 등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}