'use client'

import { Button } from './button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
  className?: string
  showPageNumbers?: boolean
  maxPageNumbers?: number
  showFirstLast?: boolean
  showTotal?: boolean
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  className,
  showPageNumbers = true,
  maxPageNumbers = 7,
  showFirstLast = true,
  showTotal = false,
  totalItems
}: PaginationProps) {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const halfWindow = Math.floor(maxPageNumbers / 2)
    let start = Math.max(1, currentPage - halfWindow)
    let end = Math.min(totalPages, start + maxPageNumbers - 1)

    // Adjust start if we're near the end
    if (end === totalPages) {
      start = Math.max(1, totalPages - maxPageNumbers + 1)
    }

    const pages: number[] = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()
  const showEllipsisStart = visiblePages[0] > 1
  const showEllipsisEnd = visiblePages[visiblePages.length - 1] < totalPages

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="페이지네이션"
      className={cn("flex items-center justify-center", className)}
    >
      <div className="flex items-center space-x-1">
        {/* Total items display */}
        {showTotal && totalItems && (
          <div className="mr-4 text-sm text-gray-600">
            총 {totalItems.toLocaleString()}개
          </div>
        )}

        {/* First page button */}
        {showFirstLast && currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            aria-label="첫 페이지로 이동"
            className="px-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M21 19l-7-7 7-7" />
            </svg>
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          aria-label="이전 페이지로 이동"
          className="px-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <>
            {/* Start ellipsis */}
            {showEllipsisStart && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  className="px-3"
                >
                  1
                </Button>
                <span className="px-2 text-gray-500">...</span>
              </>
            )}

            {/* Visible page numbers */}
            {visiblePages.map(pageNum => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`페이지 ${pageNum}으로 이동`}
                aria-current={pageNum === currentPage ? "page" : undefined}
                className={cn(
                  "px-3",
                  pageNum === currentPage && "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {pageNum}
              </Button>
            ))}

            {/* End ellipsis */}
            {showEllipsisEnd && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="px-3"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </>
        )}

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          aria-label="다음 페이지로 이동"
          className="px-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            aria-label="마지막 페이지로 이동"
            className="px-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M3 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>

      {/* Page info */}
      <div className="ml-4 text-sm text-gray-600">
        {currentPage} / {totalPages} 페이지
      </div>
    </nav>
  )
}

// Simple pagination component for basic use cases
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  className
}: Pick<PaginationProps, 'currentPage' | 'totalPages' | 'onPageChange' | 'hasNext' | 'hasPrev' | 'className'>) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        이전
      </Button>

      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        다음
      </Button>
    </div>
  )
}

// Compact pagination for mobile
export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev
}: Pick<PaginationProps, 'currentPage' | 'totalPages' | 'onPageChange' | 'hasNext' | 'hasPrev'>) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="px-2"
      >
        ←
      </Button>

      <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded">
        {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="px-2"
      >
        →
      </Button>
    </div>
  )
}