/**
 * OpenAI Vision API를 이용한 이미지 처리 서비스
 */

import logger from './logger.js'
import environment from './environment.js'

class ImageProcessingService {
  constructor() {
    this.apiKey = environment.API_CONFIG.openai.apiKey
    this.apiUrl = environment.API_CONFIG.openai.baseUrl
    this.visionModel = environment.API_CONFIG.openai.visionModel
    this.isEnabled = !!this.apiKey

    // 지원되는 이미지 형식
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp']
    this.maxFileSize = 20 * 1024 * 1024 // 20MB
    this.maxImageSize = { width: 2048, height: 2048 }

    // 캐싱 시스템
    this.cache = new Map()
    this.cacheTimeout = 10 * 60 * 1000 // 10분
    this.maxCacheSize = 50

    // 통계
    this.stats = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      totalProcessingTime: 0
    }

    logger.info('이미지 처리 서비스 초기화', {
      enabled: this.isEnabled,
      model: this.visionModel,
      supportedFormats: this.supportedFormats
    })
  }

  /**
   * 이미지 파일 유효성 검사
   */
  validateImage(file) {
    const errors = []

    // 파일 크기 체크
    if (file.size > this.maxFileSize) {
      errors.push(`파일 크기가 너무 큽니다. 최대 ${this.maxFileSize / 1024 / 1024}MB까지 지원됩니다.`)
    }

    // 파일 형식 체크
    const fileExtension = file.name.split('.').pop().toLowerCase()
    if (!this.supportedFormats.includes(fileExtension)) {
      errors.push(`지원되지 않는 파일 형식입니다. 지원 형식: ${this.supportedFormats.join(', ')}`)
    }

    // MIME 타입 체크
    if (!file.type.startsWith('image/')) {
      errors.push('이미지 파일이 아닙니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 이미지를 Base64로 변환
   */
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const base64 = reader.result.split(',')[1] // data:image/...;base64, 제거
        resolve(base64)
      }

      reader.onerror = () => {
        reject(new Error('파일 읽기에 실패했습니다.'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * 이미지 크기 조정
   */
  async resizeImage(file, maxWidth = 2048, maxHeight = 2048) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 비율 계산
        let { width, height } = img
        const ratio = Math.min(maxWidth / width, maxHeight / height)

        if (ratio < 1) {
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // 캔버스 크기 설정
        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height)

        // Blob으로 변환
        canvas.toBlob(resolve, file.type, 0.9)
      }

      img.onerror = () => {
        reject(new Error('이미지 로드에 실패했습니다.'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(imageFile, prompt, options) {
    const fileInfo = `${imageFile.name}-${imageFile.size}-${imageFile.lastModified}`
    const optionsStr = JSON.stringify(options)
    return `${fileInfo}-${prompt}-${optionsStr}`
  }

  /**
   * 캐시에서 결과 가져오기
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      this.stats.cacheHits++
      logger.debug('캐시에서 이미지 분석 결과 반환', { cacheKey })
      return cached.result
    }
    return null
  }

  /**
   * 캐시에 결과 저장
   */
  setCachedResult(cacheKey, result) {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })

    logger.debug('이미지 분석 결과 캐시에 저장', { cacheKey })
  }

  /**
   * OpenAI Vision API로 이미지 분석
   */
  async analyzeImage(imageFile, prompt = "이 이미지에 대해 설명해주세요.", options = {}) {
    const startTime = Date.now()
    this.stats.requests++

    try {
      if (!this.isEnabled) {
        throw new Error('이미지 처리 서비스가 활성화되지 않았습니다. OpenAI API 키를 확인하세요.')
      }

      // 캐시 확인
      const cacheKey = this.generateCacheKey(imageFile, prompt, options)
      const cachedResult = this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      logger.info('이미지 분석 시작', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        prompt: prompt.substring(0, 50)
      })

      // 이미지 유효성 검사
      const validation = this.validateImage(imageFile)
      if (!validation.isValid) {
        throw new Error(`이미지 유효성 검사 실패: ${validation.errors.join(', ')}`)
      }

      // 이미지 크기 조정 (필요한 경우)
      let processedImage = imageFile
      if (imageFile.size > 5 * 1024 * 1024) { // 5MB 이상이면 리사이즈
        console.log('🖼️ 이미지 크기가 큽니다. 리사이징 중...')
        processedImage = await this.resizeImage(imageFile)
      }

      // Base64 변환
      const base64Image = await this.convertToBase64(processedImage)

      // API 요청 데이터
      const requestData = {
        model: this.visionModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`,
                  detail: options.detail || "auto" // "low", "high", "auto"
                }
              }
            ]
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.3
      }

      logger.startTimer('openai-vision-api')

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData)
      })

      logger.endTimer('openai-vision-api')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || response.statusText

        logger.error('OpenAI Vision API 요청 실패', {
          status: response.status,
          errorMessage,
          fileName: imageFile.name
        })

        // 400 오류 상세 처리
        if (response.status === 400) {
          if (errorMessage.toLowerCase().includes('image')) {
            throw new Error(`이미지 처리 오류: ${errorMessage}`)
          } else if (errorMessage.toLowerCase().includes('token')) {
            throw new Error(`토큰 한도 초과: ${errorMessage}`)
          } else {
            throw new Error(`API 요청 오류 (400): ${errorMessage}`)
          }
        }

        throw new Error(`OpenAI API 오류 (${response.status}): ${errorMessage}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw new Error('API 응답에서 내용을 찾을 수 없습니다.')
      }

      const processingTime = Date.now() - startTime
      this.stats.totalProcessingTime += processingTime

      const analysisResult = {
        success: true,
        content: content.trim(),
        usage: result.usage,
        model: this.visionModel,
        processingTime,
        cached: false
      }

      // 결과 캐시에 저장
      this.setCachedResult(cacheKey, analysisResult)

      logger.info('이미지 분석 완료', {
        fileName: imageFile.name,
        processingTime,
        tokenUsage: result.usage?.total_tokens
      })

      return analysisResult

    } catch (error) {
      this.stats.errors++
      const processingTime = Date.now() - startTime

      logger.error('이미지 처리 실패', {
        error: error.message,
        fileName: imageFile.name,
        processingTime,
        totalRequests: this.stats.requests,
        errorRate: (this.stats.errors / this.stats.requests * 100).toFixed(2) + '%'
      })

      // 오류 타입별 사용자 친화적 메시지
      let userMessage = error.message

      if (error.message.includes('Could not process image')) {
        userMessage = '이미지를 처리할 수 없습니다. 다른 이미지를 시도해보세요.'
      } else if (error.message.includes('rate limit')) {
        userMessage = 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
      } else if (error.message.includes('invalid image')) {
        userMessage = '유효하지 않은 이미지 파일입니다.'
      } else if (error.message.includes('image size')) {
        userMessage = '이미지 크기가 너무 큽니다. 더 작은 이미지를 사용해주세요.'
      }

      throw new Error(userMessage)
    }
  }

  /**
   * 이미지에서 텍스트 추출 (OCR)
   */
  async extractText(imageFile) {
    return this.analyzeImage(
      imageFile,
      "이 이미지에서 보이는 모든 텍스트를 정확히 추출해주세요. 한국어와 베트남어가 있다면 둘 다 인식해주세요.",
      { detail: "high" }
    )
  }

  /**
   * 이미지 내용 요약
   */
  async summarizeImage(imageFile) {
    return this.analyzeImage(
      imageFile,
      "이 이미지의 주요 내용을 간단히 요약해주세요. 중요한 정보나 메시지가 있다면 포함해주세요.",
      { maxTokens: 200 }
    )
  }

  /**
   * 문서 이미지 분석
   */
  async analyzeDocument(imageFile) {
    return this.analyzeImage(
      imageFile,
      "이 문서의 종류와 주요 내용을 분석해주세요. 비자, 계약서, 공문서 등이라면 중요한 정보를 정리해주세요.",
      { detail: "high", maxTokens: 800 }
    )
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    this.cache.clear()
    logger.info('이미지 처리 캐시 지우기 완료')
  }

  /**
   * 통계 정보 가져오기
   */
  getStats() {
    const cacheHitRate = this.stats.requests > 0
      ? (this.stats.cacheHits / this.stats.requests * 100).toFixed(2) + '%'
      : '0%'

    const errorRate = this.stats.requests > 0
      ? (this.stats.errors / this.stats.requests * 100).toFixed(2) + '%'
      : '0%'

    const avgProcessingTime = this.stats.requests > 0
      ? Math.round(this.stats.totalProcessingTime / (this.stats.requests - this.stats.cacheHits))
      : 0

    return {
      requests: this.stats.requests,
      cacheHits: this.stats.cacheHits,
      cacheHitRate,
      errors: this.stats.errors,
      errorRate,
      totalProcessingTime: this.stats.totalProcessingTime,
      avgProcessingTime,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize
    }
  }

  /**
   * 통계 초기화
   */
  resetStats() {
    this.stats = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      totalProcessingTime: 0
    }
    logger.info('이미지 처리 통계 초기화 완료')
  }

  /**
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      model: this.visionModel,
      supportedFormats: this.supportedFormats,
      maxFileSize: this.maxFileSize,
      maxImageSize: this.maxImageSize,
      cache: {
        size: this.cache.size,
        maxSize: this.maxCacheSize,
        timeout: this.cacheTimeout
      },
      stats: this.getStats()
    }
  }
}

// 싱글톤 인스턴스 생성
const imageProcessingService = new ImageProcessingService()

export default imageProcessingService
export { ImageProcessingService }