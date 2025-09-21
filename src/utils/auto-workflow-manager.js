/**
 * 자동 워크플로 관리자
 * 이슈 기반 자동 작업 진행 및 서브에이전트 관리
 */

class AutoWorkflowManager {
  constructor() {
    this.issues = new Map()
    this.currentIssue = null
    this.subAgents = new Map()
    this.isRunning = false
    this.config = {
      maxRetries: 3,
      autoAdvance: true,
      debugMode: true,
      saveProgress: true
    }

    this.loadState()
    this.initializeSubAgents()
  }

  /**
   * 서브에이전트 초기화
   */
  initializeSubAgents() {
    // 테스터 에이전트
    this.subAgents.set('tester', {
      name: 'Test Agent',
      task: 'Run tests and detect errors',
      status: 'idle',
      lastRun: null,
      config: {
        testCommand: 'npm test',
        buildCommand: 'npm run build',
        lintCommand: 'npm run lint'
      }
    })

    // 디버거 에이전트
    this.subAgents.set('debugger', {
      name: 'Debug Agent',
      task: 'Analyze and fix code errors',
      status: 'idle',
      lastRun: null,
      config: {
        logLevel: 'error',
        autoFix: true,
        backupBeforeFix: true
      }
    })

    // 코드 생성 에이전트
    this.subAgents.set('coder', {
      name: 'Code Generator',
      task: 'Generate and implement code',
      status: 'idle',
      lastRun: null,
      config: {
        framework: 'react',
        style: 'modern',
        testing: true
      }
    })

    // 아키텍처 에이전트
    this.subAgents.set('architect', {
      name: 'Architecture Agent',
      task: 'Ensure architectural consistency',
      status: 'idle',
      lastRun: null,
      config: {
        patterns: ['component-based', 'mvc', 'clean-code'],
        enforce: true
      }
    })
  }

  /**
   * 이슈 등록
   */
  registerIssue(id, config) {
    const issue = {
      id,
      title: config.title,
      description: config.description,
      priority: config.priority || 'medium',
      status: 'pending',
      steps: config.steps || [],
      currentStep: 0,
      retries: 0,
      createdAt: new Date(),
      assignedAgents: config.assignedAgents || ['coder'],
      dependencies: config.dependencies || [],
      ...config
    }

    this.issues.set(id, issue)
    this.saveState()

    if (this.config.debugMode) {
      console.log(`✅ 이슈 등록: ${issue.title} (ID: ${id})`)
    }

    // 자동 시작이 활성화되고 현재 실행 중인 이슈가 없으면 시작
    if (this.config.autoAdvance && !this.currentIssue) {
      this.startNextIssue()
    }

    return issue
  }

  /**
   * 다음 이슈 자동 시작
   */
  async startNextIssue() {
    if (this.isRunning) return false

    // 우선순위에 따라 대기 중인 이슈 찾기
    const pendingIssues = Array.from(this.issues.values())
      .filter(issue => issue.status === 'pending')
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))

    if (pendingIssues.length === 0) {
      console.log('📝 처리할 이슈가 없습니다.')
      return false
    }

    const nextIssue = pendingIssues[0]
    await this.startIssue(nextIssue.id)
    return true
  }

  /**
   * 이슈 시작
   */
  async startIssue(issueId) {
    const issue = this.issues.get(issueId)
    if (!issue) {
      throw new Error(`이슈를 찾을 수 없습니다: ${issueId}`)
    }

    if (issue.status === 'in_progress') {
      console.log(`⚠️ 이미 진행 중인 이슈: ${issue.title}`)
      return false
    }

    this.currentIssue = issue
    this.isRunning = true
    issue.status = 'in_progress'
    issue.startedAt = new Date()

    console.log(`🚀 이슈 시작: ${issue.title}`)
    console.log(`📋 단계: ${issue.steps.length}개`)

    try {
      await this.executeIssueSteps(issue)
      await this.completeIssue(issue.id)
    } catch (error) {
      await this.handleIssueError(issue.id, error)
    }

    return true
  }

  /**
   * 이슈 단계 실행
   */
  async executeIssueSteps(issue) {
    for (let i = issue.currentStep; i < issue.steps.length; i++) {
      const step = issue.steps[i]
      issue.currentStep = i

      console.log(`📍 단계 ${i + 1}/${issue.steps.length}: ${step.name}`)

      try {
        // 서브에이전트 할당
        const agent = this.getAgentForStep(step)
        if (agent) {
          await this.executeWithAgent(agent, step, issue)
        } else {
          await this.executeStep(step, issue)
        }

        // 단계별 테스트 실행
        if (step.testAfter) {
          await this.runTests(issue.id)
        }

        // 진행 상황 저장
        this.saveState()

      } catch (stepError) {
        console.error(`❌ 단계 실패: ${step.name}`, stepError)

        // 재시도 로직
        if (issue.retries < this.config.maxRetries) {
          issue.retries++
          console.log(`🔄 재시도 ${issue.retries}/${this.config.maxRetries}`)
          i-- // 현재 단계 재실행
          continue
        } else {
          throw new Error(`최대 재시도 횟수 초과: ${step.name}`)
        }
      }
    }
  }

  /**
   * 서브에이전트와 함께 단계 실행
   */
  async executeWithAgent(agentName, step, issue) {
    const agent = this.subAgents.get(agentName)
    if (!agent) {
      throw new Error(`서브에이전트를 찾을 수 없습니다: ${agentName}`)
    }

    agent.status = 'running'
    agent.lastRun = new Date()

    console.log(`🤖 ${agent.name} 실행 중...`)

    try {
      switch (agentName) {
        case 'tester':
          await this.runTestAgent(step, issue)
          break
        case 'debugger':
          await this.runDebugAgent(step, issue)
          break
        case 'coder':
          await this.runCodeAgent(step, issue)
          break
        case 'architect':
          await this.runArchitectAgent(step, issue)
          break
        default:
          await this.executeStep(step, issue)
      }

      agent.status = 'completed'
      console.log(`✅ ${agent.name} 완료`)

    } catch (error) {
      agent.status = 'error'
      console.error(`❌ ${agent.name} 오류:`, error)
      throw error
    }
  }

  /**
   * 테스트 에이전트 실행
   */
  async runTestAgent(step, issue) {
    // 실제 구현에서는 여기서 테스트를 실행하고 결과를 분석
    console.log('🧪 테스트 실행 중...')

    // 모의 테스트 결과
    const testResults = {
      passed: true,
      coverage: 85,
      errors: [],
      warnings: ['Missing prop validation in QuestionForm']
    }

    if (!testResults.passed) {
      throw new Error(`테스트 실패: ${testResults.errors.join(', ')}`)
    }

    if (testResults.warnings.length > 0) {
      console.warn('⚠️ 경고사항:', testResults.warnings)
    }

    console.log(`✅ 테스트 통과 (커버리지: ${testResults.coverage}%)`)
  }

  /**
   * 디버그 에이전트 실행
   */
  async runDebugAgent(step, issue) {
    console.log('🔍 코드 분석 및 디버깅 중...')

    // 실제 구현에서는 코드 분석 도구를 실행
    const analysisResults = {
      errors: [],
      warnings: ['Unused import in HomePage.jsx'],
      suggestions: ['Consider using React.memo for performance']
    }

    if (analysisResults.errors.length > 0) {
      console.log('🛠️ 오류 자동 수정 중...')
      // 자동 수정 로직
    }

    console.log('✅ 코드 분석 완료')
  }

  /**
   * 코드 생성 에이전트 실행
   */
  async runCodeAgent(step, issue) {
    console.log('💻 코드 생성 중...')

    if (step.type === 'component') {
      await this.generateComponent(step.config)
    } else if (step.type === 'service') {
      await this.generateService(step.config)
    } else if (step.type === 'fix') {
      await this.fixCode(step.config)
    }

    console.log('✅ 코드 생성 완료')
  }

  /**
   * 아키텍처 에이전트 실행
   */
  async runArchitectAgent(step, issue) {
    console.log('🏗️ 아키텍처 검증 중...')

    // 아키텍처 패턴 검증
    const violations = await this.checkArchitecture()

    if (violations.length > 0) {
      console.warn('⚠️ 아키텍처 위반사항:', violations)

      if (this.subAgents.get('architect').config.enforce) {
        throw new Error(`아키텍처 위반: ${violations.join(', ')}`)
      }
    }

    console.log('✅ 아키텍처 검증 완료')
  }

  /**
   * 이슈 완료
   */
  async completeIssue(issueId) {
    const issue = this.issues.get(issueId)
    issue.status = 'completed'
    issue.completedAt = new Date()
    issue.currentStep = issue.steps.length

    console.log(`🎉 이슈 완료: ${issue.title}`)

    this.currentIssue = null
    this.isRunning = false
    this.saveState()

    // 자동으로 다음 이슈 시작
    if (this.config.autoAdvance) {
      setTimeout(() => this.startNextIssue(), 1000)
    }
  }

  /**
   * 이슈 오류 처리
   */
  async handleIssueError(issueId, error) {
    const issue = this.issues.get(issueId)
    issue.status = 'error'
    issue.error = error.message
    issue.errorAt = new Date()

    console.error(`💥 이슈 오류: ${issue.title}`, error)

    this.currentIssue = null
    this.isRunning = false
    this.saveState()

    // 자동 복구 시도
    if (issue.retries < this.config.maxRetries) {
      console.log(`🔄 자동 복구 시도 중... (${issue.retries + 1}/${this.config.maxRetries})`)
      setTimeout(() => this.startIssue(issueId), 5000)
    }
  }

  /**
   * 상태 저장
   */
  saveState() {
    if (!this.config.saveProgress) return

    const state = {
      issues: Array.from(this.issues.entries()),
      currentIssue: this.currentIssue?.id || null,
      subAgents: Array.from(this.subAgents.entries()),
      timestamp: new Date()
    }

    try {
      localStorage.setItem('autoWorkflowState', JSON.stringify(state))
    } catch (error) {
      console.warn('상태 저장 실패:', error)
    }
  }

  /**
   * 상태 로드
   */
  loadState() {
    if (!this.config.saveProgress) return

    try {
      const saved = localStorage.getItem('autoWorkflowState')
      if (saved) {
        const state = JSON.parse(saved)
        this.issues = new Map(state.issues)

        if (state.currentIssue) {
          this.currentIssue = this.issues.get(state.currentIssue)
        }

        console.log(`📁 상태 복원 완료 (이슈 ${this.issues.size}개)`)
      }
    } catch (error) {
      console.warn('상태 로드 실패:', error)
    }
  }

  /**
   * 우선순위 값 계산
   */
  getPriorityValue(priority) {
    const values = { critical: 4, high: 3, medium: 2, low: 1 }
    return values[priority] || 2
  }

  /**
   * 단계에 적합한 에이전트 선택
   */
  getAgentForStep(step) {
    if (step.agent) return step.agent

    const typeAgentMap = {
      'test': 'tester',
      'debug': 'debugger',
      'code': 'coder',
      'component': 'coder',
      'service': 'coder',
      'architecture': 'architect'
    }

    return typeAgentMap[step.type] || null
  }

  /**
   * 상태 조회
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentIssue: this.currentIssue,
      totalIssues: this.issues.size,
      pendingIssues: Array.from(this.issues.values()).filter(i => i.status === 'pending').length,
      completedIssues: Array.from(this.issues.values()).filter(i => i.status === 'completed').length,
      subAgents: Object.fromEntries(this.subAgents)
    }
  }

  // 유틸리티 메서드들
  async executeStep(step, issue) {
    console.log(`⚙️ 단계 실행: ${step.name}`)
    // 기본 단계 실행 로직
  }

  async runTests(issueId) {
    console.log('🧪 테스트 실행...')
    // 테스트 실행 로직
  }

  async generateComponent(config) {
    console.log(`🎨 컴포넌트 생성: ${config.name}`)
    // 컴포넌트 생성 로직
  }

  async generateService(config) {
    console.log(`⚙️ 서비스 생성: ${config.name}`)
    // 서비스 생성 로직
  }

  async fixCode(config) {
    console.log(`🔧 코드 수정: ${config.target}`)
    // 코드 수정 로직
  }

  async checkArchitecture() {
    // 아키텍처 검증 로직
    return []
  }
}

// 전역 인스턴스 생성
export const autoWorkflow = new AutoWorkflowManager()

// 개발 모드에서 전역 접근 가능
if (typeof window !== 'undefined') {
  window.autoWorkflow = autoWorkflow
}

export default AutoWorkflowManager