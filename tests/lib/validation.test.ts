import { describe, it, expect } from 'vitest'
import { ValidationUtils } from '@/lib/validation'

describe('ValidationUtils', () => {
  describe('safeParseInt', () => {
    it('should parse valid integers correctly', () => {
      expect(ValidationUtils.safeParseInt('42', 0)).toBe(42)
      expect(ValidationUtils.safeParseInt('100', 0, 1, 200)).toBe(100)
    })

    it('should return default value for null or empty input', () => {
      expect(ValidationUtils.safeParseInt(null, 10)).toBe(10)
      expect(ValidationUtils.safeParseInt('', 15)).toBe(15)
    })

    it('should handle invalid number strings', () => {
      expect(ValidationUtils.safeParseInt('abc', 5)).toBe(5)
      expect(ValidationUtils.safeParseInt('12abc34', 5, 1, 2000)).toBe(1234)
      expect(ValidationUtils.safeParseInt('not-a-number', 7)).toBe(7)
    })

    it('should apply minimum constraints', () => {
      expect(ValidationUtils.safeParseInt('5', 0, 10, 100)).toBe(10)
      expect(ValidationUtils.safeParseInt('-5', 0, 1, 100)).toBe(1)
    })

    it('should apply maximum constraints', () => {
      expect(ValidationUtils.safeParseInt('150', 0, 1, 100)).toBe(100)
      expect(ValidationUtils.safeParseInt('999', 0, 1, 50)).toBe(50)
    })

    it('should handle negative numbers', () => {
      expect(ValidationUtils.safeParseInt('-10', 0, -20, 20)).toBe(-10)
      expect(ValidationUtils.safeParseInt('-', 5)).toBe(5)
    })

    it('should clean non-digit characters', () => {
      expect(ValidationUtils.safeParseInt('1a2b3c', 0, 1, 2000)).toBe(123)
      expect(ValidationUtils.safeParseInt('$100.50', 0, 1, 20000)).toBe(10050)
      expect(ValidationUtils.safeParseInt('1,234', 0, 1, 2000)).toBe(1234)
    })
  })

  describe('safeString', () => {
    it('should return clean strings for valid input', () => {
      expect(ValidationUtils.safeString('Hello World')).toBe('Hello World')
      expect(ValidationUtils.safeString('  spaces  ')).toBe('spaces')
    })

    it('should return empty string for null or invalid input', () => {
      expect(ValidationUtils.safeString(null)).toBe('')
      expect(ValidationUtils.safeString('')).toBe('')
    })

    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Safe content'
      expect(ValidationUtils.safeString(malicious)).toBe('Safe content')

      const multipleScripts = '<script>bad()</script>Good<script>evil()</script>Content'
      expect(ValidationUtils.safeString(multipleScripts)).toBe('GoodContent')
    })

    it('should remove javascript: protocols', () => {
      const input = 'javascript:alert("xss") Normal text'
      expect(ValidationUtils.safeString(input)).toBe('alert("xss") Normal text')
    })

    it('should remove event handlers', () => {
      const input = 'onclick="evil()" onload="bad()" Good content'
      const result = ValidationUtils.safeString(input)
      expect(result).not.toContain('onclick=')
      expect(result).not.toContain('onload=')
      expect(result).toContain('Good content')
    })

    it('should enforce maximum length', () => {
      const longString = 'a'.repeat(500)
      expect(ValidationUtils.safeString(longString, 100)).toHaveLength(100)
      expect(ValidationUtils.safeString(longString, 10)).toBe('aaaaaaaaaa')
    })

    it('should handle mixed malicious content', () => {
      const malicious = '<script>bad()</script>onclick="evil()" javascript:void(0) Good content'
      const result = ValidationUtils.safeString(malicious)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('onclick=')
      expect(result).not.toContain('javascript:')
      expect(result).toContain('Good content')
    })
  })

  describe('validatePagination', () => {
    it('should return default values for empty params', () => {
      const params = new URLSearchParams()
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should parse valid pagination parameters', () => {
      const params = new URLSearchParams('page=5&limit=10')
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(5)
      expect(result.limit).toBe(10)
    })

    it('should apply constraints to pagination values', () => {
      const params = new URLSearchParams('page=0&limit=200')
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(1) // minimum page is 1
      expect(result.limit).toBe(100) // maximum limit is 100
    })

    it('should handle invalid pagination parameters', () => {
      const params = new URLSearchParams('page=abc&limit=xyz')
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should handle negative values', () => {
      const params = new URLSearchParams('page=-5&limit=-10')
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(1)
    })

    it('should handle extremely large values', () => {
      const params = new URLSearchParams('page=9999&limit=999')
      const result = ValidationUtils.validatePagination(params)

      expect(result.page).toBe(1000) // maximum page is 1000
      expect(result.limit).toBe(100) // maximum limit is 100
    })
  })

  describe('validateSearchQuery', () => {
    it('should return empty string for null input', () => {
      expect(ValidationUtils.validateSearchQuery(null)).toBe('')
    })

    it('should return clean search queries', () => {
      expect(ValidationUtils.validateSearchQuery('비자 신청')).toBe('비자 신청')
      expect(ValidationUtils.validateSearchQuery('E-7 visa application')).toBe('E-7 visa application')
    })

    it('should remove SQL injection patterns', () => {
      const malicious = "'; DROP TABLE users; --"
      const result = ValidationUtils.validateSearchQuery(malicious)
      expect(result).not.toContain("'")
      expect(result).not.toContain('"')
      expect(result).not.toContain(';')
      expect(result).not.toContain('\\')
    })

    it('should handle mixed content with SQL metacharacters', () => {
      const query = "비자 'E-7'; 신청"
      const result = ValidationUtils.validateSearchQuery(query)
      expect(result).toBe('비자 E-7 신청')
    })

    it('should preserve legitimate search terms', () => {
      const query = 'Korean language learning tips'
      expect(ValidationUtils.validateSearchQuery(query)).toBe(query)
    })

    it('should handle empty and whitespace strings', () => {
      expect(ValidationUtils.validateSearchQuery('')).toBe('')
      expect(ValidationUtils.validateSearchQuery('   ')).toBe('')
    })

    it('should remove all dangerous SQL characters', () => {
      const dangerous = `test'test"test;test\\test`
      const result = ValidationUtils.validateSearchQuery(dangerous)
      expect(result).not.toContain("'")
      expect(result).not.toContain('"')
      expect(result).not.toContain(';')
      expect(result).not.toContain('\\')
      expect(result).toContain('test')
    })
  })
})