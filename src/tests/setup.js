/**
 * Vitest 테스트 환경 설정
 */

import { vi } from 'vitest'

// 전역 모킹
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// 브라우저 API 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Notification API 모킹
global.Notification = class {
  constructor(title, options) {
    this.title = title
    this.options = options
    this.onclick = null
  }

  static permission = 'granted'
  static requestPermission = vi.fn().mockResolvedValue('granted')

  close() {}
}

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.localStorage = localStorageMock

// sessionStorage 모킹
global.sessionStorage = localStorageMock

// fetch 모킹
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
)

// Worker 모킹
global.Worker = class {
  constructor() {
    this.onmessage = null
    this.onerror = null
  }

  postMessage() {}
  terminate() {}
}

// FileReader 모킹
global.FileReader = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.result = null
  }

  readAsDataURL() {
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      if (this.onload) this.onload()
    }, 0)
  }

  readAsText() {
    setTimeout(() => {
      this.result = 'test content'
      if (this.onload) this.onload()
    }, 0)
  }
}

// WebSocket 모킹
global.WebSocket = class {
  constructor() {
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    this.onerror = null
    this.readyState = 1
  }

  send() {}
  close() {}
}

// IndexedDB 모킹
global.indexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          getAll: vi.fn()
        }))
      }))
    }
  })),
  deleteDatabase: vi.fn()
}

// Performance API 모킹
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => [])
}

// URL 생성자 모킹
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Canvas 모킹 (이미지 처리용)
global.HTMLCanvasElement = global.HTMLCanvasElement || class HTMLCanvasElement {
  constructor() {
    this.width = 300
    this.height = 150
  }
}

global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn()
}))

global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock blob'], { type: 'image/png' }))
})

// Image 생성자 모킹
global.Image = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.width = 100
    this.height = 100
  }

  set src(value) {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

// CustomEvent 모킹
global.CustomEvent = class {
  constructor(type, options = {}) {
    this.type = type
    this.detail = options.detail
    this.bubbles = options.bubbles || false
    this.cancelable = options.cancelable || false
  }
}

// 환경 변수 모킹
vi.mock('../utils/environment.js', () => ({
  default: {
    isDevelopment: true,
    isProduction: false,
    isTest: true,
    isDebugMode: true,
    API_CONFIG: {
      openai: {
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        visionModel: 'gpt-4o'
      },
      github: {
        token: 'test-github-token'
      },
      firebase: {
        enabled: false
      }
    },
    FEATURE_FLAGS: {
      enableAutoRetry: true,
      enableAnalytics: false,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true
    },
    PERFORMANCE_CONFIG: {
      apiTimeout: 30000,
      retryAttempts: 3,
      cacheTimeout: 300000,
      logLevel: 'DEBUG'
    }
  }
}))

// 로거 모킹
vi.mock('../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    startTimer: vi.fn(),
    endTimer: vi.fn()
  }
}))