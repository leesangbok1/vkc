/**
 * 자동 이슈 등록 및 해결 계획
 */

import { autoWorkflow } from './auto-workflow-manager.js'

/**
 * 현재 프로젝트의 모든 이슈를 등록하고 자동 해결 시작
 */
export function initializeAutoWorkflow() {
  // 개발 환경에서 자동 워크플로우 비활성화
  if (import.meta.env.DEV) {
    console.log('🔧 개발 모드: 자동 워크플로우가 비활성화됨')
    return
  }
  
  console.log('🚀 자동 워크플로 초기화 중...')

  // Issue 1: QuestionForm 컴포넌트 누락 (Critical)
  autoWorkflow.registerIssue('missing-question-form', {
    title: 'QuestionForm 컴포넌트 누락',
    description: 'PRD에서 요구하는 핵심 기능인 질문 작성 폼이 구현되지 않음',
    priority: 'critical',
    assignedAgents: ['coder', 'tester'],
    steps: [
      {
        name: 'QuestionForm 컴포넌트 생성',
        type: 'component',
        agent: 'coder',
        config: {
          name: 'QuestionForm',
          path: 'src/components/questions/QuestionForm.jsx',
          props: ['onSubmit', 'loading', 'user'],
          features: ['title', 'content', 'category', 'tags', 'ai-assistance']
        },
        testAfter: true
      },
      {
        name: 'HomePage에 QuestionForm 통합',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'src/pages/HomePage.jsx',
          action: 'add_component',
          component: 'QuestionForm'
        }
      },
      {
        name: 'Firebase API 연동',
        type: 'service',
        agent: 'coder',
        config: {
          target: 'src/api/firebase.js',
          function: 'createQuestion',
          integrate: 'QuestionForm'
        }
      },
      {
        name: '전체 테스트 실행',
        type: 'test',
        agent: 'tester'
      }
    ]
  })

  // Issue 2: Vanilla JS vs React 아키텍처 충돌 (High)
  autoWorkflow.registerIssue('architecture-conflict', {
    title: 'Vanilla JS vs React 아키텍처 충돌 해결',
    description: 'main.js (Vanilla)와 main.jsx (React) 혼재로 인한 라우팅 충돌',
    priority: 'high',
    assignedAgents: ['architect', 'coder'],
    dependencies: ['missing-question-form'],
    steps: [
      {
        name: '아키텍처 분석',
        type: 'architecture',
        agent: 'architect'
      },
      {
        name: 'main.js 제거 및 React로 통합',
        type: 'code',
        agent: 'coder',
        config: {
          action: 'remove_file',
          target: 'src/main.js'
        }
      },
      {
        name: 'index.html 진입점 수정',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'index.html',
          action: 'update_script_src',
          from: 'main.js',
          to: 'main.jsx'
        }
      },
      {
        name: '라우팅 시스템 통일',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'src/App.jsx',
          action: 'consolidate_routing'
        }
      }
    ]
  })

  // Issue 3: AutoTaskManager 수정 (Medium)
  autoWorkflow.registerIssue('fix-auto-task-manager', {
    title: 'AutoTaskManager 기능 복구',
    description: 'AutoTaskManager가 React 환경에서 제대로 작동하지 않음',
    priority: 'medium',
    assignedAgents: ['coder', 'debugger'],
    steps: [
      {
        name: 'AutoTaskManager React 통합',
        type: 'component',
        agent: 'coder',
        config: {
          target: 'src/components/AutoTaskManager.js',
          action: 'convert_to_jsx',
          hooks: ['useState', 'useEffect']
        }
      },
      {
        name: 'App.jsx에 AutoTaskManager 추가',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'src/App.jsx',
          action: 'add_component',
          component: 'AutoTaskManager'
        }
      }
    ]
  })

  // Issue 4: AI 기반 질문 분류 구현 (Medium)
  autoWorkflow.registerIssue('ai-question-classification', {
    title: 'AI 기반 질문 분류 시스템 구현',
    description: 'PRD에서 요구하는 GPT-3.5 기반 자동 카테고리 분류',
    priority: 'medium',
    assignedAgents: ['coder'],
    dependencies: ['missing-question-form'],
    steps: [
      {
        name: 'OpenAI API 서비스 생성',
        type: 'service',
        agent: 'coder',
        config: {
          name: 'AIClassificationService',
          path: 'src/services/ai-classification.js',
          apiKey: 'OPENAI_API_KEY'
        }
      },
      {
        name: 'QuestionForm에 AI 분류 통합',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'src/components/questions/QuestionForm.jsx',
          action: 'integrate_ai_service'
        }
      }
    ]
  })

  // Issue 5: 테스트 시스템 구축 (Medium)
  autoWorkflow.registerIssue('setup-testing', {
    title: '테스트 시스템 구축',
    description: 'Jest + React Testing Library 기반 테스트 환경 구성',
    priority: 'medium',
    assignedAgents: ['tester', 'coder'],
    steps: [
      {
        name: '테스트 의존성 설치',
        type: 'code',
        agent: 'coder',
        config: {
          action: 'install_packages',
          packages: ['@testing-library/react', '@testing-library/jest-dom', 'jest']
        }
      },
      {
        name: 'Jest 설정 파일 생성',
        type: 'code',
        agent: 'coder',
        config: {
          name: 'jest.config.js',
          path: 'jest.config.js'
        }
      },
      {
        name: 'package.json 테스트 스크립트 추가',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'package.json',
          action: 'add_script',
          script: 'test'
        }
      }
    ]
  })

  // Issue 6: 전문가 매칭 시스템 (Low)
  autoWorkflow.registerIssue('expert-matching', {
    title: '전문가 매칭 시스템 구현',
    description: '질문자와 적합한 전문가를 자동 매칭하는 알고리즘',
    priority: 'low',
    assignedAgents: ['coder'],
    dependencies: ['missing-question-form', 'ai-question-classification'],
    steps: [
      {
        name: '전문가 매칭 알고리즘 서비스 생성',
        type: 'service',
        agent: 'coder',
        config: {
          name: 'ExpertMatchingService',
          path: 'src/services/expert-matching.js'
        }
      },
      {
        name: '사용자 프로필에 전문 분야 추가',
        type: 'code',
        agent: 'coder',
        config: {
          target: 'src/api/firebase.js',
          action: 'extend_user_schema'
        }
      }
    ]
  })

  console.log('✅ 자동 워크플로 초기화 완료')
  console.log(`📋 등록된 이슈: ${autoWorkflow.issues.size}개`)

  // 자동 시작
  autoWorkflow.startNextIssue()
}

/**
 * 워크플로 상태 모니터링 UI
 */
export function createWorkflowMonitor() {
  const monitor = document.createElement('div')
  monitor.id = 'workflow-monitor'
  monitor.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: monospace;
    font-size: 12px;
    max-height: 400px;
    overflow-y: auto;
  `

  const updateMonitor = () => {
    const status = autoWorkflow.getStatus()
    monitor.innerHTML = `
      <div style="padding: 12px; background: #f5f5f5; border-radius: 8px 8px 0 0;">
        <strong>🤖 자동 워크플로</strong>
        <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; cursor: pointer;">×</button>
      </div>
      <div style="padding: 12px;">
        <div><strong>상태:</strong> ${status.isRunning ? '🟢 실행 중' : '🔴 대기 중'}</div>
        <div><strong>총 이슈:</strong> ${status.totalIssues}</div>
        <div><strong>대기:</strong> ${status.pendingIssues}</div>
        <div><strong>완료:</strong> ${status.completedIssues}</div>

        ${status.currentIssue ? `
          <hr style="margin: 8px 0;">
          <div><strong>현재 이슈:</strong></div>
          <div style="background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 4px 0;">
            <div><strong>${status.currentIssue.title}</strong></div>
            <div>단계: ${status.currentIssue.currentStep + 1}/${status.currentIssue.steps.length}</div>
            <div>우선순위: ${status.currentIssue.priority}</div>
          </div>
        ` : ''}

        <hr style="margin: 8px 0;">
        <div><strong>서브에이전트:</strong></div>
        ${Object.entries(status.subAgents).map(([name, agent]) => `
          <div style="margin: 2px 0;">
            ${name}: ${agent.status === 'running' ? '🟡' : agent.status === 'completed' ? '🟢' : '⚪'}
          </div>
        `).join('')}
      </div>
    `
  }

  // 초기 업데이트
  updateMonitor()

  // 주기적 업데이트
  setInterval(updateMonitor, 1000)

  document.body.appendChild(monitor)
  return monitor
}

// 자동 시작 (개발 모드에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // DOM이 로드된 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        initializeAutoWorkflow()
        createWorkflowMonitor()
      }, 2000)
    })
  } else {
    setTimeout(() => {
      initializeAutoWorkflow()
      createWorkflowMonitor()
    }, 2000)
  }
}