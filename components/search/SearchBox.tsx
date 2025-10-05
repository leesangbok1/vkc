'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
  defaultValue?: string
  className?: string
  showFilters?: boolean
  autoFocus?: boolean
  debounceMs?: number
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'tag' | 'category'
  icon?: string
}

export function SearchBox({
  onSearch,
  placeholder = "검색어를 입력하세요...",
  defaultValue = "",
  className,
  showFilters = false,
  autoFocus = false,
  debounceMs = 300
}: SearchBoxProps) {
  const [query, setQuery] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input if autoFocus is enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim() !== defaultValue.trim()) {
        onSearch(query.trim())
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, onSearch, debounceMs, defaultValue])

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        // Mock suggestions - replace with actual API call
        const mockSuggestions: SearchSuggestion[] = [
          { id: '1', text: '비자 연장', type: 'popular' as const, icon: '🔥' },
          { id: '2', text: '취업 비자', type: 'tag' as const, icon: '#' },
          { id: '3', text: '워킹홀리데이', type: 'category' as const, icon: '📂' },
          { id: '4', text: '비자 신청', type: 'recent' as const, icon: '🕒' },
        ].filter(s => s.text.toLowerCase().includes(query.toLowerCase()))

        setSuggestions(mockSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    if (showSuggestions && query.length >= 2) {
      fetchSuggestions()
    }
  }, [query, showSuggestions])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedSuggestion(-1)

    if (value.trim()) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query.trim())
  }

  // Perform search
  const performSearch = (searchQuery: string) => {
    setShowSuggestions(false)
    if (searchQuery) {
      onSearch(searchQuery)
      // Add to recent searches (you can implement this)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    performSearch(suggestion.text)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestion])
        } else {
          performSearch(query.trim())
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestion(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle clear search
  const handleClear = () => {
    setQuery('')
    setShowSuggestions(false)
    onSearch('')
    inputRef.current?.focus()
  }

  // Get suggestion type icon
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return '🕒'
      case 'popular': return '🔥'
      case 'tag': return '#'
      case 'category': return '📂'
      default: return '🔍'
    }
  }

  // Get suggestion type label
  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return '최근 검색'
      case 'popular': return '인기 검색'
      case 'tag': return '태그'
      case 'category': return '카테고리'
      default: return ''
    }
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search button */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              type="submit"
              size="sm"
              className="rounded-l-none h-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '검색'
              )}
            </Button>
          </div>
        </div>

        {/* Search suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                ref={el => { suggestionRefs.current[index] = el }}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0",
                  selectedSuggestion === index && "bg-primary-100 text-primary-700"
                )}
              >
                <span className="text-lg">
                  {suggestion.icon || getSuggestionIcon(suggestion.type)}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getSuggestionTypeLabel(suggestion.type)}
                  </div>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17L17 7" transform="rotate(45)" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Advanced filters (optional) */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            필터 추가
          </Button>
          <Button variant="outline" size="sm">
            날짜 범위
          </Button>
          <Button variant="outline" size="sm">
            작성자
          </Button>
        </div>
      )}
    </div>
  )
}