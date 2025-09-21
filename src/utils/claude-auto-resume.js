/**
 * Claude 토큰 소진 후 자동 재개 시스템
 * 토큰이 다시 사용 가능해지면 자동으로 중단된 작업 재개
 */

class ClaudeAutoResumeSystem {
  constructor() {
    this.isMonitoring = false
    this.lastWorkingState = null
    this.resumeTimer = null
    this.checkInterval = null
    this.config = {
      checkIntervalMs: 30000, // 30초마다 체크
      tokenResetHours: 5, // 5시간 후 토큰 리셋
      autoSaveState: true,
      autoResume: true
    }

    this.initializeSystem()
  }

  /**
   * 시스템 초기화
   */
  initializeSystem() {
    console.log('🤖 Claude 자동 재개 시스템 초기화 중...')

    // 저장된 상태 복원
    this.loadSavedState()

    // 토큰 상태 모니터링 시작
    this.startTokenMonitoring()

    // 브라우저 종료 시 상태 저장
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveCurrentState()
      })
    }

    console.log('✅ Claude 자동 재개 시스템 초기화 완료')
  }

  /**
   * 토큰 상태 모니터링 시작
   */
  startTokenMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // 주기적으로 토큰 상태 확인
    this.checkInterval = setInterval(() => {
      this.checkTokenAvailability()
    }, this.config.checkIntervalMs)

    console.log('📊 토큰 상태 모니터링 시작됨')
  }

  /**
   * 토큰 상태 모니터링 중지
   */
  stopTokenMonitoring() {
    this.isMonitoring = false

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer)
      this.resumeTimer = null
    }

    console.log('🛑 토큰 상태 모니터링 중지됨')
  }

  /**
   * 토큰 소진 감지 및 상태 저장
   */
  onTokenExhausted(currentTask = null, context = null) {
    console.log('🚨 Claude 토큰 소진 감지!')

    const state = {
      timestamp: Date.now(),
      currentTask,
      context,
      url: window.location.href,
      workflowStatus: window.autoWorkflow?.getStatus(),
      userInput: this.extractUserInput(),
      conversationHistory: this.extractConversationHistory()
    }

    this.lastWorkingState = state
    this.saveCurrentState()

    // 5시간 후 자동 재개 스케줄링
    this.scheduleAutoResume()

    console.log('💾 작업 상태 저장 완료')
    console.log('⏰ 5시간 후 자동 재개 예정')

    // 사용자에게 알림 표시
    this.showTokenExhaustedNotification()
  }

  /**
   * 토큰 가용성 확인
   */
  async checkTokenAvailability() {
    try {
      // Claude API 상태 확인 (간단한 테스트 요청)
      const response = await this.testClaudeAPI()

      if (response.success) {
        // 토큰이 사용 가능하고 저장된 상태가 있으면 재개
        if (this.lastWorkingState && this.config.autoResume) {
          console.log('🔄 토큰 복원됨! 자동 재개 시작...')
          await this.resumeWork()
        }
      }
    } catch (error) {
      // 토큰 소진 또는 기타 오류
      if (error.message.includes('rate limit') || error.message.includes('token')) {
        console.log('⚠️ 토큰 아직 사용 불가')
      }
    }
  }

  /**
   * Claude API 테스트 요청
   */
  async testClaudeAPI() {
    // 실제 구현에서는 Claude API에 간단한 테스트 요청
    // 현재는 모의 구현
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 랜덤하게 성공/실패 시뮬레이션
        if (Math.random() > 0.7) {
          resolve({ success: true })
        } else {
          reject(new Error('Rate limit exceeded'))
        }
      }, 100)
    })
  }

  /**
   * 5시간 후 자동 재개 스케줄링
   */
  scheduleAutoResume() {
    const resumeTime = this.config.tokenResetHours * 60 * 60 * 1000 // 5시간

    this.resumeTimer = setTimeout(() => {
      console.log('⏰ 예정된 시간 도달 - 재개 시도 중...')
      this.attemptResume()
    }, resumeTime)

    const resumeAt = new Date(Date.now() + resumeTime)
    console.log(`📅 자동 재개 예정: ${resumeAt.toLocaleString()}`)
  }

  /**
   * 작업 재개 시도
   */
  async attemptResume() {
    if (!this.lastWorkingState) {
      console.log('❌ 복원할 상태가 없습니다')
      return false
    }

    try {
      console.log('🔄 작업 재개 중...')

      // 페이지 URL 복원
      if (this.lastWorkingState.url !== window.location.href) {
        window.history.pushState({}, '', this.lastWorkingState.url)
      }

      // 워크플로 상태 복원
      if (this.lastWorkingState.workflowStatus && window.autoWorkflow) {
        await this.restoreWorkflowState(this.lastWorkingState.workflowStatus)
      }

      // 사용자에게 재개 알림
      this.showResumeNotification()

      // 저장된 상태 클리어
      this.clearSavedState()

      console.log('✅ 작업 재개 완료!')
      return true

    } catch (error) {
      console.error('❌ 작업 재개 실패:', error)

      // 1시간 후 다시 시도
      setTimeout(() => this.attemptResume(), 60 * 60 * 1000)
      return false
    }
  }

  /**
   * 워크플로 상태 복원
   */
  async restoreWorkflowState(workflowStatus) {
    if (workflowStatus.currentIssue) {
      console.log(`🔄 이슈 복원: ${workflowStatus.currentIssue.title}`)

      // 현재 이슈를 워크플로에 다시 등록
      window.autoWorkflow.registerIssue(`resumed-${Date.now()}`, {
        ...workflowStatus.currentIssue,
        title: `[재개] ${workflowStatus.currentIssue.title}`,
        description: `중단된 작업 재개: ${workflowStatus.currentIssue.description}`,
        priority: 'high'
      })
    }
  }

  /**
   * 사용자 입력 추출
   */
  extractUserInput() {
    const inputs = []

    // 현재 페이지의 입력 필드들
    document.querySelectorAll('input, textarea').forEach(element => {
      if (element.value) {
        inputs.push({
          type: element.tagName.toLowerCase(),
          id: element.id,
          name: element.name,
          value: element.value
        })
      }
    })

    return inputs
  }

  /**
   * 대화 기록 추출
   */
  extractConversationHistory() {
    // 실제 구현에서는 Claude와의 대화 기록을 추출
    // 현재는 간단한 모의 구현
    return {
      lastMessages: [],
      context: 'Viet K-Connect 프로젝트 작업 중'
    }
  }

  /**
   * 현재 상태 저장
   */
  saveCurrentState() {
    if (!this.config.autoSaveState || !this.lastWorkingState) return

    try {
      localStorage.setItem('claude-auto-resume-state', JSON.stringify({
        ...this.lastWorkingState,
        savedAt: Date.now()
      }))
      console.log('💾 상태 로컬 저장 완료')
    } catch (error) {
      console.error('❌ 상태 저장 실패:', error)
    }
  }

  /**
   * 저장된 상태 로드
   */
  loadSavedState() {
    try {
      const saved = localStorage.getItem('claude-auto-resume-state')
      if (saved) {
        const state = JSON.parse(saved)

        // 24시간 이내의 상태만 복원
        if (Date.now() - state.savedAt < 24 * 60 * 60 * 1000) {
          this.lastWorkingState = state
          console.log('📁 저장된 상태 복원 완료')

          // 즉시 재개 시도
          if (this.config.autoResume) {
            setTimeout(() => this.attemptResume(), 5000)
          }
        } else {
          console.log('⏰ 저장된 상태가 너무 오래됨 - 무시')
          this.clearSavedState()
        }
      }
    } catch (error) {
      console.error('❌ 상태 로드 실패:', error)
    }
  }

  /**
   * 저장된 상태 클리어
   */
  clearSavedState() {
    this.lastWorkingState = null
    localStorage.removeItem('claude-auto-resume-state')
    console.log('🗑️ 저장된 상태 클리어됨')
  }

  /**
   * 토큰 소진 알림 표시
   */
  showTokenExhaustedNotification() {
    if (typeof window === 'undefined') return

    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
      z-index: 10000;
      max-width: 500px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideDown 0.5s ease-out;
    `

    const resumeTime = new Date(Date.now() + this.config.tokenResetHours * 60 * 60 * 1000)

    notification.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🤖</div>
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Claude 토큰 소진</h3>
      <p style="margin: 0 0 15px 0; opacity: 0.9;">
        현재 작업이 자동으로 저장되었습니다.<br>
        <strong>${resumeTime.toLocaleString()}</strong>에 자동으로 재개됩니다.
      </p>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">확인</button>
    `

    document.body.appendChild(notification)

    // 10초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  /**
   * 재개 알림 표시
   */
  showResumeNotification() {
    if (typeof window === 'undefined') return

    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10B981, #34D399);
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideIn 0.5s ease-out;
    `

    notification.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">작업 자동 재개됨!</h3>
      <p style="margin: 0; opacity: 0.9; font-size: 14px;">
        Claude 토큰이 복원되어 중단된 작업을 자동으로 재개했습니다.
      </p>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  /**
   * 상태 조회
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      hasResumeState: !!this.lastWorkingState,
      lastSaved: this.lastWorkingState?.timestamp,
      nextResumeCheck: this.resumeTimer ? Date.now() + this.config.tokenResetHours * 60 * 60 * 1000 : null,
      config: this.config
    }
  }

  /**
   * 수동 재개 트리거
   */
  async manualResume() {
    console.log('🖱️ 수동 재개 요청됨')
    return await this.attemptResume()
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 설정 업데이트됨:', this.config)
  }
}

// 전역 인스턴스 생성
export const claudeAutoResume = new ClaudeAutoResumeSystem()

// 개발 모드에서 전역 접근 가능
if (typeof window !== 'undefined') {
  window.claudeAutoResume = claudeAutoResume

  // CSS 애니메이션 추가
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `
  document.head.appendChild(style)
}

export default ClaudeAutoResumeSystem