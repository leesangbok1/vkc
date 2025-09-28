// Popup UI 스크립트

class PopupManager {
    constructor() {
        this.isLoading = false;
        this.sessions = [];
        this.settings = {
            notifications: true,
            autoResume: true,
            debug: false
        };

        this.init();
    }

    async init() {
        console.log('팝업 초기화 시작');

        // UI 요소 참조
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.pendingCount = document.getElementById('pending-count');
        this.lastActivity = document.getElementById('last-activity');
        this.sessionsList = document.getElementById('sessions-list');

        // 버튼 이벤트 리스너
        document.getElementById('refresh-btn').addEventListener('click', () => this.refresh());
        document.getElementById('test-btn').addEventListener('click', () => this.runTest());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());

        // 토글 이벤트 리스너
        document.getElementById('notifications-toggle').addEventListener('click', () => this.toggleSetting('notifications'));
        document.getElementById('auto-resume-toggle').addEventListener('click', () => this.toggleSetting('autoResume'));
        document.getElementById('debug-toggle').addEventListener('click', () => this.toggleSetting('debug'));

        // 링크 이벤트 리스너
        document.getElementById('help-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showHelp();
        });

        document.getElementById('github-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/your-repo/claude-auto-resume' });
        });

        // 설정 로드
        await this.loadSettings();

        // 초기 데이터 로드
        await this.loadData();

        // 주기적 업데이트 (5초마다)
        setInterval(() => {
            if (!this.isLoading) {
                this.loadData();
            }
        }, 5000);
    }

    async loadData() {
        this.isLoading = true;

        try {
            // 현재 Claude.ai 탭 확인
            const claudeTabs = await this.findClaudeTabs();

            if (claudeTabs.length === 0) {
                this.updateStatus('waiting', 'Claude.ai 탭 없음');
                this.sessions = [];
            } else {
                this.updateStatus('active', `${claudeTabs.length}개 탭 모니터링 중`);

                // 세션 데이터 로드
                await this.loadSessions();
            }

            this.updateUI();
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            this.updateStatus('error', '오류 발생');
        } finally {
            this.isLoading = false;
        }
    }

    async findClaudeTabs() {
        return new Promise((resolve) => {
            chrome.tabs.query({
                url: ['https://claude.ai/*', 'https://*.claude.ai/*']
            }, (tabs) => {
                resolve(tabs || []);
            });
        });
    }

    async loadSessions() {
        try {
            const storage = await chrome.storage.local.get();
            this.sessions = [];

            for (const [key, value] of Object.entries(storage)) {
                if (key.startsWith('session_') && value.status === 'waiting_for_resume') {
                    this.sessions.push({
                        id: key,
                        ...value
                    });
                }
            }

            // 최신 순으로 정렬
            this.sessions.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('세션 로드 실패:', error);
            this.sessions = [];
        }
    }

    updateStatus(type, text) {
        this.statusIndicator.className = `indicator ${type}`;
        this.statusText.textContent = text;
    }

    updateUI() {
        // 대기 중인 세션 수 업데이트
        this.pendingCount.textContent = `${this.sessions.length}개`;

        // 마지막 활동 시간 업데이트
        if (this.sessions.length > 0) {
            const latestSession = this.sessions[0];
            this.lastActivity.textContent = new Date(latestSession.timestamp).toLocaleTimeString();
        } else {
            this.lastActivity.textContent = '없음';
        }

        // 세션 목록 업데이트
        this.updateSessionsList();
    }

    updateSessionsList() {
        if (this.sessions.length === 0) {
            this.sessionsList.innerHTML = '<div class="no-sessions">대기 중인 세션이 없습니다</div>';
            return;
        }

        const sessionsHTML = this.sessions.map(session => {
            const messagePreview = session.lastMessage ?
                session.lastMessage.substring(0, 50) + (session.lastMessage.length > 50 ? '...' : '') :
                '메시지 없음';

            const timeAgo = this.getTimeAgo(session.timestamp);

            return `
                <div class="session-item">
                    <div class="session-message" title="${session.lastMessage || ''}">${messagePreview}</div>
                    <div class="session-time">${timeAgo} • 탭 ID: ${session.tabId}</div>
                </div>
            `;
        }).join('');

        this.sessionsList.innerHTML = sessionsHTML;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;

        return new Date(timestamp).toLocaleDateString();
    }

    async refresh() {
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.disabled = true;
        refreshBtn.textContent = '새로고침...';

        try {
            await this.loadData();
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '새로고침';
        }
    }

    async runTest() {
        const testBtn = document.getElementById('test-btn');
        testBtn.disabled = true;
        testBtn.textContent = '테스트 중...';

        try {
            // Claude.ai 탭이 있는지 확인
            const claudeTabs = await this.findClaudeTabs();

            if (claudeTabs.length === 0) {
                alert('Claude.ai 탭을 먼저 열어주세요.');
                return;
            }

            // 테스트 세션 데이터 생성
            const testSession = {
                url: claudeTabs[0].url,
                timestamp: Date.now(),
                lastMessage: '테스트 메시지: 자동 재개 기능 테스트',
                conversationId: 'test_' + Date.now(),
                pageTitle: 'Claude Test',
                retryAttempts: 0,
                tabId: claudeTabs[0].id,
                status: 'waiting_for_resume'
            };

            // 백그라운드에 테스트 세션 저장
            await chrome.runtime.sendMessage({
                type: 'SAVE_SESSION',
                data: testSession
            });

            // 1분 후 재개 예약 (테스트용)
            await chrome.runtime.sendMessage({
                type: 'SCHEDULE_RESUME',
                resumeTime: Date.now() + (1 * 60 * 1000), // 1분 후
                tabId: claudeTabs[0].id
            });

            alert('테스트 세션이 생성되었습니다. 1분 후 자동 재개됩니다.');

            // UI 업데이트
            await this.loadData();
        } catch (error) {
            console.error('테스트 실행 실패:', error);
            alert('테스트 실행 중 오류가 발생했습니다.');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = '테스트';
        }
    }

    async clearAll() {
        if (!confirm('모든 대기 중인 세션을 삭제하시겠습니까?')) {
            return;
        }

        const clearBtn = document.getElementById('clear-btn');
        clearBtn.disabled = true;
        clearBtn.textContent = '삭제 중...';

        try {
            // 모든 세션 삭제
            for (const session of this.sessions) {
                await chrome.storage.local.remove(session.id);
            }

            // 알람도 모두 삭제
            const alarms = await chrome.alarms.getAll();
            for (const alarm of alarms) {
                if (alarm.name.startsWith('resume_')) {
                    await chrome.alarms.clear(alarm.name);
                }
            }

            alert('모든 세션이 삭제되었습니다.');

            // UI 업데이트
            await this.loadData();
        } catch (error) {
            console.error('세션 삭제 실패:', error);
            alert('세션 삭제 중 오류가 발생했습니다.');
        } finally {
            clearBtn.disabled = false;
            clearBtn.textContent = '초기화';
        }
    }

    async toggleSetting(settingName) {
        this.settings[settingName] = !this.settings[settingName];

        // UI 업데이트
        const toggle = document.getElementById(`${settingName.toLowerCase()}-toggle`);
        if (this.settings[settingName]) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }

        // 설정 저장
        await this.saveSettings();

        // 알림 권한 요청 (알림 설정 활성화 시)
        if (settingName === 'notifications' && this.settings[settingName]) {
            await this.requestNotificationPermission();
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('settings');
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }

            // UI에 설정 반영
            this.updateSettingsUI();
        } catch (error) {
            console.error('설정 로드 실패:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({ settings: this.settings });
        } catch (error) {
            console.error('설정 저장 실패:', error);
        }
    }

    updateSettingsUI() {
        for (const [key, value] of Object.entries(this.settings)) {
            const toggle = document.getElementById(`${key.toLowerCase()}-toggle`);
            if (toggle) {
                if (value) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await chrome.notifications.getPermissionLevel();
            if (permission !== 'granted') {
                alert('브라우저 설정에서 알림 권한을 허용해주세요.');
            }
        } catch (error) {
            console.error('알림 권한 확인 실패:', error);
        }
    }

    showHelp() {
        const helpText = `
Claude Auto Resume 도움말

🎯 기능:
• Claude.ai에서 토큰 부족 시 자동 감지
• 5시간 후 자동으로 작업 재개
• 대화 내용 및 진행 상황 자동 저장

🚀 사용법:
1. Claude.ai 탭을 열어두세요
2. 평소처럼 Claude와 대화하세요
3. 토큰 부족 시 자동으로 감지하여 저장
4. 5시간 후 자동으로 재개됩니다

⚙️ 설정:
• 브라우저 알림: 상태 변경 시 알림 표시
• 자동 재개: 토큰 재충전 시 자동 재개
• 디버그 모드: 상세한 로그 정보 표시

❗ 주의사항:
• 브라우저를 완전히 종료하지 마세요
• Claude.ai 탭을 닫지 마세요
• 안정적인 인터넷 연결이 필요합니다

문제가 있으면 GitHub에서 이슈를 등록해주세요.
        `;

        alert(helpText);
    }
}

// 팝업 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});