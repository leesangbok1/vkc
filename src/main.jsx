import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 자동 워크플로 시스템 초기화
import './utils/issue-registry.js'

// 오류 감지 에이전트 초기화
import './utils/error-detection-agent.js'

// Claude 자동 재개 시스템 초기화
import './utils/claude-auto-resume.js'

// React 18의 새로운 Root API 사용
ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// 개발 환경에서만 핫 모듈 리플레이스먼트 활성화
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Service Worker 등록 (프로덕션 환경에서만)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('SW: Service Worker registered successfully:', registration)

      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전이 설치됨 - 사용자에게 알림
              showUpdateNotification()
            }
          })
        }
      })

      // 주기적으로 업데이트 확인
      setInterval(() => {
        registration.update()
      }, 60000) // 1분마다

    } catch (error) {
      console.error('SW: Service Worker registration failed:', error)
    }
  })

  // 사용자에게 업데이트 알림 표시
  function showUpdateNotification() {
    const updateBanner = document.createElement('div')
    updateBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #007bff;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `
    updateBanner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
        <span>🔄 새 버전이 있습니다!</span>
        <button onclick="window.location.reload()" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">업데이트</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        ">✕</button>
      </div>
    `
    document.body.appendChild(updateBanner)

    // 10초 후 자동으로 제거
    setTimeout(() => {
      if (updateBanner.parentElement) {
        updateBanner.remove()
      }
    }, 10000)
  }
}

// PWA 설치 프롬프트 처리
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: Install prompt available')
  e.preventDefault()
  deferredPrompt = e

  // 설치 버튼 표시
  showInstallButton()
})

function showInstallButton() {
  const installButton = document.createElement('button')
  installButton.textContent = '📱 앱 설치'
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
    z-index: 1000;
    transition: all 0.3s ease;
  `

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: Install prompt result:', outcome)
      deferredPrompt = null
      installButton.remove()
    }
  })

  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)'
    installButton.style.boxShadow = '0 6px 16px rgba(0,123,255,0.4)'
  })

  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)'
    installButton.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)'
  })

  document.body.appendChild(installButton)

  // 30초 후 자동으로 제거
  setTimeout(() => {
    if (installButton.parentElement) {
      installButton.remove()
    }
  }, 30000)
}

// PWA 설치 완료 감지
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA: App was installed successfully')

  // 설치 완료 알림 표시
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(40,167,69,0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: slideIn 0.3s ease;
  `

  notification.innerHTML = '✅ 앱이 성공적으로 설치되었습니다!'
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
})

// 온라인/오프라인 상태 모니터링
window.addEventListener('online', () => {
  console.log('Network: Back online')
  showNetworkStatus('온라인 상태로 돌아왔습니다', '#28a745')
})

window.addEventListener('offline', () => {
  console.log('Network: Gone offline')
  showNetworkStatus('오프라인 상태입니다', '#dc3545')
})

function showNetworkStatus(message, color) {
  const existing = document.querySelector('.network-status-notification')
  if (existing) {
    existing.remove()
  }

  const notification = document.createElement('div')
  notification.className = 'network-status-notification'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color};
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideDown 0.3s ease;
  `

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 3000)
}

// CSS 애니메이션 추가
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
`
document.head.appendChild(style)