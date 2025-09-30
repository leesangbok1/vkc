import React, { useState, useEffect, useRef } from 'react';
import ClaudeUsageManager from '../utils/tokenManager.js';
import { autoWorkflow } from '../utils/auto-workflow-manager.js';

/**
 * Claude API 자동 작업 관리 컴포넌트
 */
const AutoTaskManager = () => {
  const [usageManager] = useState(() => {
    try {
      return new ClaudeUsageManager()
    } catch (error) {
      console.warn('⚠️ ClaudeUsageManager 초기화 실패:', error.message)
      return null
    }
  });
  const [status, setStatus] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Claude 사용량 매니저 시작 (초기화 성공한 경우에만)
    if (usageManager) {
      usageManager.startMonitoring();
    }

    // 상태 업데이트 주기
    intervalRef.current = setInterval(() => {
      setStatus(usageManager?.getStatus() || null);
      setWorkflowStatus(autoWorkflow.getStatus());
    }, 1000);

    // 로그 추가 함수 오버라이드
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      if (args[0] && typeof args[0] === 'string' && (args[0].includes('Claude') || args[0].includes('사용량'))) {
        setLogs(prev => [...prev.slice(-19), {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: args.join(' ')
        }]);
      }
    };

    return () => {
      usageManager.stopMonitoring();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      console.log = originalLog;
    };
  }, [usageManager]);

  const addSampleTask = (type) => {
    const sampleTasks = {
      code_generation: {
        type: 'code_generation',
        name: '컴포넌트 생성',
        data: {
          prompt: 'React 로그인 컴포넌트 생성',
          fileName: 'LoginComponent.js',
          targetDirectory: 'src/components'
        }
      },
      file_modification: {
        type: 'file_modification',
        name: '파일 수정',
        data: {
          filePath: 'src/main.js',
          modifications: [
            { line: 10, action: 'add', content: '// 새로운 주석 추가' }
          ]
        }
      },
      api_call: {
        type: 'api_call',
        name: 'API 호출',
        data: {
          url: '/api/test',
          method: 'GET'
        }
      }
    };

    usageManager.addTask(sampleTasks[type]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          🤖
        </button>
      </div>
    );
  }

  // usageManager가 초기화되지 않았으면 렌더링하지 않음
  if (!usageManager) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '12px 16px',
        borderBottom: '1px solid #ddd',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🤖 Claude 자동 작업 관리자</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* 상태 정보 */}
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Claude 사용량 상태</h4>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <div>모니터링: {status?.isMonitoring ? '🟢 활성' : '🔴 비활성'}</div>
            <div>대기 중인 작업: {status?.queueLength || 0}개</div>
            <div>재시도 횟수: {status?.retryAttempts || 0}</div>
            <div>마지막 확인: {formatTime(status?.lastUsageCheck)}</div>
          </div>
        </div>

        {/* 자동 워크플로 상태 */}
        {workflowStatus && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>자동 워크플로 상태</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>실행 상태: {workflowStatus.isRunning ? '🟢 실행 중' : '🔴 대기 중'}</div>
              <div>총 이슈: {workflowStatus.totalIssues}개</div>
              <div>대기 이슈: {workflowStatus.pendingIssues}개</div>
              <div>완료 이슈: {workflowStatus.completedIssues}개</div>
              {workflowStatus.currentIssue && (
                <>
                  <div>현재 이슈: {workflowStatus.currentIssue.title}</div>
                  <div>진행률: {workflowStatus.currentIssue.currentStep + 1}/{workflowStatus.currentIssue.steps.length}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 현재 작업 */}
        {status?.currentTask && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>현재 작업</h4>
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div>ID: {status.currentTask.id}</div>
              <div>타입: {status.currentTask.type}</div>
              <div>상태: {status.currentTask.status}</div>
              <div>생성: {formatTime(status.currentTask.createdAt)}</div>
            </div>
          </div>
        )}

        {/* 작업 추가 버튼들 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>테스트 작업 추가</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => addSampleTask('code_generation')}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              코드 생성
            </button>
            <button
              onClick={() => addSampleTask('file_modification')}
              style={{
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              파일 수정
            </button>
            <button
              onClick={() => addSampleTask('api_call')}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              API 호출
            </button>
          </div>
        </div>

        {/* 제어 버튼들 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>제어</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => usageManager.checkAndResumeWork()}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              수동 확인
            </button>
            <button
              onClick={() => usageManager.clearQueue()}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              큐 초기화
            </button>
          </div>
        </div>

        {/* 로그 */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>로그</h4>
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            height: '120px',
            overflow: 'auto',
            padding: '8px'
          }}>
            {logs.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#999' }}>로그가 없습니다.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTaskManager;