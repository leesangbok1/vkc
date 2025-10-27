/**
 * 접근성 지원 유틸리티 함수들
 */

// 키보드 네비게이션을 위한 포커스 관리
export class FocusManager {
  private static trapStack: HTMLElement[] = []

  // 포커스 트랩 설정
  static trapFocus(element: HTMLElement) {
    this.trapStack.push(element)
    this.enableTrap(element)
  }

  // 포커스 트랩 해제
  static releaseFocus() {
    if (this.trapStack.length > 0) {
      const element = this.trapStack.pop()!
      this.disableTrap(element)
    }
  }

  private static enableTrap(element: HTMLElement) {
    const focusableElements = this.getFocusableElements(element)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // 첫 번째 요소에 포커스
    firstElement.focus()

    // Tab 키 이벤트 처리
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      // ESC 키로 모달 닫기
      if (e.key === 'Escape') {
        this.releaseFocus()
        // 커스텀 이벤트 발생
        element.dispatchEvent(new CustomEvent('escape-pressed'))
      }
    }

    element.addEventListener('keydown', handleTabKey)
    element.setAttribute('data-focus-trap-enabled', 'true')
  }

  private static disableTrap(element: HTMLElement) {
    element.removeAttribute('data-focus-trap-enabled')
    // 기존 이벤트 리스너는 요소가 제거되면 자동으로 정리됨
  }

  private static getFocusableElements(element: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }
}

// ARIA 속성 관리
export class AriaManager {
  // 라이브 리전 메시지 전달
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcer = this.getOrCreateAnnouncer(priority)
    announcer.textContent = message

    // 메시지 초기화 (스크린 리더가 같은 메시지를 반복 읽지 않도록)
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }

  // 상태 업데이트 알림
  static announceStateChange(elementId: string, newState: string) {
    const element = document.getElementById(elementId)
    if (element) {
      element.setAttribute('aria-live', 'polite')
      this.announce(`${elementId} 상태가 ${newState}로 변경되었습니다.`)
    }
  }

  private static getOrCreateAnnouncer(priority: 'polite' | 'assertive'): HTMLElement {
    const id = `aria-announcer-${priority}`
    let announcer = document.getElementById(id)

    if (!announcer) {
      announcer = document.createElement('div')
      announcer.id = id
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.setAttribute('class', 'sr-only')
      announcer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `
      document.body.appendChild(announcer)
    }

    return announcer
  }
}

// 색상 대비 검사
export class ColorContrastChecker {
  // WCAG AA 기준 색상 대비 검사 (4.5:1)
  static checkContrast(foreground: string, background: string): {
    ratio: number
    passes: {
      aa: boolean
      aaa: boolean
    }
  } {
    const fgLuminance = this.getLuminance(foreground)
    const bgLuminance = this.getLuminance(background)

    const lighter = Math.max(fgLuminance, bgLuminance)
    const darker = Math.min(fgLuminance, bgLuminance)
    const ratio = (lighter + 0.05) / (darker + 0.05)

    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: {
        aa: ratio >= 4.5,
        aaa: ratio >= 7
      }
    }
  }

  private static getLuminance(color: string): number {
    // RGB 값으로 변환
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    // 상대 휘도 계산
    const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
}

// 키보드 네비게이션 헬퍼
export class KeyboardNavigation {
  // 방향키 네비게이션 (그리드, 메뉴 등)
  static enableArrowNavigation(
    container: HTMLElement,
    options: {
      itemSelector: string
      orientation?: 'horizontal' | 'vertical' | 'grid'
      wrap?: boolean
      columnsCount?: number
    }
  ) {
    const { itemSelector, orientation = 'vertical', wrap = true, columnsCount = 1 } = options

    container.addEventListener('keydown', (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
      const currentIndex = items.findIndex(item => item === document.activeElement)

      if (currentIndex === -1) return

      let newIndex = currentIndex

      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'grid') {
            newIndex = orientation === 'grid'
              ? Math.min(currentIndex + columnsCount, items.length - 1)
              : currentIndex + 1
          }
          break

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'grid') {
            newIndex = orientation === 'grid'
              ? Math.max(currentIndex - columnsCount, 0)
              : currentIndex - 1
          }
          break

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = currentIndex + 1
          }
          break

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = currentIndex - 1
          }
          break

        case 'Home':
          newIndex = 0
          break

        case 'End':
          newIndex = items.length - 1
          break

        default:
          return
      }

      // 범위 검사 및 wrapping
      if (newIndex < 0) {
        newIndex = wrap ? items.length - 1 : 0
      } else if (newIndex >= items.length) {
        newIndex = wrap ? 0 : items.length - 1
      }

      if (newIndex !== currentIndex) {
        e.preventDefault()
        items[newIndex].focus()
      }
    })
  }

  // 검색 가능한 목록 네비게이션
  static enableTypeAhead(
    container: HTMLElement,
    itemSelector: string,
    getItemText: (item: HTMLElement) => string
  ) {
    let searchString = ''
    let searchTimeout: NodeJS.Timeout

    container.addEventListener('keydown', (e) => {
      // 문자 키만 처리
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()

        searchString += e.key.toLowerCase()

        // 검색 타임아웃 재설정
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
          searchString = ''
        }, 1000)

        // 일치하는 항목 찾기
        const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
        const currentIndex = items.findIndex(item => item === document.activeElement)

        // 현재 항목 다음부터 검색
        for (let i = 1; i <= items.length; i++) {
          const index = (currentIndex + i) % items.length
          const item = items[index]
          const text = getItemText(item).toLowerCase()

          if (text.startsWith(searchString)) {
            item.focus()
            break
          }
        }
      }
    })
  }
}

// 스크린 리더 전용 텍스트 유틸리티
export const SR_ONLY_CLASS = 'sr-only'

export function addScreenReaderText(element: HTMLElement, text: string): HTMLElement {
  const srText = document.createElement('span')
  srText.className = SR_ONLY_CLASS
  srText.textContent = text
  element.appendChild(srText)
  return srText
}

// 접근성 검증 유틸리티
export class AccessibilityValidator {
  // 필수 ARIA 속성 검증
  static validateRequiredAria(element: HTMLElement, requiredAttributes: string[]): string[] {
    const missing: string[] = []

    requiredAttributes.forEach(attr => {
      if (!element.hasAttribute(attr)) {
        missing.push(attr)
      }
    })

    return missing
  }

  // 포커스 가능한 요소의 접근성 검증
  static validateFocusableElement(element: HTMLElement): {
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []

    // 라벨 검증
    const hasAriaLabel = element.hasAttribute('aria-label')
    const hasAriaLabelledby = element.hasAttribute('aria-labelledby')
    const hasVisibleLabel = element.textContent?.trim() || element.querySelector('label')

    if (!hasAriaLabel && !hasAriaLabelledby && !hasVisibleLabel) {
      issues.push('포커스 가능한 요소에 라벨이 없습니다')
    }

    // 색상 대비 검증 (가능한 경우)
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor

    if (color && backgroundColor && color !== backgroundColor) {
      const contrast = ColorContrastChecker.checkContrast(color, backgroundColor)
      if (!contrast.passes.aa) {
        warnings.push(`색상 대비가 WCAG AA 기준에 미달됩니다 (${contrast.ratio}:1)`)
      }
    }

    return { issues, warnings }
  }
}