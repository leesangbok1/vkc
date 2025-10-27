'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  question_count?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/categories?include_count=true', { cache: 'no-store' })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || '카테고리를 불러오지 못했습니다.')
        }
        const payload = await res.json()
        setCategories(Array.isArray(payload?.data) ? payload.data : [])
      } catch (err: any) {
        console.error('[CategoriesPage] loadCategories failed:', err)
        setError(err?.message || '카테고리를 불러오지 못했습니다.')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">토픽</h1>
          <p className="text-gray-600 mt-2">관심 있는 주제를 선택하고 관련 질문을 살펴보세요.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center text-gray-500">카테고리를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center text-red-500">{error}</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center text-gray-500">등록된 카테고리가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/topics/${category.slug}`}
                className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{category.icon || '📁'}</div>
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {category.description || '설명이 아직 준비되지 않았습니다.'}
                </p>
                <div className="text-sm text-gray-500 mt-4">
                  질문 {category.question_count ?? 0}개
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
