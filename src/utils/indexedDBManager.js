/**
 * IndexedDB Manager for Enhanced Token Manager
 * Provides persistent storage for token states and task queues
 */

class IndexedDBManager {
  constructor() {
    this.dbName = 'EnhancedTokenManagerDB'
    this.dbVersion = 1
    this.db = null
    this.stores = {
      tokenStates: 'tokenStates',
      taskQueues: 'taskQueues',
      taskHistory: 'taskHistory'
    }
  }

  /**
   * 데이터베이스 초기화
   */
  async init() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('IndexedDB 열기 실패:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ IndexedDB 초기화 완료')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 토큰 상태 저장소
        if (!db.objectStoreNames.contains(this.stores.tokenStates)) {
          const tokenStore = db.createObjectStore(this.stores.tokenStates, {
            keyPath: 'id'
          })
          tokenStore.createIndex('timestamp', 'timestamp', { unique: false })
          tokenStore.createIndex('serviceId', 'serviceId', { unique: false })
        }

        // 작업 큐 저장소
        if (!db.objectStoreNames.contains(this.stores.taskQueues)) {
          const queueStore = db.createObjectStore(this.stores.taskQueues, {
            keyPath: 'id'
          })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
          queueStore.createIndex('priority', 'priority', { unique: false })
          queueStore.createIndex('status', 'status', { unique: false })
        }

        // 작업 히스토리 저장소
        if (!db.objectStoreNames.contains(this.stores.taskHistory)) {
          const historyStore = db.createObjectStore(this.stores.taskHistory, {
            keyPath: 'id'
          })
          historyStore.createIndex('timestamp', 'timestamp', { unique: false })
          historyStore.createIndex('status', 'status', { unique: false })
          historyStore.createIndex('serviceId', 'serviceId', { unique: false })
        }

        console.log('🔧 IndexedDB 스키마 생성 완료')
      }
    })
  }

  /**
   * 토큰 상태 저장
   */
  async saveTokenState(serviceId, state) {
    await this.init()

    const stateData = {
      id: `${serviceId}-${Date.now()}`,
      serviceId,
      state,
      timestamp: Date.now()
    }

    return this.performTransaction(this.stores.tokenStates, 'readwrite', (store) => {
      return store.add(stateData)
    })
  }

  /**
   * 최신 토큰 상태 조회
   */
  async getLatestTokenState(serviceId) {
    await this.init()

    return this.performTransaction(this.stores.tokenStates, 'readonly', (store) => {
      const index = store.index('serviceId')
      const request = index.getAll(serviceId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const states = request.result
          if (states.length === 0) {
            resolve(null)
            return
          }

          // 최신 상태 반환
          const latest = states.sort((a, b) => b.timestamp - a.timestamp)[0]
          resolve(latest)
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * 작업 큐 저장
   */
  async saveTaskQueue(tasks) {
    await this.init()

    return this.performTransaction(this.stores.taskQueues, 'readwrite', async (store) => {
      // 기존 작업들 삭제
      await this.clearStore(this.stores.taskQueues)

      // 새 작업들 저장
      const promises = tasks.map(task => {
        const taskData = {
          ...task,
          savedAt: Date.now()
        }
        return new Promise((resolve, reject) => {
          const request = store.add(taskData)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
      })

      return Promise.all(promises)
    })
  }

  /**
   * 작업 큐 조회
   */
  async getTaskQueue() {
    await this.init()

    return this.performTransaction(this.stores.taskQueues, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const tasks = request.result

          // 우선순위 순으로 정렬
          const priorityOrder = ['critical', 'high', 'normal', 'low']
          tasks.sort((a, b) => {
            const aPriority = priorityOrder.indexOf(a.priority)
            const bPriority = priorityOrder.indexOf(b.priority)
            return aPriority - bPriority
          })

          resolve(tasks)
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * 작업 히스토리에 추가
   */
  async addToHistory(task) {
    await this.init()

    const historyData = {
      ...task,
      archivedAt: Date.now()
    }

    return this.performTransaction(this.stores.taskHistory, 'readwrite', (store) => {
      return store.add(historyData)
    })
  }

  /**
   * 작업 히스토리 조회
   */
  async getHistory(options = {}) {
    await this.init()

    const {
      limit = 100,
      status = null,
      serviceId = null,
      since = null
    } = options

    return this.performTransaction(this.stores.taskHistory, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        let request

        if (status) {
          const index = store.index('status')
          request = index.getAll(status)
        } else if (serviceId) {
          const index = store.index('serviceId')
          request = index.getAll(serviceId)
        } else {
          request = store.getAll()
        }

        request.onsuccess = () => {
          let results = request.result

          // 시간 필터
          if (since) {
            results = results.filter(item => item.timestamp >= since)
          }

          // 최신순 정렬 및 제한
          results.sort((a, b) => b.timestamp - a.timestamp)
          results = results.slice(0, limit)

          resolve(results)
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * 전체 상태 저장 (백업용)
   */
  async saveFullState(state) {
    await this.init()

    const backupData = {
      id: `backup-${Date.now()}`,
      state,
      timestamp: Date.now(),
      type: 'full_backup'
    }

    return this.performTransaction(this.stores.tokenStates, 'readwrite', (store) => {
      return store.add(backupData)
    })
  }

  /**
   * 전체 상태 복원
   */
  async getFullState() {
    await this.init()

    return this.performTransaction(this.stores.tokenStates, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const states = request.result
          const backups = states.filter(item => item.type === 'full_backup')

          if (backups.length === 0) {
            resolve(null)
            return
          }

          // 최신 백업 반환
          const latest = backups.sort((a, b) => b.timestamp - a.timestamp)[0]
          resolve(latest.state)
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * 저장소 정리 (오래된 데이터 삭제)
   */
  async cleanup(olderThan = 7 * 24 * 60 * 60 * 1000) { // 기본: 7일
    await this.init()

    const cutoffTime = Date.now() - olderThan

    const stores = [this.stores.tokenStates, this.stores.taskHistory]

    for (const storeName of stores) {
      await this.performTransaction(storeName, 'readwrite', (store) => {
        const index = store.index('timestamp')
        const range = IDBKeyRange.upperBound(cutoffTime)

        return new Promise((resolve, reject) => {
          const request = index.openCursor(range)
          let deletedCount = 0

          request.onsuccess = (event) => {
            const cursor = event.target.result
            if (cursor) {
              cursor.delete()
              deletedCount++
              cursor.continue()
            } else {
              console.log(`🗑️ ${storeName}에서 ${deletedCount}개 오래된 항목 삭제됨`)
              resolve(deletedCount)
            }
          }

          request.onerror = () => reject(request.error)
        })
      })
    }
  }

  /**
   * 저장소 초기화
   */
  async clearStore(storeName) {
    await this.init()

    return this.performTransaction(storeName, 'readwrite', (store) => {
      return store.clear()
    })
  }

  /**
   * 트랜잭션 실행 헬퍼
   */
  async performTransaction(storeName, mode, callback) {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode)
      const store = transaction.objectStore(storeName)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      try {
        const result = callback(store)
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else if (result && result.onsuccess !== undefined) {
          result.onsuccess = () => resolve(result.result)
          result.onerror = () => reject(result.error)
        } else {
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 저장소 통계 조회
   */
  async getStorageStats() {
    await this.init()

    const stats = {}

    for (const [name, storeName] of Object.entries(this.stores)) {
      const count = await this.performTransaction(storeName, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.count()
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
      })

      stats[name] = { count }
    }

    return stats
  }

  /**
   * 데이터베이스 닫기
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('🔒 IndexedDB 연결 종료')
    }
  }
}

// 전역 인스턴스 생성
export const indexedDBManager = new IndexedDBManager()

export default IndexedDBManager