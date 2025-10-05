'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
  compact?: boolean
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
  compact = false
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')

        const data = await response.json()
        setCategories(data.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Find selected category
  const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory)

  // Filter active categories and sort by sort_order
  const activeCategories = categories
    .filter(cat => cat.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  // Group categories by parent (for hierarchical display)
  const topLevelCategories = activeCategories.filter(cat => !cat.parent_id)
  const subCategories = activeCategories.filter(cat => cat.parent_id)

  const getCategoryHierarchy = () => {
    return topLevelCategories.map(parent => ({
      ...parent,
      children: subCategories.filter(sub => sub.parent_id === parent.id)
    }))
  }

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    )
  }

  if (compact) {
    // Compact version - dropdown only
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between min-w-[200px]"
            >
              <span className="flex items-center gap-2">
                {selectedCategoryData ? (
                  <>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedCategoryData.color }}
                    />
                    <span>{selectedCategoryData.name}</span>
                  </>
                ) : (
                  '카테고리 선택'
                )}
              </span>
              <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => onCategoryChange('')}
              className={cn(!selectedCategory && 'bg-primary-100 text-primary-700')}
            >
              전체 카테고리
            </DropdownMenuItem>
            {getCategoryHierarchy().map(category => (
              <div key={category.id}>
                <DropdownMenuItem
                  onClick={() => onCategoryChange(category.slug)}
                  className={cn(
                    'flex items-center gap-2',
                    selectedCategory === category.slug && 'bg-primary-100 text-primary-700'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </DropdownMenuItem>
                {category.children.map(child => (
                  <DropdownMenuItem
                    key={child.id}
                    onClick={() => onCategoryChange(child.slug)}
                    className={cn(
                      'flex items-center gap-2 pl-8',
                      selectedCategory === child.slug && 'bg-primary-100 text-primary-700'
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: child.color }}
                    />
                    <span>{child.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Full version - horizontal scrollable badges
  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected category display */}
      {selectedCategoryData && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">선택된 카테고리:</span>
          <Badge
            variant="secondary"
            className="flex items-center gap-2 bg-primary-100 text-primary-700"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedCategoryData.color }}
            />
            {selectedCategoryData.name}
            <button
              onClick={() => onCategoryChange('')}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Badge>
        </div>
      )}

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('')}
          className={cn(
            "px-3 py-2 rounded-full border text-sm font-medium transition-colors",
            !selectedCategory
              ? "bg-primary-500 text-white border-primary-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
        >
          전체
        </button>

        {getCategoryHierarchy().map(category => (
          <div key={category.id} className="flex flex-wrap gap-2">
            {/* Parent category */}
            <button
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                "px-3 py-2 rounded-full border text-sm font-medium transition-colors flex items-center gap-2",
                selectedCategory === category.slug
                  ? "text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
              style={{
                backgroundColor: selectedCategory === category.slug ? category.color : undefined
              }}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  selectedCategory === category.slug ? "bg-white" : ""
                )}
                style={{
                  backgroundColor: selectedCategory === category.slug ? 'white' : category.color
                }}
              />
              {category.name}
            </button>

            {/* Child categories */}
            {category.children.map(child => (
              <button
                key={child.id}
                onClick={() => onCategoryChange(child.slug)}
                className={cn(
                  "px-3 py-2 rounded-full border text-sm font-medium transition-colors flex items-center gap-2",
                  selectedCategory === child.slug
                    ? "text-white border-transparent"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
                style={{
                  backgroundColor: selectedCategory === child.slug ? child.color : undefined
                }}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    selectedCategory === child.slug ? "bg-white" : ""
                  )}
                  style={{
                    backgroundColor: selectedCategory === child.slug ? 'white' : child.color
                  }}
                />
                {child.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Category stats (optional) */}
      {categories.length > 0 && (
        <div className="text-xs text-gray-500">
          {categories.filter(c => c.is_active).length}개 카테고리 •
          {' '}총 {subCategories.length}개 하위 카테고리
        </div>
      )}
    </div>
  )
}

// Compact variant export for convenience
export function CompactCategoryFilter(props: Omit<CategoryFilterProps, 'compact'>) {
  return <CategoryFilter {...props} compact={true} />
}