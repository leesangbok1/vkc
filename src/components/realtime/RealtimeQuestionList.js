// 실시간 질문 목록 컴포넌트
import { listenToQuestions } from '../../api/realtime-firebase.js';
import { listenerManager } from '../../api/realtime-firebase.js';
import { notificationService } from '../../services/notification-service.js';

export class RealtimeQuestionList {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.questions = [];
    this.isLoading = true;
    this.error = null;
    this.unsubscribe = null;

    // 옵션 설정
    this.options = {
      category: null,
      sortBy: 'createdAt',
      limit: 20,
      enableNotifications: true,
      showLoadingAnimation: true,
      animateNewItems: true,
      ...options
    };

    // 바인딩
    this.handleQuestionsUpdate = this.handleQuestionsUpdate.bind(this);
    this.handleNewQuestion = this.handleNewQuestion.bind(this);

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error(`컨테이너를 찾을 수 없습니다: ${this.containerId}`);
      return;
    }

    this.render();
    this.setupRealtimeConnection();
  }

  setupRealtimeConnection() {
    // 실시간 질문 데이터 구독
    this.unsubscribe = listenToQuestions(this.handleQuestionsUpdate, {
      category: this.options.category,
      sortBy: this.options.sortBy,
      limit: this.options.limit
    });

    if (!this.unsubscribe) {
      this.error = 'Firebase 연결에 실패했습니다.';
      this.render();
    }
  }

  handleQuestionsUpdate(questions) {
    const previousQuestions = [...this.questions];
    this.questions = questions;
    this.isLoading = false;
    this.error = null;

    // 새 질문 감지 및 알림
    if (this.options.enableNotifications && previousQuestions.length > 0) {
      this.detectNewQuestions(previousQuestions, questions);
    }

    this.render();
  }

  detectNewQuestions(previousQuestions, currentQuestions) {
    const previousIds = new Set(previousQuestions.map(q => q.id));
    const newQuestions = currentQuestions.filter(q => !previousIds.has(q.id));

    if (newQuestions.length > 0) {
      newQuestions.forEach(question => {
        this.handleNewQuestion(question);
      });
    }
  }

  handleNewQuestion(question) {
    // 새 질문 알림 표시
    if (this.options.enableNotifications) {
      this.showNewQuestionNotification(question);
    }

    // 새 질문 하이라이트 효과
    if (this.options.animateNewItems) {
      setTimeout(() => {
        this.highlightNewQuestion(question.id);
      }, 100);
    }
  }

  showNewQuestionNotification(question) {
    const notification = document.createElement('div');
    notification.className = 'new-question-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✨</span>
        <span class="notification-text">새 질문: ${question.title}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // 클릭 이벤트
    notification.addEventListener('click', () => {
      window.location.href = `/post.html?id=${question.id}`;
    });

    // 닫기 이벤트
    notification.querySelector('.notification-close').addEventListener('click', (e) => {
      e.stopPropagation();
      notification.remove();
    });

    // 컨테이너 상단에 추가
    this.container.insertBefore(notification, this.container.firstChild);

    // 자동 제거 (5초 후)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  highlightNewQuestion(questionId) {
    const questionElement = this.container.querySelector(`[data-question-id=\"${questionId}\"]`);
    if (questionElement) {
      questionElement.classList.add('new-question-highlight');
      setTimeout(() => {
        questionElement.classList.remove('new-question-highlight');
      }, 3000);
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = this.generateHTML();
    this.attachEventListeners();
  }

  generateHTML() {
    if (this.error) {
      return `
        <div class="realtime-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${this.error}</div>
          <button class="retry-button" onclick="window.location.reload()">다시 시도</button>
        </div>
      `;
    }

    if (this.isLoading) {
      return this.generateLoadingHTML();
    }

    if (this.questions.length === 0) {
      return `
        <div class="no-questions">
          <div class="no-questions-icon">📝</div>
          <div class="no-questions-message">아직 질문이 없습니다.</div>
          <div class="no-questions-submessage">첫 번째 질문을 작성해보세요!</div>
        </div>
      `;
    }

    return `
      <div class="realtime-status">
        <span class="status-indicator ${this.unsubscribe ? 'connected' : 'disconnected'}"></span>
        <span class="status-text">실시간 업데이트 ${this.unsubscribe ? '연결됨' : '연결 끊어짐'}</span>
        <span class="question-count">${this.questions.length}개 질문</span>
      </div>
      <div class="questions-list">
        ${this.questions.map(question => this.generateQuestionHTML(question)).join('')}
      </div>
    `;
  }

  generateLoadingHTML() {
    if (!this.options.showLoadingAnimation) {
      return '<div class="simple-loading">로딩 중...</div>';
    }

    return `
      <div class="questions-loading">
        <div class="loading-header">
          <div class="loading-skeleton skeleton-title"></div>
          <div class="loading-skeleton skeleton-meta"></div>
        </div>
        ${Array(5).fill(0).map(() => `
          <div class="loading-question">
            <div class="loading-skeleton skeleton-title"></div>
            <div class="loading-skeleton skeleton-content"></div>
            <div class="loading-skeleton skeleton-meta"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateQuestionHTML(question) {
    const timeAgo = this.formatTimeAgo(question.createdAt);
    const authorName = question.authorName || question.author?.name || 'Unknown';
    const categoryClass = this.getCategoryClass(question.category);

    return `
      <div class="question-item" data-question-id="${question.id}">
        <div class="question-header">
          <div class="question-category ${categoryClass}">
            ${question.category || 'General'}
          </div>
          <div class="question-time">${timeAgo}</div>
        </div>

        <h3 class="question-title">
          <a href="/post.html?id=${question.id}">${this.escapeHtml(question.title)}</a>
        </h3>

        <div class="question-content">
          ${this.truncateContent(question.content, 150)}
        </div>

        <div class="question-footer">
          <div class="question-author">
            <img src="${question.author?.profilePic || '/images/default-avatar.png'}"
                 alt="${authorName}"
                 class="author-avatar">
            <span class="author-name">${authorName}</span>
          </div>

          <div class="question-stats">
            <span class="stat-item">
              <span class="stat-icon">👁️</span>
              <span class="stat-count">${question.viewCount || 0}</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">💬</span>
              <span class="stat-count">${question.answerCount || 0}</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">👍</span>
              <span class="stat-count">${question.likes || 0}</span>
            </span>
          </div>
        </div>

        ${question.tags && question.tags.length > 0 ? `
          <div class="question-tags">
            ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // === 유틸리티 메서드 ===

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - (typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime());

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  }

  getCategoryClass(category) {
    const categoryMap = {
      'Visa/Legal': 'category-visa',
      'Life': 'category-life',
      'Education': 'category-education',
      'Employment': 'category-employment',
      'Housing': 'category-housing',
      'Healthcare': 'category-healthcare',
      'General': 'category-general'
    };
    return categoryMap[category] || 'category-general';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncateContent(content, maxLength) {
    if (!content) return '';
    if (content.length <= maxLength) return this.escapeHtml(content);
    return this.escapeHtml(content.substring(0, maxLength)) + '...';
  }

  attachEventListeners() {
    // 질문 클릭 이벤트
    this.container.querySelectorAll('.question-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
          const questionId = item.dataset.questionId;
          window.location.href = `/post.html?id=${questionId}`;
        }
      });
    });

    // 새로고침 버튼 이벤트
    const refreshButton = this.container.querySelector('.refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.refresh();
      });
    }
  }

  // === 공개 메서드 ===

  refresh() {
    this.isLoading = true;
    this.error = null;
    this.render();

    // 기존 연결 해제 후 재연결
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.setupRealtimeConnection();
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.refresh();
  }

  getQuestions() {
    return [...this.questions];
  }

  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log(`실시간 질문 목록 컴포넌트 정리됨: ${this.containerId}`);
  }
}

// 사용 예제:
// const questionList = new RealtimeQuestionList('questions-container', {
//   category: 'Visa/Legal',
//   sortBy: 'createdAt',
//   enableNotifications: true
// });

export default RealtimeQuestionList;