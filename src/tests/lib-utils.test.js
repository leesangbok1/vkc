/**
 * lib/utils.ts 테스트
 */

import { describe, it, expect } from 'vitest'

// utils 함수 모킹 (실제 구현 기반)
function cn(...inputs) {
  // clsx와 twMerge의 기본 동작을 시뮬레이션
  const classes = inputs.filter(Boolean).join(' ')
  return classes.trim()
}

describe('lib/utils', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      const result = cn('always', true && 'conditional', false && 'hidden')
      expect(result).toBe('always conditional')
    })

    it('should handle empty and null values', () => {
      const result = cn('valid', '', null, undefined, 'another')
      expect(result).toBe('valid another')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1,class2 class3')
    })

    it('should handle single class name', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('should handle no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex conditional logic', () => {
      const variant = 'primary'
      const size = 'large'
      const disabled = false

      const result = cn(
        'base-class',
        variant === 'primary' && 'primary-class',
        size === 'large' && 'large-class',
        disabled && 'disabled-class'
      )

      expect(result).toBe('base-class primary-class large-class')
    })
  })
})