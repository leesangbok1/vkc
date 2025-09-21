// Claude.ai 페이지에서 토큰 부족 상황을 모니터링하는 Content Script

class ClaudeAutoResumeMonitor {
    constructor() {
        this.isMonitoring = false;
        this.lastMessage = '';
        this.messageObserver = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;

        // 토큰 부족을 나타내는 키워드들
        this.tokenLimitKeywords = [
            'rate limit',
            'too many requests',
            'try again',
            'usage limit',
            'wait before',
            '429',
            'quota exceeded',
            'limit exceeded',
            'please wait',
            '다시 시도',
            '사용량 한도',
            '잠시 후 시도',
            '너무 많은 요청'
        ];

        this.init();
    }

    init() {
        console.log('🤖 Claude Auto Resume: 모니터링 시작');
        this.startMonitoring();
        this.setupMessageObserver();
        this.restoreUnfinishedSession();
    }

    startMonitoring() {
        this.isMonitoring = true;

        // 페이지 상태 주기적 확인
        setInterval(() => {
            this.checkPageStatus();
        }, 2000);

        // 토큰 부족 메시지 감지
        this.detectTokenLimitMessage();
    }

    setupMessageObserver() {
        // DOM 변화 감지로 새로운 메시지 모니터링
        this.messageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkElementForTokenLimit(node);
                        }
                    });
                }
            });
        });

        this.messageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    checkElementForTokenLimit(element) {
        const textContent = element.textContent?.toLowerCase() || '';

        // 토큰 부족 키워드 확인
        const hasTokenLimitMessage = this.tokenLimitKeywords.some(keyword =>
            textContent.includes(keyword.toLowerCase())
        );

        if (hasTokenLimitMessage) {
            console.log('🚨 토큰 부족 감지:', textContent);
            this.handleTokenLimit();
        }
    }

    detectTokenLimitMessage() {
        // 주기적으로 페이지에서 토큰 부족 메시지 찾기
        setInterval(() => {
            const errorElements = document.querySelectorAll('[class*="error"], [class*="warning"], [class*="limit"], [role="alert"]');

            errorElements.forEach(element => {
                this.checkElementForTokenLimit(element);
            });

            // 특정 클래스나 ID로 토큰 제한 메시지 찾기
            const commonSelectors = [
                '.error-message',
                '.rate-limit',
                '.usage-limit',
                '[data-testid="error"]',
                '.toast',
                '.notification',
                '.alert'
            ];

            commonSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    this.checkElementForTokenLimit(element);
                });
            });
        }, 3000);
    }

    checkPageStatus() {
        // 입력 필드 상태 확인
        const inputField = this.findInputField();
        if (inputField && inputField.disabled) {
            console.log('⚠️ 입력 필드가 비활성화됨 - 토큰 제한 가능성');
            this.handleTokenLimit();
        }

        // 네트워크 응답 에러 확인
        this.checkNetworkErrors();
    }

    findInputField() {
        // Claude 입력 필드 찾기 (다양한 선택자 시도)
        const selectors = [
            'textarea[placeholder*="message"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="메시지"]',
            'div[contenteditable="true"]',
            'input[type="text"]',
            '[data-testid="chat-input"]',
            '[role="textbox"]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }

        return null;
    }

    async handleTokenLimit() {
        console.log('🔄 토큰 제한 처리 시작');

        // 현재 대화 내용 저장
        await this.saveCurrentSession();

        // 5시간 타이머 설정
        await this.scheduleResume();

        // 사용자에게 알림
        this.showNotification('토큰 한도 도달', '5시간 후 자동으로 작업이 재개됩니다.');
    }

    async saveCurrentSession() {
        try {
            const sessionData = {
                url: window.location.href,
                timestamp: Date.now(),
                lastMessage: this.getLastUserMessage(),
                conversationId: this.extractConversationId(),
                pageTitle: document.title,
                retryAttempts: this.retryAttempts
            };

            // Chrome Storage에 저장
            await chrome.runtime.sendMessage({
                type: 'SAVE_SESSION',
                data: sessionData
            });

            console.log('💾 세션 데이터 저장 완료:', sessionData);
        } catch (error) {
            console.error('❌ 세션 저장 실패:', error);
        }
    }

    getLastUserMessage() {
        // 마지막 사용자 메시지 추출
        const messageElements = document.querySelectorAll('[data-role="user"], .user-message, .human-message');
        if (messageElements.length > 0) {
            const lastMessage = messageElements[messageElements.length - 1];
            return lastMessage.textContent?.trim() || '';
        }

        // 입력 필드에서 현재 입력 중인 텍스트 가져오기
        const inputField = this.findInputField();
        if (inputField) {
            return inputField.value || inputField.textContent || '';
        }

        return '';
    }

    extractConversationId() {
        // URL에서 대화 ID 추출
        const urlMatch = window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
        return urlMatch ? urlMatch[1] : null;
    }

    async scheduleResume() {
        const resumeTime = Date.now() + (5 * 60 * 60 * 1000); // 5시간 후

        await chrome.runtime.sendMessage({
            type: 'SCHEDULE_RESUME',
            resumeTime: resumeTime,
            tabId: await this.getCurrentTabId()
        });

        console.log(`⏰ 재개 예약됨: ${new Date(resumeTime).toLocaleString()}`);
    }

    async getCurrentTabId() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_TAB_ID' }, (response) => {
                resolve(response?.tabId);
            });
        });
    }

    async restoreUnfinishedSession() {
        // 페이지 로드 시 미완료 세션이 있는지 확인
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_PENDING_SESSION'
            });

            if (response?.sessionData) {
                console.log('🔄 미완료 세션 복원:', response.sessionData);

                // 잠시 대기 후 메시지 재전송
                setTimeout(() => {
                    this.resumeSession(response.sessionData);
                }, 3000);
            }
        } catch (error) {
            console.error('❌ 세션 복원 확인 실패:', error);
        }
    }

    resumeSession(sessionData) {
        if (!sessionData.lastMessage) {
            console.log('⚠️ 복원할 메시지가 없습니다');
            return;
        }

        console.log('📝 메시지 재전송 시도:', sessionData.lastMessage);

        // 입력 필드 찾기
        const inputField = this.findInputField();

        if (inputField) {
            // 메시지 입력
            if (inputField.tagName.toLowerCase() === 'textarea' || inputField.tagName.toLowerCase() === 'input') {
                inputField.value = sessionData.lastMessage;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (inputField.contentEditable === 'true') {
                inputField.textContent = sessionData.lastMessage;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // 전송 버튼 찾기 및 클릭
            setTimeout(() => {
                this.clickSendButton();
            }, 1000);
        } else {
            console.error('❌ 입력 필드를 찾을 수 없습니다');
            this.retryAttempts++;

            if (this.retryAttempts < this.maxRetries) {
                setTimeout(() => {
                    this.resumeSession(sessionData);
                }, 5000);
            }
        }
    }

    clickSendButton() {
        // 전송 버튼 찾기
        const sendSelectors = [
            'button[type="submit"]',
            'button[aria-label*="send"]',
            'button[aria-label*="Send"]',
            'button[aria-label*="전송"]',
            '[data-testid="send-button"]',
            'svg[aria-label*="send"]',
            '.send-button'
        ];

        for (const selector of sendSelectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                console.log('📤 전송 버튼 클릭');
                button.click();
                return true;
            }
        }

        // Enter 키 이벤트로 시도
        const inputField = this.findInputField();
        if (inputField) {
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            inputField.dispatchEvent(enterEvent);
            console.log('⌨️ Enter 키 이벤트 전송');
            return true;
        }

        console.error('❌ 전송 버튼을 찾을 수 없습니다');
        return false;
    }

    checkNetworkErrors() {
        // 페이지에서 429 에러 등 네트워크 에러 확인
        const errorTexts = document.body.textContent || '';

        if (errorTexts.includes('429') || errorTexts.includes('Too Many Requests')) {
            console.log('🚨 429 에러 감지');
            this.handleTokenLimit();
        }
    }

    showNotification(title, message) {
        // 브라우저 알림 표시
        chrome.runtime.sendMessage({
            type: 'SHOW_NOTIFICATION',
            title: title,
            message: message
        });

        // 페이지 내 시각적 알림
        this.showInPageNotification(title, message);
    }

    showInPageNotification(title, message) {
        // 페이지 상단에 알림 표시
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 300px;
        `;

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 14px;">${message}</div>
        `;

        document.body.appendChild(notification);

        // 10초 후 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    destroy() {
        this.isMonitoring = false;
        if (this.messageObserver) {
            this.messageObserver.disconnect();
        }
    }
}

// 페이지 로드 완료 후 모니터링 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ClaudeAutoResumeMonitor();
    });
} else {
    new ClaudeAutoResumeMonitor();
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.claudeAutoResumeMonitor) {
        window.claudeAutoResumeMonitor.destroy();
    }
});