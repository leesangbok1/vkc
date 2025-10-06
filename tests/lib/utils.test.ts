import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should handle Tailwind class conflicts', () => {
      const result = cn('px-4', 'px-6')
      expect(result).toBe('px-6')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'true-class', false && 'false-class')
      expect(result).toBe('base-class true-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true
      })
      expect(result).toBe('text-red-500 font-bold')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('should prioritize later classes over earlier ones', () => {
      const result = cn('text-sm', 'text-lg', 'text-xl')
      expect(result).toBe('text-xl')
    })
  })
})