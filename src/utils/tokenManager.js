/**
 * Claude API 사용량 관리 및 자동 작업 재개 시스템
 */

class ClaudeUsageManager {
  constructor() {
    this.usageCheckInterval = 5 * 60 * 60 * 1000; // 5시간 (밀리초)
    this.isMonitoring = false;
    this.currentTask = null;
    this.taskQueue = [];
    this.retryAttempts = 0;
    this.maxRetries = 3;

    // Claude API 설정
    this.claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
    this.claudeApiUrl = 'https://api.anthropic.com/v1';

    // 로컬 스토리지 키
    this.STORAGE_KEYS = {
      CURRENT_TASK: 'poi_current_task',
      TASK_QUEUE: 'poi_task_queue',
      LAST_USAGE_CHECK: 'poi_last_usage_check',
      USAGE_STATUS: 'poi_usage_status',
      DAILY_USAGE: 'poi_daily_usage'
    };

    this.initializeFromStorage();
  }

  /**
   * 로컬 스토리지에서 상태 복원
   */
  initializeFromStorage() {
    try {
      const currentTask = localStorage.getItem(this.STORAGE_KEYS.CURRENT_TASK);
      const taskQueue = localStorage.getItem(this.STORAGE_KEYS.TASK_QUEUE);

      if (currentTask) {
        this.currentTask = JSON.parse(currentTask);
      }

      if (taskQueue) {
        this.taskQueue = JSON.parse(taskQueue);
      }

      // 마지막 사용량 확인 시간 체크
      const lastCheck = localStorage.getItem(this.STORAGE_KEYS.LAST_USAGE_CHECK);
      if (lastCheck) {
        const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
        if (timeSinceLastCheck >= this.usageCheckInterval) {
          this.checkAndResumeWork();
        }
      }
    } catch (error) {
      console.error('토큰 매니저 초기화 실패:', error);
    }
  }

  /**
   * 현재 상태를 로컬 스토리지에 저장
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_TASK, JSON.stringify(this.currentTask));
      localStorage.setItem(this.STORAGE_KEYS.TASK_QUEUE, JSON.stringify(this.taskQueue));
      localStorage.setItem(this.STORAGE_KEYS.LAST_USAGE_CHECK, Date.now().toString());
    } catch (error) {
      console.error('상태 저장 실패:', error);
    }
  }

  /**
   * Claude API 사용량 상태 확인
   */
  async checkClaudeUsage() {
    try {
      // Claude API 사용량 확인
      const response = await fetch(`${this.claudeApiUrl}/usage`, {
        method: 'GET',
        headers: {
          'x-api-key': this.claudeApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const usageStatus = {
          available: !this.isRateLimited(data),
          dailyUsage: data.daily_usage || 0,
          monthlyUsage: data.monthly_usage || 0,
          dailyLimit: data.daily_limit || null,
          monthlyLimit: data.monthly_limit || null,
          resetTime: this.calculateResetTime(),
          timestamp: Date.now()
        };

        localStorage.setItem(this.STORAGE_KEYS.USAGE_STATUS, JSON.stringify(usageStatus));
        return usageStatus;
      } else if (response.status === 429) {
        // Rate limit 에러
        const retryAfter = response.headers.get('retry-after');
        const resetTime = retryAfter ? Date.now() + (parseInt(retryAfter) * 1000) : this.calculateResetTime();

        return {
          available: false,
          dailyUsage: null,
          monthlyUsage: null,
          dailyLimit: null,
          monthlyLimit: null,
          resetTime: resetTime,
          rateLimited: true,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn('Claude API 사용량 확인 실패:', error);
    }

    // API 확인 실패시 로컬 저장된 상태 사용 또는 기본값
    const savedStatus = localStorage.getItem(this.STORAGE_KEYS.USAGE_STATUS);
    if (savedStatus) {
      const parsed = JSON.parse(savedStatus);
      // 1시간 이내 데이터면 사용
      if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
        return parsed;
      }
    }

    // 기본값 반환 (보수적으로 사용 가능으로 설정)
    return {
      available: true,
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: null,
      monthlyLimit: null,
      resetTime: this.calculateResetTime(),
      timestamp: Date.now()
    };
  }

  /**
   * Rate limit 상태 확인
   */
  isRateLimited(usageData) {
    if (!usageData) return false;

    // 일일 한도 확인
    if (usageData.daily_limit && usageData.daily_usage >= usageData.daily_limit * 0.95) {
      return true;
    }

    // 월간 한도 확인
    if (usageData.monthly_limit && usageData.monthly_usage >= usageData.monthly_limit * 0.95) {
      return true;
    }

    return false;
  }

  /**
   * 다음 리셋 시간 계산 (UTC 기준 자정)
   */
  calculateResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * 작업 추가
   */
  addTask(task) {
    const taskWithId = {
      id: Date.now() + Math.random(),
      ...task,
      createdAt: Date.now(),
      status: 'pending'
    };

    this.taskQueue.push(taskWithId);
    this.saveToStorage();

    console.log('작업이 큐에 추가됨:', taskWithId);

    // 현재 작업이 없으면 즉시 시작
    if (!this.currentTask) {
      this.processNextTask();
    }
  }

  /**
   * 다음 작업 처리
   */
  async processNextTask() {
    if (this.taskQueue.length === 0) {
      this.currentTask = null;
      this.saveToStorage();
      return;
    }

    const usageStatus = await this.checkClaudeUsage();

    if (!usageStatus.available || usageStatus.rateLimited) {
      console.log('Claude API 사용량 한도 도달, 리셋 시간까지 대기:', new Date(usageStatus.resetTime));
      this.scheduleNextCheck(usageStatus.resetTime);
      return;
    }

    this.currentTask = this.taskQueue.shift();
    this.currentTask.status = 'in_progress';
    this.saveToStorage();

    try {
      await this.executeTask(this.currentTask);
      this.currentTask.status = 'completed';
      console.log('작업 완료:', this.currentTask.id);

      // 다음 작업 처리
      this.processNextTask();
    } catch (error) {
      console.error('작업 실행 실패:', error);
      this.handleTaskFailure(error);
    }
  }

  /**
   * 작업 실행
   */
  async executeTask(task) {
    console.log('작업 실행 중:', task);

    switch (task.type) {
      case 'code_generation':
        return await this.executeCodeGeneration(task);
      case 'file_modification':
        return await this.executeFileModification(task);
      case 'api_call':
        return await this.executeApiCall(task);
      default:
        throw new Error(`알 수 없는 작업 타입: ${task.type}`);
    }
  }

  /**
   * Claude API를 통한 코드 생성 작업 실행
   */
  async executeCodeGeneration(task) {
    const { prompt, fileName, targetDirectory } = task.data;

    try {
      const response = await fetch(`${this.claudeApiUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.claudeApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `다음 요청에 따라 코드를 생성해주세요:

파일명: ${fileName}
대상 디렉토리: ${targetDirectory}
요청사항: ${prompt}

코드만 반환해주시고, 추가 설명은 생략해주세요.`
          }]
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Claude API 사용량 한도 초과');
        }
        throw new Error(`코드 생성 실패: ${response.statusText}`);
      }

      const result = await response.json();
      const generatedCode = result.content[0].text;

      // 생성된 코드를 파일로 저장하는 로직 추가 가능
      console.log('코드 생성 완료:', { fileName, code: generatedCode.substring(0, 100) + '...' });

      return {
        fileName,
        targetDirectory,
        code: generatedCode,
        usage: result.usage
      };
    } catch (error) {
      throw new Error(`코드 생성 중 오류: ${error.message}`);
    }
  }

  /**
   * 파일 수정 작업 실행
   */
  async executeFileModification(task) {
    const { filePath, modifications } = task.data;

    try {
      // 파일 수정 로직
      console.log(`파일 수정: ${filePath}`, modifications);

      // 실제 파일 수정 API 호출
      const response = await fetch('/api/modify-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, modifications })
      });

      if (!response.ok) {
        throw new Error(`파일 수정 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`파일 수정 중 오류: ${error.message}`);
    }
  }

  /**
   * API 호출 작업 실행
   */
  async executeApiCall(task) {
    const { url, method, data } = task.data;

    try {
      const response = await fetch(url, {
        method: method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API 호출 중 오류: ${error.message}`);
    }
  }

  /**
   * 작업 실패 처리
   */
  handleTaskFailure(error) {
    this.retryAttempts++;

    if (this.retryAttempts <= this.maxRetries) {
      console.log(`작업 재시도 (${this.retryAttempts}/${this.maxRetries}):`, this.currentTask.id);

      // 재시도를 위해 작업을 큐 앞쪽에 다시 추가
      this.currentTask.status = 'retry';
      this.currentTask.retryCount = this.retryAttempts;
      this.taskQueue.unshift(this.currentTask);

      // 5분 후 재시도
      setTimeout(() => {
        this.processNextTask();
      }, 5 * 60 * 1000);
    } else {
      console.error('최대 재시도 횟수 초과, 작업 실패:', this.currentTask.id, error);
      this.currentTask.status = 'failed';
      this.currentTask.error = error.message;

      // 실패한 작업을 별도 저장
      const failedTasks = JSON.parse(localStorage.getItem('poi_failed_tasks') || '[]');
      failedTasks.push(this.currentTask);
      localStorage.setItem('poi_failed_tasks', JSON.stringify(failedTasks));

      this.retryAttempts = 0;
      this.processNextTask();
    }

    this.saveToStorage();
  }

  /**
   * Claude API 사용량 확인 및 작업 재개
   */
  async checkAndResumeWork() {
    console.log('Claude API 사용량 확인 및 작업 재개 시도...');

    const usageStatus = await this.checkClaudeUsage();

    if (usageStatus.available && !usageStatus.rateLimited) {
      console.log('Claude API 사용 가능, 작업 재개');
      this.retryAttempts = 0; // 재시도 카운터 리셋
      this.processNextTask();
    } else {
      console.log('Claude API 사용량 한도 도달, 다음 확인 예약:', new Date(usageStatus.resetTime));
      this.scheduleNextCheck(usageStatus.resetTime);
    }
  }

  /**
   * 다음 사용량 확인 예약
   */
  scheduleNextCheck(nextRefreshTime) {
    const delay = Math.max(nextRefreshTime - Date.now(), this.usageCheckInterval);

    console.log(`다음 Claude API 사용량 확인: ${new Date(Date.now() + delay)}`);

    setTimeout(() => {
      this.checkAndResumeWork();
    }, delay);
  }

  /**
   * 자동 모니터링 시작
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('Claude API 사용량 자동 모니터링 시작');

    // 주기적 사용량 확인
    this.monitoringInterval = setInterval(() => {
      this.checkAndResumeWork();
    }, this.usageCheckInterval);

    // 페이지 가시성 API로 탭 활성화 시 확인
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkAndResumeWork();
      }
    });

    // 초기 작업 처리
    this.processNextTask();
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring() {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Claude API 사용량 자동 모니터링 중지');
  }

  /**
   * 현재 상태 조회
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      currentTask: this.currentTask,
      queueLength: this.taskQueue.length,
      retryAttempts: this.retryAttempts,
      lastUsageCheck: localStorage.getItem(this.STORAGE_KEYS.LAST_USAGE_CHECK)
    };
  }

  /**
   * 큐 초기화
   */
  clearQueue() {
    this.taskQueue = [];
    this.currentTask = null;
    this.saveToStorage();
    console.log('작업 큐가 초기화되었습니다.');
  }
}

export default ClaudeUsageManager;