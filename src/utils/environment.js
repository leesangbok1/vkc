/**
 * 환경 설정 및 개발/프로덕션 모드 관리
 */

// 환경 변수 확인
export const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development'
export const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production'
export const isTest = import.meta.env.NODE_ENV === 'test'

// 디버그 모드 설정
export const isDebugMode = isDevelopment || import.meta.env.VITE_DEBUG === 'true'

// API 설정
export const API_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    visionModel: import.meta.env.VITE_OPENAI_VISION_MODEL || 'gpt-4o'
  },
  github: {
    token: import.meta.env.VITE_GITHUB_TOKEN
  },
  firebase: {
    // Firebase 설정은 별도 파일에서 관리
    enabled: !!import.meta.env.VITE_FIREBASE_API_KEY
  }
}

// 기능 플래그
export const FEATURE_FLAGS = {
  enableAutoRetry: import.meta.env.VITE_ENABLE_AUTO_RETRY !== 'false',
  enableAnalytics: isProduction && import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false',
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE !== 'false'
}

// 성능 설정
export const PERFORMANCE_CONFIG = {
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT) || 300000, // 5분
  logLevel: import.meta.env.VITE_LOG_LEVEL || (isDevelopment ? 'DEBUG' : 'INFO')
}

// 환경별 설정
export const ENV_CONFIG = {
  development: {
    logLevel: 'DEBUG',
    enableMocking: true,
    showDebugInfo: true,
    apiTimeout: 10000
  },
  production: {
    logLevel: 'INFO',
    enableMocking: false,
    showDebugInfo: false,
    apiTimeout: 30000
  },
  test: {
    logLevel: 'ERROR',
    enableMocking: true,
    showDebugInfo: false,
    apiTimeout: 5000
  }
}

// 현재 환경 설정 가져오기
export function getCurrentConfig() {
  if (isTest) return ENV_CONFIG.test
  if (isProduction) return ENV_CONFIG.production
  return ENV_CONFIG.development
}

// 환경 변수 검증
export function validateEnvironment() {
  const errors = []
  const warnings = []

  // 필수 환경 변수 확인
  if (!API_CONFIG.openai.apiKey && !isDevelopment) {
    errors.push('VITE_OPENAI_API_KEY is required for production')
  }

  // 선택적 환경 변수 확인
  if (!API_CONFIG.github.token) {
    warnings.push('VITE_GITHUB_TOKEN is not set - GitHub features will be disabled')
  }

  if (!API_CONFIG.firebase.enabled) {
    warnings.push('Firebase is not configured - real-time features will be disabled')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 디버그 정보 출력
export function printEnvironmentInfo() {
  if (!isDebugMode) return

  console.group('🌍 Environment Information')
  console.log('Mode:', isDevelopment ? 'Development' : isProduction ? 'Production' : 'Test')
  console.log('Debug Mode:', isDebugMode)
  console.log('Config:', getCurrentConfig())
  console.log('Feature Flags:', FEATURE_FLAGS)
  console.log('API Keys:', {
    openai: !!API_CONFIG.openai.apiKey,
    github: !!API_CONFIG.github.token,
    firebase: API_CONFIG.firebase.enabled
  })

  const validation = validateEnvironment()
  if (validation.errors.length > 0) {
    console.error('❌ Environment Errors:', validation.errors)
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment Warnings:', validation.warnings)
  }
  console.groupEnd()
}

// 초기화 시 환경 정보 출력
if (isDebugMode) {
  printEnvironmentInfo()
}

export default {
  isDevelopment,
  isProduction,
  isTest,
  isDebugMode,
  API_CONFIG,
  FEATURE_FLAGS,
  PERFORMANCE_CONFIG,
  getCurrentConfig,
  validateEnvironment,
  printEnvironmentInfo
}