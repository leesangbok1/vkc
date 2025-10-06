'use client'

import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  blurDataURL?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '/placeholder-image.svg',
  blurDataURL,
  priority = false,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder)
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  })

  // Load image when it enters viewport or is priority
  useEffect(() => {
    if ((isIntersecting || priority) && !isLoaded && !hasError) {
      const img = new Image()

      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }

      img.onerror = () => {
        setHasError(true)
        onError?.()
      }

      img.src = src
    }
  }, [isIntersecting, priority, src, isLoaded, hasError, onLoad, onError])

  return (
    <div
      ref={targetRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-70',
          hasError && 'opacity-50'
        )}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm"
          style={{
            backgroundImage: `url(${blurDataURL})`
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">이미지 로드 실패</span>
          </div>
        </div>
      )}
    </div>
  )
}