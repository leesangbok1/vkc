'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const categories = [
  { id: '일반', name: '일반', icon: '📝' },
  { id: '취업', name: '취업', icon: '💼' },
  { id: '비자', name: '비자', icon: '📄' },
  { id: '주거', name: '주거', icon: '🏠' },
  { id: '교육', name: '교육', icon: '📚' },
  { id: '문화', name: '문화', icon: '🎭' },
]

export function QuestionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '일반',
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/questions/${data.id}`)
      } else {
        alert(data.error || '질문 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('질문 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 질문 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목 *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="질문 제목을 입력해주세요"
              required
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              카테고리 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.id })}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    formData.category === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              내용 *
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="질문 내용을 자세히 작성해주세요"
              rows={8}
              required
            />
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              태그 (최대 5개)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="태그 입력"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  추가
                </Button>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '작성 중...' : '질문 등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}