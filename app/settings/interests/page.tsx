'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
}

export default function InterestSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || '카테고리를 불러오지 못했습니다.')
        }
        const payload = await res.json()
        setCategories(Array.isArray(payload?.data) ? payload.data : [])
      } catch (err: any) {
        console.error('[InterestSettingsPage] loadCategories failed:', err)
        setError(err?.message || '카테고리를 불러오지 못했습니다.')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  const handleSave = () => {
    alert(`${selectedCategories.length}개의 관심 토픽이 저장되었습니다!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              ←
            </Link>
            <h1 className="text-xl font-bold text-gray-900">관심 토픽 설정</h1>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {selectedCategories.length}/{categories.length}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">관심 있는 주제를 선택해 주세요</h2>
          <p className="text-sm text-gray-600">
            관심 있는 주제를 선택하면 맞춤형 질문을 추천해 드립니다.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
            카테고리를 불러오는 중입니다...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon || '📁'}</div>
                  <div className="text-xs font-medium text-center text-gray-900 leading-tight">
                    {category.name}
                  </div>
                  {selectedCategories.includes(category.id) && (
                    <div className="mt-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Link
            href="/categories"
            className="flex-1 py-3 px-6 bg-white border border-gray-300 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            나중에 하기
          </Link>
          <button
            onClick={handleSave}
            disabled={selectedCategories.length === 0}
            className={`flex-1 py-3 px-6 text-white text-center font-medium rounded-lg transition-colors ${
              selectedCategories.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {selectedCategories.length === 0 ? '토픽을 선택해주세요' : '설정 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}
