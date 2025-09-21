/**
 * OpenAI Vision API를 이용한 이미지 처리 서비스
 */

class ImageProcessingService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.apiUrl = 'https://api.openai.com/v1'
    this.visionModel = 'gpt-4o' // 또는 'gpt-4-vision-preview'
    this.isEnabled = !!this.apiKey

    // 지원되는 이미지 형식
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp']
    this.maxFileSize = 20 * 1024 * 1024 // 20MB
    this.maxImageSize = { width: 2048, height: 2048 }

    console.log('🖼️ 이미지 처리 서비스 초기화:', this.isEnabled ? '활성화됨' : '비활성화됨 (API 키 없음)')
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
   * OpenAI Vision API로 이미지 분석
   */
  async analyzeImage(imageFile, prompt = "이 이미지에 대해 설명해주세요.", options = {}) {
    try {
      if (!this.isEnabled) {
        throw new Error('이미지 처리 서비스가 활성화되지 않았습니다. OpenAI API 키를 확인하세요.')
      }

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

      console.log('🖼️ OpenAI Vision API 요청 시작...')

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // 400 오류 상세 처리
        if (response.status === 400) {
          const errorMessage = errorData.error?.message || response.statusText

          if (errorMessage.toLowerCase().includes('image')) {
            throw new Error(`이미지 처리 오류: ${errorMessage}`)
          } else if (errorMessage.toLowerCase().includes('token')) {
            throw new Error(`토큰 한도 초과: ${errorMessage}`)
          } else {
            throw new Error(`API 요청 오류 (400): ${errorMessage}`)
          }
        }

        throw new Error(`OpenAI API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw new Error('API 응답에서 내용을 찾을 수 없습니다.')
      }

      console.log('🖼️ 이미지 분석 완료')

      return {
        success: true,
        content: content.trim(),
        usage: result.usage,
        model: this.visionModel
      }

    } catch (error) {
      console.error('🖼️ 이미지 처리 실패:', error)

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
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      model: this.visionModel,
      supportedFormats: this.supportedFormats,
      maxFileSize: this.maxFileSize,
      maxImageSize: this.maxImageSize
    }
  }
}

// 싱글톤 인스턴스 생성
const imageProcessingService = new ImageProcessingService()

export default imageProcessingService
export { ImageProcessingService }