/**
 * AI 서비스 데모 및 테스트 예제
 * 브라우저 개발자 도구에서 실행할 수 있는 데모
 */

import aiServiceIntegration from '../utils/aiServiceIntegration.js'
import logger from '../utils/logger.js'

// 전역 객체에 데모 함수들 등록
window.aiDemo = {

  /**
   * AI 서비스 초기화 및 상태 확인
   */
  async init() {
    console.log('🚀 AI 서비스 데모 시작')

    try {
      const initResult = await aiServiceIntegration.initialize()
      console.log('✅ 초기화 완료:', initResult)

      const status = aiServiceIntegration.getIntegrationStatus()
      console.log('📊 통합 상태:', status)

      return initResult
    } catch (error) {
      console.error('❌ 초기화 실패:', error)
      throw error
    }
  },

  /**
   * 질문 분류 테스트
   */
  async testClassification() {
    console.log('🔍 질문 분류 테스트 시작')

    const testQuestions = [
      {
        title: 'F-2-7 비자 연장 방법',
        content: '현재 F-2-7 비자를 가지고 있는데 연장 방법과 필요한 서류를 알고 싶습니다.'
      },
      {
        title: '응급실 이용 문의',
        content: '밤에 갑자기 아파서 응급실에 가야 하는데, 건강보험 없이도 이용할 수 있나요?'
      },
      {
        title: '은행 계좌 개설',
        content: '한국에서 은행 계좌를 만들려고 하는데 어떤 서류가 필요한가요?'
      }
    ]

    for (const question of testQuestions) {
      try {
        const result = await aiServiceIntegration.testService('classification', question)
        console.log(`✅ "${question.title}" 분류 결과:`, result)
      } catch (error) {
        console.error(`❌ "${question.title}" 분류 실패:`, error)
      }
    }
  },

  /**
   * 전문가 매칭 테스트
   */
  async testExpertMatching() {
    console.log('👥 전문가 매칭 테스트 시작')

    const testCases = [
      {
        question: 'F-2-7 비자 연장 방법을 알고 싶습니다',
        category: 'visa'
      },
      {
        question: '응급실 이용 방법을 알려주세요',
        category: 'medical'
      },
      {
        question: '취업비자로 일하고 있는데 근로계약서 관련 문의가 있습니다',
        category: 'work'
      }
    ]

    for (const testCase of testCases) {
      try {
        const result = await aiServiceIntegration.testService('expertMatching', testCase)
        console.log(`✅ "${testCase.question}" 매칭 결과:`, result)
      } catch (error) {
        console.error(`❌ "${testCase.question}" 매칭 실패:`, error)
      }
    }
  },

  /**
   * 답변 품질 평가 테스트
   */
  async testAnswerQuality() {
    console.log('📝 답변 품질 평가 테스트 시작')

    const testCases = [
      {
        question: 'F-2-7 비자 연장 방법이 궁금합니다',
        answer: 'F-2-7 비자 연장을 위해서는 출입국관리사무소에 가서 신청서를 작성하고, 소득증명서, 납세증명서, 건강보험 가입증명서 등의 서류를 제출해야 합니다. 연장 신청은 현재 비자 만료일 4개월 전부터 가능합니다.',
        category: 'visa'
      },
      {
        question: '응급실 이용 방법을 알려주세요',
        answer: '응급실은 24시간 운영되며, 건강보험이 없어도 이용 가능합니다. 하지만 비용이 많이 나올 수 있으니 의료급여나 긴급의료비 지원제도를 확인해보세요.',
        category: 'medical'
      }
    ]

    for (const testCase of testCases) {
      try {
        const result = await aiServiceIntegration.testService('answerQuality', testCase)
        console.log(`✅ 답변 품질 평가 결과:`, result)
      } catch (error) {
        console.error(`❌ 답변 품질 평가 실패:`, error)
      }
    }
  },

  /**
   * 전체 파이프라인 테스트
   */
  async testFullPipeline() {
    console.log('🔄 전체 파이프라인 테스트 시작')

    const testQuestions = [
      {
        title: 'F-2-7 비자 연장 문의',
        content: '현재 F-2-7 비자를 가지고 있는 베트남 국적자입니다. 비자 연장을 하려고 하는데 어떤 서류가 필요한지, 어떤 절차를 거쳐야 하는지 자세히 알고 싶습니다. 그리고 연장 수수료는 얼마인가요?',
        sampleAnswer: 'F-2-7 비자 연장을 위해서는 다음과 같은 서류가 필요합니다: 1) 비자연장허가신청서, 2) 여권 및 외국인등록증, 3) 소득금액증명원, 4) 납세사실증명서, 5) 건강보험료 납부확인서 등입니다. 출입국관리사무소에 직접 방문하여 신청하며, 수수료는 13만원입니다.'
      },
      {
        title: '응급실 이용 방법',
        content: '베트남에서 온 지 얼마 안 된 상황에서 갑자기 아파서 응급실에 가야 할 것 같습니다. 한국어를 잘 못해서 걱정이 되고, 건강보험도 아직 가입 안 했는데 어떻게 해야 하나요?',
        sampleAnswer: '응급상황에서는 건강보험 가입 여부와 상관없이 응급실을 이용할 수 있습니다. 119에 전화하거나 직접 병원에 가시면 됩니다. 언어 문제는 의료진에게 "베트남어 통역이 필요하다"고 말하거나, 번역 앱을 사용하세요. 응급의료비 지원제도도 있으니 사회복지사에게 문의해보세요.'
      }
    ]

    for (const questionData of testQuestions) {
      try {
        console.log(`\n📋 처리 중: "${questionData.title}"`)
        const result = await aiServiceIntegration.processQuestion(questionData)
        console.log('✅ 파이프라인 완료:', result)

        // 결과 요약 출력
        if (result.success) {
          console.log('📊 처리 결과 요약:')
          console.log(`- 분류: ${result.steps.classification?.categoryName || 'Unknown'} (${result.steps.classification?.confidence || 0})`)
          console.log(`- 전문가 매칭: ${result.steps.expertMatching?.matches?.length || 0}명`)
          if (result.steps.answerQuality) {
            console.log(`- 답변 품질: ${result.steps.answerQuality.grade} (${result.steps.answerQuality.overallScore})`)
          }
          console.log(`- 총 처리 시간: ${result.processingTime}ms`)
        }
      } catch (error) {
        console.error(`❌ "${questionData.title}" 파이프라인 실패:`, error)
      }
    }
  },

  /**
   * 통합 테스트 실행
   */
  async runIntegrationTests() {
    console.log('🧪 통합 테스트 실행')

    try {
      const testResults = await aiServiceIntegration.runIntegrationTests()
      console.log('✅ 통합 테스트 완료:', testResults)
      return testResults
    } catch (error) {
      console.error('❌ 통합 테스트 실패:', error)
      throw error
    }
  },

  /**
   * 서비스 통계 조회
   */
  getStats() {
    console.log('📈 서비스 통계 조회')

    const integrationStatus = aiServiceIntegration.getIntegrationStatus()
    const serviceStats = aiServiceIntegration.getAllServiceStats()

    console.log('통합 상태:', integrationStatus)
    console.log('서비스별 통계:', serviceStats)

    return { integrationStatus, serviceStats }
  },

  /**
   * 전체 데모 실행
   */
  async runFullDemo() {
    console.log('🎯 AI 서비스 전체 데모 시작')

    try {
      // 1. 초기화
      await this.init()

      // 2. 개별 서비스 테스트
      console.log('\n=== 개별 서비스 테스트 ===')
      await this.testClassification()
      await this.testExpertMatching()
      await this.testAnswerQuality()

      // 3. 전체 파이프라인 테스트
      console.log('\n=== 전체 파이프라인 테스트 ===')
      await this.testFullPipeline()

      // 4. 통합 테스트
      console.log('\n=== 통합 테스트 ===')
      await this.runIntegrationTests()

      // 5. 최종 통계
      console.log('\n=== 최종 통계 ===')
      this.getStats()

      console.log('🎉 전체 데모 완료!')

    } catch (error) {
      console.error('❌ 데모 실행 중 오류:', error)
    }
  },

  /**
   * 도움말
   */
  help() {
    console.log(`
🔧 AI 서비스 데모 사용법:

기본 명령어:
- aiDemo.init()                    : AI 서비스 초기화
- aiDemo.testClassification()      : 질문 분류 테스트
- aiDemo.testExpertMatching()      : 전문가 매칭 테스트
- aiDemo.testAnswerQuality()       : 답변 품질 평가 테스트
- aiDemo.testFullPipeline()        : 전체 파이프라인 테스트
- aiDemo.runIntegrationTests()     : 통합 테스트 실행
- aiDemo.getStats()                : 서비스 통계 조회
- aiDemo.runFullDemo()             : 전체 데모 실행

사용 예시:
> await aiDemo.init()
> await aiDemo.runFullDemo()
> aiDemo.getStats()

주의사항:
- 모든 함수는 async 함수이므로 await을 사용하세요
- OpenAI API 키가 설정되어 있어야 합니다
- 개발자 도구의 콘솔에서 실행하세요
    `)
  }
}

// 페이지 로드 시 도움말 표시
if (typeof window !== 'undefined') {
  console.log('🤖 AI 서비스 데모가 로드되었습니다!')
  console.log('사용법을 보려면 aiDemo.help()를 실행하세요.')

  // 개발 환경에서 자동 초기화
  if (window.location.hostname === 'localhost') {
    setTimeout(() => {
      console.log('🔄 개발 환경에서 자동 초기화 중...')
      aiDemo.init().catch(error => {
        console.warn('자동 초기화 실패:', error.message)
      })
    }, 1000)
  }
}

export default window.aiDemo