// Service Worker for Viet K-Connect PWA
const CACHE_NAME = 'viet-k-connect-v1.0.0'
const STATIC_CACHE_NAME = 'viet-k-static-v1'
const DYNAMIC_CACHE_NAME = 'viet-k-dynamic-v1'

// 캐시할 정적 파일들
const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // CSS and JS files will be added automatically by Vite
]

// 캐시 우선 전략을 사용할 경로들
const cacheFirstPaths = [
  /\.(js|css|woff2?|png|jpg|jpeg|svg|gif|ico)$/,
  /\/icons\//,
  /\/images\//
]

// 네트워크 우선 전략을 사용할 경로들
const networkFirstPaths = [
  /\/api\//,
  /\/posts\//,
  /\/post\//
]

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('SW: Installing Service Worker')

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching static assets')
        return cache.addAll(staticAssets)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('SW: Activating Service Worker')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// 요청 처리 (캐시 전략)
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 같은 도메인의 GET 요청만 처리
  if (url.origin !== location.origin || request.method !== 'GET') {
    return
  }

  // HTML 페이지 요청 처리
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // 정적 자산 처리 (캐시 우선)
  if (cacheFirstPaths.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleCacheFirst(request))
    return
  }

  // API 요청 처리 (네트워크 우선)
  if (networkFirstPaths.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleNetworkFirst(request))
    return
  }

  // 기본 전략: 네트워크 우선, 캐시 백업
  event.respondWith(handleNetworkFirst(request))
})

// 네비게이션 요청 처리 (앱 셸 패턴)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // 네트워크 응답을 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
  } catch (error) {
    console.log('SW: Network failed for navigation request')
  }

  // 네트워크 실패 시 캐시에서 찾기
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // 캐시에도 없으면 오프라인 페이지 반환
  const offlinePage = await caches.match('/offline.html')
  if (offlinePage) {
    return offlinePage
  }

  // 오프라인 페이지도 없으면 기본 응답
  return new Response('오프라인 상태입니다. 인터넷 연결을 확인해주세요.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}

// 캐시 우선 전략
async function handleCacheFirst(request) {
  // 먼저 캐시에서 찾기
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    // 캐시에 없으면 네트워크에서 가져오기
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // 응답을 캐시에 저장
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('SW: Cache first strategy failed:', error)
    return new Response('리소스를 불러올 수 없습니다.', {
      status: 404,
      statusText: 'Not Found'
    })
  }
}

// 네트워크 우선 전략
async function handleNetworkFirst(request) {
  try {
    // 먼저 네트워크에서 시도
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // 성공한 응답을 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('SW: Network first strategy - trying cache fallback')

    // 네트워크 실패 시 캐시에서 찾기
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 캐시에도 없으면 오류 응답
    return new Response('네트워크 연결을 확인해주세요.', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('SW: Background sync triggered:', event.tag)

  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts())
  }
})

// 게시물 동기화
async function syncPosts() {
  try {
    // 오프라인 중에 작성된 게시물들을 서버에 동기화
    console.log('SW: Syncing posts with server')
    // TODO: IndexedDB에서 동기화 대기 중인 데이터 가져와서 서버에 전송
  } catch (error) {
    console.error('SW: Failed to sync posts:', error)
  }
}

// 푸시 알림 처리
self.addEventListener('push', event => {
  console.log('SW: Push notification received')

  if (!event.data) {
    return
  }

  const data = event.data.json()
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.url ? { url: data.url } : {},
    actions: [
      {
        action: 'open',
        title: '열기',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/action-close.png'
      }
    ],
    requireInteraction: true,
    renotify: true,
    tag: data.tag || 'default',
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    silent: false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Viet K-Connect', options)
  )
})

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 이미 열린 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }

        // 새 탭 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// 메시지 처리 (앱과의 통신)
self.addEventListener('message', event => {
  const { type, payload } = event.data

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => cache.addAll(payload.urls))
      )
      break

    default:
      console.log('SW: Unknown message type:', type)
  }
})

// 주기적 백그라운드 동기화 (실험적 기능)
self.addEventListener('periodicsync', event => {
  console.log('SW: Periodic sync triggered:', event.tag)

  if (event.tag === 'periodic-sync') {
    event.waitUntil(performPeriodicSync())
  }
})

// 주기적 동기화 작업
async function performPeriodicSync() {
  try {
    console.log('SW: Performing periodic background sync')
    // TODO: 주기적으로 수행할 작업들
    // - 새로운 알림 확인
    // - 캐시 정리
    // - 오프라인 데이터 동기화
  } catch (error) {
    console.error('SW: Periodic sync failed:', error)
  }
}

console.log('SW: Service Worker script loaded')