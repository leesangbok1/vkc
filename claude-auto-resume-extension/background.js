// Background Service Worker - 백그라운드에서 세션 관리 및 재개 처리

class ClaudeAutoResumeBackground {
    constructor() {
        this.sessions = new Map(); // 진행 중인 세션들
        this.alarms = new Map();   // 알람 ID 관리
        this.init();
    }

    init() {
        console.log('🚀 Claude Auto Resume Background 시작');

        // 메시지 리스너 설정
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // 비동기 응답을 위해
        });

        // 알람 리스너 설정
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });

        // 탭 업데이트 리스너
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // 확장 프로그램 시작 시 저장된 세션 복원
        this.restoreSavedSessions();
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'SAVE_SESSION':
                    await this.saveSession(message.data, sender.tab?.id);
                    sendResponse({ success: true });
                    break;

                case 'SCHEDULE_RESUME':
                    await this.scheduleResume(message.resumeTime, message.tabId);
                    sendResponse({ success: true });
                    break;

                case 'GET_PENDING_SESSION':
                    const sessionData = await this.getPendingSession(sender.tab?.id);
                    sendResponse({ sessionData });
                    break;

                case 'GET_TAB_ID':
                    sendResponse({ tabId: sender.tab?.id });
                    break;

                case 'SHOW_NOTIFICATION':
                    await this.showNotification(message.title, message.message);
                    sendResponse({ success: true });
                    break;

                case 'CLEAR_SESSION':
                    await this.clearSession(message.tabId);
                    sendResponse({ success: true });
                    break;

                default:
                    console.warn('알 수 없는 메시지 타입:', message.type);
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('메시지 처리 오류:', error);
            sendResponse({ error: error.message });
        }
    }

    async saveSession(sessionData, tabId) {
        const sessionKey = `session_${tabId}`;

        // 세션 데이터에 추가 정보 포함
        const fullSessionData = {
            ...sessionData,
            tabId: tabId,
            savedAt: Date.now(),
            status: 'waiting_for_resume'
        };

        // 메모리와 스토리지에 저장
        this.sessions.set(sessionKey, fullSessionData);

        await chrome.storage.local.set({
            [sessionKey]: fullSessionData,
            'last_session_key': sessionKey
        });

        console.log('💾 세션 저장 완료:', sessionKey, fullSessionData);
    }

    async scheduleResume(resumeTime, tabId) {
        const alarmName = `resume_${tabId}_${Date.now()}`;

        // Chrome 알람 생성 (5시간 후)
        await chrome.alarms.create(alarmName, {
            when: resumeTime
        });

        // 알람 정보 저장
        this.alarms.set(alarmName, {
            tabId: tabId,
            resumeTime: resumeTime,
            createdAt: Date.now()
        });

        await chrome.storage.local.set({
            [`alarm_${alarmName}`]: {
                tabId: tabId,
                resumeTime: resumeTime,
                createdAt: Date.now()
            }
        });

        console.log(`⏰ 재개 알람 설정 완료: ${alarmName} at ${new Date(resumeTime).toLocaleString()}`);

        // 즉시 알림 표시
        await this.showNotification(
            '🤖 Claude Auto Resume',
            `5시간 후 자동으로 작업이 재개됩니다.\n재개 시간: ${new Date(resumeTime).toLocaleString()}`
        );
    }

    async handleAlarm(alarm) {
        console.log('⏰ 알람 실행:', alarm.name);

        const alarmInfo = this.alarms.get(alarm.name);
        if (!alarmInfo) {
            console.warn('알람 정보를 찾을 수 없습니다:', alarm.name);
            return;
        }

        const { tabId } = alarmInfo;

        try {
            // 탭이 여전히 존재하는지 확인
            const tab = await chrome.tabs.get(tabId);

            if (tab) {
                // Claude.ai 페이지로 이동 (필요한 경우)
                if (!tab.url.includes('claude.ai')) {
                    await chrome.tabs.update(tabId, {
                        url: 'https://claude.ai/chat'
                    });

                    // 페이지 로드 대기
                    await this.waitForTabLoad(tabId);
                }

                // 탭을 활성화
                await chrome.tabs.update(tabId, { active: true });

                // 알림 표시
                await this.showNotification(
                    '🔄 Claude Auto Resume',
                    '토큰이 재충전되었습니다. 작업을 재개합니다.'
                );

                // Content Script로 재개 메시지 전송
                await chrome.tabs.sendMessage(tabId, {
                    type: 'RESUME_SESSION'
                });

                console.log('✅ 세션 재개 완료:', tabId);
            } else {
                console.warn('탭을 찾을 수 없습니다:', tabId);

                // 새 탭에서 Claude.ai 열기
                const newTab = await chrome.tabs.create({
                    url: 'https://claude.ai/chat',
                    active: true
                });

                // 잠시 대기 후 세션 데이터 전송
                setTimeout(async () => {
                    const sessionData = await this.getPendingSession(tabId);
                    if (sessionData) {
                        await chrome.tabs.sendMessage(newTab.id, {
                            type: 'RESTORE_SESSION',
                            sessionData: sessionData
                        });
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('알람 처리 오류:', error);

            // 오류 발생 시 새 탭에서 열기
            try {
                await chrome.tabs.create({
                    url: 'https://claude.ai/chat',
                    active: true
                });

                await this.showNotification(
                    '⚠️ Claude Auto Resume',
                    '기존 탭을 찾을 수 없어 새 탭에서 재개합니다.'
                );
            } catch (createError) {
                console.error('새 탭 생성 실패:', createError);
            }
        } finally {
            // 알람 정리
            this.alarms.delete(alarm.name);
            await chrome.storage.local.remove(`alarm_${alarm.name}`);
        }
    }

    async getPendingSession(tabId) {
        const sessionKey = `session_${tabId}`;

        // 메모리에서 먼저 확인
        if (this.sessions.has(sessionKey)) {
            const sessionData = this.sessions.get(sessionKey);
            if (sessionData.status === 'waiting_for_resume') {
                return sessionData;
            }
        }

        // 스토리지에서 확인
        const result = await chrome.storage.local.get(sessionKey);
        const sessionData = result[sessionKey];

        if (sessionData && sessionData.status === 'waiting_for_resume') {
            return sessionData;
        }

        return null;
    }

    async clearSession(tabId) {
        const sessionKey = `session_${tabId}`;

        // 메모리에서 제거
        this.sessions.delete(sessionKey);

        // 스토리지에서 제거
        await chrome.storage.local.remove(sessionKey);

        console.log('🗑️ 세션 정리 완료:', sessionKey);
    }

    async handleTabUpdate(tabId, changeInfo, tab) {
        // 탭이 Claude.ai 페이지로 변경되었을 때 처리
        if (changeInfo.status === 'complete' && tab.url && tab.url.includes('claude.ai')) {
            // 미완료 세션이 있는지 확인
            const sessionData = await this.getPendingSession(tabId);

            if (sessionData) {
                console.log('🔄 페이지 로드 완료, 세션 복원 시도:', tabId);

                // 잠시 대기 후 세션 복원 메시지 전송
                setTimeout(async () => {
                    try {
                        await chrome.tabs.sendMessage(tabId, {
                            type: 'RESTORE_SESSION',
                            sessionData: sessionData
                        });
                    } catch (error) {
                        console.error('세션 복원 메시지 전송 실패:', error);
                    }
                }, 2000);
            }
        }
    }

    async waitForTabLoad(tabId, maxWait = 30000) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const checkComplete = async () => {
                try {
                    const tab = await chrome.tabs.get(tabId);

                    if (tab.status === 'complete') {
                        resolve(true);
                        return;
                    }

                    if (Date.now() - startTime > maxWait) {
                        resolve(false);
                        return;
                    }

                    setTimeout(checkComplete, 500);
                } catch (error) {
                    resolve(false);
                }
            };

            checkComplete();
        });
    }

    async showNotification(title, message) {
        try {
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: title,
                message: message,
                priority: 2
            });
        } catch (error) {
            console.error('알림 표시 실패:', error);
        }
    }

    async restoreSavedSessions() {
        try {
            const storage = await chrome.storage.local.get();

            // 저장된 세션들 복원
            for (const [key, value] of Object.entries(storage)) {
                if (key.startsWith('session_')) {
                    this.sessions.set(key, value);
                    console.log('📥 저장된 세션 복원:', key);
                }

                if (key.startsWith('alarm_')) {
                    const alarmName = key.replace('alarm_', '');
                    this.alarms.set(alarmName, value);
                    console.log('⏰ 저장된 알람 복원:', alarmName);
                }
            }

            // 만료된 세션들 정리
            await this.cleanupExpiredSessions();
        } catch (error) {
            console.error('세션 복원 실패:', error);
        }
    }

    async cleanupExpiredSessions() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24시간

        for (const [key, sessionData] of this.sessions.entries()) {
            if (now - sessionData.savedAt > maxAge) {
                console.log('🗑️ 만료된 세션 정리:', key);
                this.sessions.delete(key);
                await chrome.storage.local.remove(key);
            }
        }
    }
}

// Background Service Worker 인스턴스 생성
let backgroundInstance;

// Service Worker 시작 시 초기화
chrome.runtime.onStartup.addListener(() => {
    backgroundInstance = new ClaudeAutoResumeBackground();
});

chrome.runtime.onInstalled.addListener(() => {
    backgroundInstance = new ClaudeAutoResumeBackground();
});

// 즉시 초기화 (이미 실행 중인 경우)
if (!backgroundInstance) {
    backgroundInstance = new ClaudeAutoResumeBackground();
}