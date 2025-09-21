/**
 * Enhanced Token Manager Usage Examples
 * 토큰 소진 후 자동 재개 시스템 사용 방법 예제
 */

import React, { useState, useEffect } from 'react'
import { TokenManagerProvider, useTokenManagerContext } from '../components/TokenManagerProvider.jsx'
import { useTokenManager, useAutoRetry, useTokenExhaustedListener } from '../hooks/useTokenManager.js'

/**
 * 예제 1: 기본 사용법
 */
export const BasicUsageExample = () => {
  const { addClaudeTask, status, isLoading } = useTokenManager()
  const [result, setResult] = useState(null)

  const handleGenerateCode = async () => {
    try {
      const taskId = await addClaudeTask(
        "React 컴포넌트를 생성해주세요. 사용자 프로필을 표시하는 컴포넌트입니다.",
        {
          priority: 'high',
          context: {
            component: 'UserProfile',
            framework: 'React'
          }
        }
      )

      console.log('작업 추가됨:', taskId)
    } catch (error) {
      console.error('작업 추가 실패:', error)
    }
  }

  return (
    <div className="example-container">
      <h3>🔧 기본 사용법</h3>
      <p>Claude API를 사용하여 코드 생성 작업을 요청합니다.</p>

      <button
        onClick={handleGenerateCode}
        disabled={isLoading}
        className="example-btn"
      >
        {isLoading ? '처리 중...' : 'Claude로 코드 생성'}
      </button>

      {status && (
        <div className="status-info">
          <h4>현재 상태:</h4>
          <ul>
            <li>대기 중인 작업: {status.queueLength}개</li>
            <li>현재 작업: {status.currentTask?.type || '없음'}</li>
            <li>Claude API: {status.services.claude?.status || '확인 중'}</li>
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * 예제 2: 에러 핸들링과 자동 재시도
 */
export const ErrorHandlingExample = () => {
  const { addTask, clearQueue, retryNow } = useTokenManager()
  const { isRetrying, attempts, startAutoRetry, stopAutoRetry } = useAutoRetry({
    interval: 10000, // 10초마다 재시도
    maxAttempts: 5
  })

  const [errors, setErrors] = useState([])

  // 토큰 소진 이벤트 리스너
  useTokenExhaustedListener((detail) => {
    setErrors(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      service: detail.serviceName,
      message: `${detail.serviceName} 토큰 소진됨`
    }])
  })

  const handleHighPriorityTask = async () => {
    try {
      await addTask({
        type: 'claude_api_call',
        priority: 'critical',
        data: {
          prompt: "긴급: 보안 취약점 분석 보고서를 작성해주세요.",
          model: 'claude-3-opus-20240229'
        },
        context: {
          urgent: true,
          department: 'security'
        }
      })
    } catch (error) {
      setErrors(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        service: 'Claude',
        message: error.message
      }])
    }
  }

  return (
    <div className="example-container">
      <h3>🚨 에러 핸들링 & 자동 재시도</h3>

      <div className="controls">
        <button onClick={handleHighPriorityTask} className="example-btn critical">
          긴급 작업 추가
        </button>
        <button onClick={startAutoRetry} disabled={isRetrying} className="example-btn">
          자동 재시도 시작
        </button>
        <button onClick={stopAutoRetry} disabled={!isRetrying} className="example-btn">
          자동 재시도 중지
        </button>
        <button onClick={retryNow} className="example-btn">
          수동 재시도
        </button>
        <button onClick={clearQueue} className="example-btn secondary">
          큐 초기화
        </button>
      </div>

      {isRetrying && (
        <div className="retry-status">
          🔄 자동 재시도 중... (시도 횟수: {attempts})
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-log">
          <h4>🚨 에러 로그:</h4>
          {errors.slice(-5).map((error, index) => (
            <div key={index} className="error-item">
              <span className="timestamp">{error.timestamp}</span>
              <span className="service">[{error.service}]</span>
              <span className="message">{error.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 예제 3: 다중 API 통합 사용
 */
export const MultiAPIExample = () => {
  const { addClaudeTask, addGitHubTask, addFirebaseTask, status } = useTokenManager()
  const [results, setResults] = useState([])

  const handleWorkflow = async () => {
    try {
      // 1. Claude로 코드 생성
      const codeTaskId = await addClaudeTask(
        "GitHub 이슈를 자동으로 생성하는 JavaScript 함수를 작성해주세요."
      )

      // 2. GitHub API로 리포지토리 정보 조회
      const repoTaskId = await addGitHubTask('/repos/owner/repo', {
        priority: 'normal',
        context: { step: 'repo-info' }
      })

      // 3. Firebase에 로그 저장
      const logTaskId = await addFirebaseTask({
        operation: 'log',
        data: {
          workflow: 'auto-issue-creation',
          timestamp: Date.now(),
          tasks: [codeTaskId, repoTaskId]
        }
      })

      setResults(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        workflow: 'Multi-API Workflow',
        tasks: [codeTaskId, repoTaskId, logTaskId]
      }])

    } catch (error) {
      console.error('워크플로 실행 실패:', error)
    }
  }

  return (
    <div className="example-container">
      <h3>🔗 다중 API 통합</h3>
      <p>Claude, GitHub, Firebase API를 순차적으로 사용하는 워크플로입니다.</p>

      <button onClick={handleWorkflow} className="example-btn">
        Multi-API 워크플로 실행
      </button>

      <div className="api-status">
        <h4>API 상태:</h4>
        <div className="status-grid">
          {status?.services && Object.entries(status.services).map(([id, service]) => (
            <div key={id} className={`status-card ${service.status}`}>
              <div className="service-name">{service.name}</div>
              <div className="service-status">{service.status}</div>
              {service.resetTime && service.status === 'limited' && (
                <div className="reset-time">
                  복구 예정: {new Date(service.resetTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="results">
          <h4>실행 결과:</h4>
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <div className="timestamp">{result.timestamp}</div>
              <div className="workflow">{result.workflow}</div>
              <div className="tasks">작업 ID: {result.tasks.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 예제 4: 실시간 모니터링 대시보드
 */
export const MonitoringDashboard = () => {
  const { status } = useTokenManager()
  const { tokenManager, indexedDB } = useTokenManagerContext()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      if (indexedDB) {
        try {
          const recentHistory = await indexedDB.getHistory({ limit: 10 })
          setHistory(recentHistory)

          const storageStats = await indexedDB.getStorageStats()
          setStats(storageStats)
        } catch (error) {
          console.error('히스토리 로드 실패:', error)
        }
      }
    }

    loadHistory()
    const interval = setInterval(loadHistory, 5000)
    return () => clearInterval(interval)
  }, [indexedDB])

  const handleCleanup = async () => {
    if (indexedDB) {
      await indexedDB.cleanup()
      // 통계 다시 로드
      const storageStats = await indexedDB.getStorageStats()
      setStats(storageStats)
    }
  }

  return (
    <div className="example-container">
      <h3>📊 실시간 모니터링 대시보드</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>현재 상태</h4>
          <div className="metrics">
            <div>활성 상태: {status?.isActive ? '✅' : '❌'}</div>
            <div>대기 작업: {status?.queueLength || 0}개</div>
            <div>현재 작업: {status?.currentTask?.type || '없음'}</div>
          </div>
        </div>

        <div className="dashboard-card">
          <h4>저장소 통계</h4>
          {stats ? (
            <div className="metrics">
              <div>토큰 상태: {stats.tokenStates?.count || 0}개</div>
              <div>작업 히스토리: {stats.taskHistory?.count || 0}개</div>
              <div>작업 큐: {stats.taskQueues?.count || 0}개</div>
            </div>
          ) : (
            <div>로딩 중...</div>
          )}
          <button onClick={handleCleanup} className="example-btn secondary">
            오래된 데이터 정리
          </button>
        </div>

        <div className="dashboard-card">
          <h4>최근 작업 히스토리</h4>
          <div className="history-list">
            {history.length > 0 ? (
              history.map((task, index) => (
                <div key={index} className="history-item">
                  <div className="task-type">{task.type}</div>
                  <div className="task-status">{task.status}</div>
                  <div className="task-time">
                    {new Date(task.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div>히스토리가 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 메인 예제 앱
 */
const TokenManagerExamplesApp = () => {
  const [activeExample, setActiveExample] = useState('basic')

  const examples = {
    basic: { component: BasicUsageExample, title: '기본 사용법' },
    error: { component: ErrorHandlingExample, title: '에러 핸들링' },
    multi: { component: MultiAPIExample, title: '다중 API' },
    monitor: { component: MonitoringDashboard, title: '모니터링' }
  }

  const ActiveComponent = examples[activeExample].component

  return (
    <TokenManagerProvider
      showIndicator={true}
      indicatorPosition="bottom-right"
      autoStart={true}
    >
      <div className="examples-app">
        <header>
          <h1>🤖 Enhanced Token Manager 예제</h1>
          <p>토큰 소진 후 자동 재개 시스템 사용법</p>
        </header>

        <nav className="examples-nav">
          {Object.entries(examples).map(([key, { title }]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={`nav-btn ${activeExample === key ? 'active' : ''}`}
            >
              {title}
            </button>
          ))}
        </nav>

        <main>
          <ActiveComponent />
        </main>

        <style jsx>{`
          .examples-app {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          header {
            text-align: center;
            margin-bottom: 30px;
          }

          header h1 {
            color: #333;
            margin-bottom: 10px;
          }

          header p {
            color: #666;
            font-size: 18px;
          }

          .examples-nav {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            justify-content: center;
          }

          .nav-btn {
            padding: 10px 20px;
            border: 2px solid #007bff;
            background: white;
            color: #007bff;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .nav-btn:hover {
            background: #f8f9fa;
          }

          .nav-btn.active {
            background: #007bff;
            color: white;
          }

          .example-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .example-container h3 {
            margin-top: 0;
            color: #333;
          }

          .example-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            background: #007bff;
            color: white;
            cursor: pointer;
            margin: 5px;
            transition: background 0.2s ease;
          }

          .example-btn:hover {
            background: #0056b3;
          }

          .example-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .example-btn.critical {
            background: #dc3545;
          }

          .example-btn.critical:hover {
            background: #c82333;
          }

          .example-btn.secondary {
            background: #6c757d;
          }

          .example-btn.secondary:hover {
            background: #545b62;
          }

          .status-info, .error-log, .results {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
          }

          .retry-status {
            margin: 15px 0;
            padding: 10px;
            background: #fff3cd;
            color: #856404;
            border-radius: 6px;
            text-align: center;
          }

          .error-item, .result-item, .history-item {
            display: flex;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }

          .timestamp {
            font-weight: 600;
            color: #666;
            min-width: 80px;
          }

          .service {
            font-weight: 600;
            color: #007bff;
            min-width: 80px;
          }

          .message {
            flex: 1;
          }

          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }

          .dashboard-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }

          .dashboard-card h4 {
            margin-top: 0;
            color: #333;
          }

          .metrics div {
            margin: 8px 0;
          }

          .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
          }

          .status-card {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
          }

          .status-card.available {
            background: #d4edda;
            color: #155724;
          }

          .status-card.limited {
            background: #fff3cd;
            color: #856404;
          }

          .status-card.error {
            background: #f8d7da;
            color: #721c24;
          }

          .service-name {
            font-weight: 600;
            margin-bottom: 5px;
          }

          .reset-time {
            font-size: 12px;
            margin-top: 5px;
          }

          .history-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .task-type {
            font-weight: 600;
            color: #007bff;
          }

          .task-status {
            color: #28a745;
          }

          .task-time {
            color: #666;
            font-size: 12px;
          }
        `}</style>
      </div>
    </TokenManagerProvider>
  )
}

export default TokenManagerExamplesApp