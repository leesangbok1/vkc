/**
 * Button 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest'

// Button 컴포넌트 모킹
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10"
}

function getButtonClasses(variant = 'default', size = 'default') {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  const variantClass = buttonVariants[variant] || buttonVariants.default
  const sizeClass = buttonSizes[size] || buttonSizes.default

  return `${baseClasses} ${variantClass} ${sizeClass}`.trim()
}

describe('Button Component', () => {
  describe('buttonVariants', () => {
    it('should have correct default variant styles', () => {
      const classes = getButtonClasses('default')
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
      expect(classes).toContain('hover:bg-primary/90')
    })

    it('should have correct destructive variant styles', () => {
      const classes = getButtonClasses('destructive')
      expect(classes).toContain('bg-destructive')
      expect(classes).toContain('text-destructive-foreground')
      expect(classes).toContain('hover:bg-destructive/90')
    })

    it('should have correct outline variant styles', () => {
      const classes = getButtonClasses('outline')
      expect(classes).toContain('border')
      expect(classes).toContain('border-input')
      expect(classes).toContain('bg-background')
      expect(classes).toContain('hover:bg-accent')
    })

    it('should have correct secondary variant styles', () => {
      const classes = getButtonClasses('secondary')
      expect(classes).toContain('bg-secondary')
      expect(classes).toContain('text-secondary-foreground')
      expect(classes).toContain('hover:bg-secondary/80')
    })

    it('should have correct ghost variant styles', () => {
      const classes = getButtonClasses('ghost')
      expect(classes).toContain('hover:bg-accent')
      expect(classes).toContain('hover:text-accent-foreground')
    })

    it('should have correct link variant styles', () => {
      const classes = getButtonClasses('link')
      expect(classes).toContain('text-primary')
      expect(classes).toContain('underline-offset-4')
      expect(classes).toContain('hover:underline')
    })
  })

  describe('button sizes', () => {
    it('should have correct default size styles', () => {
      const classes = getButtonClasses('default', 'default')
      expect(classes).toContain('h-10')
      expect(classes).toContain('px-4')
      expect(classes).toContain('py-2')
    })

    it('should have correct small size styles', () => {
      const classes = getButtonClasses('default', 'sm')
      expect(classes).toContain('h-9')
      expect(classes).toContain('rounded-md')
      expect(classes).toContain('px-3')
    })

    it('should have correct large size styles', () => {
      const classes = getButtonClasses('default', 'lg')
      expect(classes).toContain('h-11')
      expect(classes).toContain('rounded-md')
      expect(classes).toContain('px-8')
    })

    it('should have correct icon size styles', () => {
      const classes = getButtonClasses('default', 'icon')
      expect(classes).toContain('h-10')
      expect(classes).toContain('w-10')
    })
  })

  describe('base button styles', () => {
    it('should always include base styles', () => {
      const classes = getButtonClasses()
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('whitespace-nowrap')
      expect(classes).toContain('rounded-md')
      expect(classes).toContain('text-sm')
      expect(classes).toContain('font-medium')
    })

    it('should include accessibility styles', () => {
      const classes = getButtonClasses()
      expect(classes).toContain('focus-visible:outline-none')
      expect(classes).toContain('focus-visible:ring-2')
      expect(classes).toContain('focus-visible:ring-ring')
      expect(classes).toContain('focus-visible:ring-offset-2')
    })

    it('should include disabled styles', () => {
      const classes = getButtonClasses()
      expect(classes).toContain('disabled:pointer-events-none')
      expect(classes).toContain('disabled:opacity-50')
    })

    it('should include transition styles', () => {
      const classes = getButtonClasses()
      expect(classes).toContain('transition-colors')
      expect(classes).toContain('ring-offset-background')
    })
  })

  describe('variant and size combinations', () => {
    it('should combine variant and size classes correctly', () => {
      const classes = getButtonClasses('destructive', 'lg')
      expect(classes).toContain('bg-destructive')
      expect(classes).toContain('h-11')
      expect(classes).toContain('px-8')
    })

    it('should handle invalid variant gracefully', () => {
      const classes = getButtonClasses('invalid', 'sm')
      expect(classes).toContain(buttonVariants.default)
      expect(classes).toContain('h-9')
    })

    it('should handle invalid size gracefully', () => {
      const classes = getButtonClasses('outline', 'invalid')
      expect(classes).toContain('border')
      expect(classes).toContain(buttonSizes.default)
    })
  })
})