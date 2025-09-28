// 실시간 답변 목록 컴포넌트
import { listenToAnswers } from "@services/realtime-firebase.js"';
import { notificationService } from '../../services/notification-service.js';

export class RealtimeAnswerList {
  constructor(containerId, questionId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.questionId = questionId;
    this.answers = [];
    this.isLoading = true;
    this.error = null;
    this.unsubscribe = null;
    this.currentUser = null;

    // 옵션 설정
    this.options = {
      enableNotifications: true,
      showLoadingAnimation: true,
      animateNewItems: true,
      enableVoting: true,
      enableAcceptAnswer: false,
      sortBy: 'createdAt', // 'createdAt', 'likes', 'accepted'
      maxDisplayCount: 50,
      ...options
    };

    // 바인딩
    this.handleAnswersUpdate = this.handleAnswersUpdate.bind(this);
    this.handleNewAnswer = this.handleNewAnswer.bind(this);

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error(`컨테이너를 찾을 수 없습니다: ${this.containerId}`);
      return;
    }

    // 현재 사용자 정보 로드
    this.loadCurrentUser();

    this.render();
    this.setupRealtimeConnection();
  }

  loadCurrentUser() {
    // 로컬 스토리지나 전역 변수에서 현재 사용자 정보 로드
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.warn('사용자 데이터 파싱 실패:', error);
      }
    }
  }

  setupRealtimeConnection() {
    if (!this.questionId) {
      this.error = '질문 ID가 필요합니다.';
      this.render();
      return;
    }

    // 실시간 답변 데이터 구독
    this.unsubscribe = listenToAnswers(this.questionId, this.handleAnswersUpdate);

    if (!this.unsubscribe) {
      this.error = 'Firebase 연결에 실패했습니다.';
      this.render();
    }
  }

  handleAnswersUpdate(answers) {
    const previousAnswers = [...this.answers];
    this.answers = this.sortAnswers(answers);
    this.isLoading = false;
    this.error = null;

    // 새 답변 감지 및 알림
    if (this.options.enableNotifications && previousAnswers.length > 0) {
      this.detectNewAnswers(previousAnswers, answers);
    }

    this.render();
  }

  detectNewAnswers(previousAnswers, currentAnswers) {
    const previousIds = new Set(previousAnswers.map(a => a.id));
    const newAnswers = currentAnswers.filter(a => !previousIds.has(a.id));

    if (newAnswers.length > 0) {
      newAnswers.forEach(answer => {
        this.handleNewAnswer(answer);
      });
    }
  }

  handleNewAnswer(answer) {
    // 새 답변 알림 표시
    if (this.options.enableNotifications) {
      this.showNewAnswerNotification(answer);
    }

    // 새 답변 하이라이트 효과
    if (this.options.animateNewItems) {
      setTimeout(() => {
        this.highlightNewAnswer(answer.id);
      }, 100);
    }

    // 답변 개수 업데이트
    this.updateAnswerCount();
  }

  showNewAnswerNotification(answer) {
    // 자신의 답변인 경우 알림 표시 안함
    if (this.currentUser && answer.authorId === this.currentUser.id) {
      return;
    }

    const notification = document.createElement('div');
    notification.className = 'new-answer-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">💬</span>
        <span class="notification-text">${answer.authorName || 'Someone'}님이 새 답변을 작성했습니다</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // 클릭 이벤트
    notification.addEventListener('click', () => {
      const answerElement = this.container.querySelector(`[data-answer-id=\"${answer.id}\"]`);
      if (answerElement) {
        answerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.highlightNewAnswer(answer.id);
      }
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

  highlightNewAnswer(answerId) {
    const answerElement = this.container.querySelector(`[data-answer-id=\"${answerId}\"]`);
    if (answerElement) {
      answerElement.classList.add('new-answer-highlight');
      setTimeout(() => {
        answerElement.classList.remove('new-answer-highlight');
      }, 3000);
    }
  }

  updateAnswerCount() {
    // 페이지의 답변 개수 표시 업데이트
    const countElements = document.querySelectorAll('.answer-count');
    countElements.forEach(element => {
      element.textContent = this.answers.length;
    });
  }

  sortAnswers(answers) {
    const sorted = [...answers];

    switch (this.options.sortBy) {
      case 'likes':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'accepted':
        return sorted.sort((a, b) => {
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          return (a.createdAt || 0) - (b.createdAt || 0);
        });
      case 'createdAt':
      default:
        return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
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

    if (this.answers.length === 0) {
      return `
        <div class="no-answers">
          <div class="no-answers-icon">💭</div>
          <div class="no-answers-message">아직 답변이 없습니다.</div>
          <div class="no-answers-submessage">첫 번째 답변을 작성해보세요!</div>
        </div>
      `;
    }

    const displayAnswers = this.answers.slice(0, this.options.maxDisplayCount);

    return `
      <div class="realtime-status">
        <span class="status-indicator ${this.unsubscribe ? 'connected' : 'disconnected'}"></span>
        <span class="status-text">실시간 업데이트 ${this.unsubscribe ? '연결됨' : '연결 끊어짐'}</span>
        <span class="answer-count">${this.answers.length}개 답변</span>
      </div>

      <div class="answers-header">
        <h3>답변 (${this.answers.length})</h3>
        <div class="sort-options">
          <select class="sort-select" onchange="window.realtimeAnswerList?.changeSorting(this.value)">
            <option value="createdAt" ${this.options.sortBy === 'createdAt' ? 'selected' : ''}>시간순</option>
            <option value="likes" ${this.options.sortBy === 'likes' ? 'selected' : ''}>좋아요순</option>
            <option value="accepted" ${this.options.sortBy === 'accepted' ? 'selected' : ''}>채택순</option>
          </select>
        </div>
      </div>

      <div class="answers-list">
        ${displayAnswers.map(answer => this.generateAnswerHTML(answer)).join('')}
      </div>

      ${this.answers.length > this.options.maxDisplayCount ? `
        <div class="load-more-answers">
          <button class="load-more-button">더 많은 답변 보기 (${this.answers.length - this.options.maxDisplayCount}개)</button>
        </div>
      ` : ''}
    `;
  }

  generateLoadingHTML() {
    if (!this.options.showLoadingAnimation) {
      return '<div class="simple-loading">답변을 불러오는 중...</div>';
    }

    return `
      <div class="answers-loading">
        ${Array(3).fill(0).map(() => `
          <div class="loading-answer">
            <div class="loading-skeleton skeleton-author"></div>
            <div class="loading-skeleton skeleton-content"></div>
            <div class="loading-skeleton skeleton-actions"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateAnswerHTML(answer) {
    const timeAgo = this.formatTimeAgo(answer.createdAt);
    const authorName = answer.authorName || answer.author?.name || 'Unknown';
    const isOwner = this.currentUser && answer.authorId === this.currentUser.id;
    const canAccept = this.options.enableAcceptAnswer && this.currentUser;

    return `
      <div class="answer-item ${answer.isAccepted ? 'accepted-answer' : ''}" data-answer-id="${answer.id}">
        ${answer.isAccepted ? '<div class="accepted-badge">✅ 채택된 답변</div>' : ''}

        <div class="answer-header">
          <div class="answer-author">
            <img src="${answer.author?.profilePic || '/images/default-avatar.png'}"
                 alt="${authorName}"
                 class="author-avatar">
            <div class="author-info">
              <span class="author-name">${authorName}</span>
              ${answer.author?.certification ? `<span class="author-cert">${answer.author.certification}</span>` : ''}
              <span class="answer-time">${timeAgo}</span>
            </div>
          </div>

          <div class="answer-actions">
            ${canAccept && !answer.isAccepted ? `
              <button class="accept-answer-btn" data-answer-id="${answer.id}">
                채택하기
              </button>
            ` : ''}
            ${isOwner ? `
              <button class="edit-answer-btn" data-answer-id="${answer.id}">
                수정
              </button>
            ` : ''}
          </div>
        </div>

        <div class="answer-content">
          ${this.formatContent(answer.content)}
        </div>

        <div class="answer-footer">
          <div class="answer-stats">
            ${this.options.enableVoting ? `
              <button class="vote-btn like-btn ${this.hasUserLiked(answer) ? 'voted' : ''}"
                      data-answer-id="${answer.id}">
                <span class="vote-icon">👍</span>
                <span class="vote-count">${answer.likes || 0}</span>
              </button>
            ` : `
              <span class="like-display">
                <span class="like-icon">👍</span>
                <span class="like-count">${answer.likes || 0}</span>
              </span>
            `}
          </div>

          <div class="answer-meta">
            ${answer.edited ? '<span class="edited-indicator">수정됨</span>' : ''}
          </div>
        </div>
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

  formatContent(content) {
    if (!content) return '';

    // 간단한 마크다운 스타일 지원
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  hasUserLiked(answer) {
    // 실제 구현에서는 사용자의 좋아요 상태를 확인
    // 현재는 로컬 스토리지에서 확인
    const likedAnswers = JSON.parse(localStorage.getItem('likedAnswers') || '[]');
    return likedAnswers.includes(answer.id);
  }

  attachEventListeners() {
    // 좋아요 버튼 이벤트
    this.container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const answerId = btn.dataset.answerId;
        this.toggleLike(answerId);
      });
    });

    // 채택 버튼 이벤트
    this.container.querySelectorAll('.accept-answer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const answerId = btn.dataset.answerId;
        this.acceptAnswer(answerId);
      });
    });

    // 수정 버튼 이벤트
    this.container.querySelectorAll('.edit-answer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const answerId = btn.dataset.answerId;
        this.editAnswer(answerId);
      });
    });

    // 더 보기 버튼 이벤트
    const loadMoreBtn = this.container.querySelector('.load-more-button');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.options.maxDisplayCount += 20;
        this.render();
      });
    }
  }

  // === 액션 메서드 ===

  async toggleLike(answerId) {
    if (!this.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // Firebase에서 좋아요 토글 구현
      // 현재는 로컬 상태만 업데이트
      const likedAnswers = JSON.parse(localStorage.getItem('likedAnswers') || '[]');
      const isLiked = likedAnswers.includes(answerId);

      if (isLiked) {
        const index = likedAnswers.indexOf(answerId);
        likedAnswers.splice(index, 1);
      } else {
        likedAnswers.push(answerId);
      }

      localStorage.setItem('likedAnswers', JSON.stringify(likedAnswers));

      // UI 즉시 업데이트
      const answer = this.answers.find(a => a.id === answerId);
      if (answer) {
        answer.likes = (answer.likes || 0) + (isLiked ? -1 : 1);
        this.render();
      }

    } catch (error) {
      console.error('좋아요 토글 오류:', error);
    }
  }

  async acceptAnswer(answerId) {
    if (!this.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (confirm('이 답변을 채택하시겠습니까?')) {
      try {
        // Firebase에서 답변 채택 구현
        const answer = this.answers.find(a => a.id === answerId);
        if (answer) {
          answer.isAccepted = true;

          // 답변 작성자에게 알림 전송
          await notificationService.notifyAnswerAccepted(
            answer.authorId,
            '질문 제목' // 실제로는 질문 제목을 가져와야 함
          );

          this.render();
        }
      } catch (error) {
        console.error('답변 채택 오류:', error);
        alert('답변 채택에 실패했습니다.');
      }
    }
  }

  editAnswer(answerId) {
    // 답변 수정 모달이나 페이지로 이동
    window.location.href = `/edit-answer.html?id=${answerId}`;
  }

  // === 공개 메서드 ===

  changeSorting(sortBy) {
    this.options.sortBy = sortBy;
    this.answers = this.sortAnswers(this.answers);
    this.render();
  }

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

  getAnswers() {
    return [...this.answers];
  }

  getAnswerById(id) {
    return this.answers.find(a => a.id === id);
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log(`실시간 답변 목록 컴포넌트 정리됨: ${this.containerId}`);
  }
}

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.RealtimeAnswerList = RealtimeAnswerList;
}

export default RealtimeAnswerList;