import React from 'react'

const WelcomeBanner = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '좋은 아침입니다'
    if (hour < 18) return '안녕하세요'
    return '좋은 저녁입니다'
  }

  const getMotivationalMessage = () => {
    const messages = [
      '오늘도 새로운 것을 배워보세요!',
      '궁금한 것이 있으면 언제든 질문하세요.',
      '함께 소통하며 성장해요!',
      '한국 생활의 모든 궁금증을 해결해드려요.',
      '베트남 친구들과 함께하는 따뜻한 커뮤니티입니다.'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <section className="welcome-banner">
      <div className="banner-content">
        <div className="banner-text">
          <div className="greeting">
            <h1>
              {user ? (
                <>
                  {getGreeting()}, <span className="user-name">{user.name}</span>님!
                </>
              ) : (
                '안녕하세요!'
              )}
            </h1>
            <p className="subtitle">
              {user ? getMotivationalMessage() : 'Viet K-Connect에 오신 것을 환영합니다!'}
            </p>
          </div>

          <div className="banner-description">
            <p>
              한국에서 생활하는 베트남인들을 위한 Q&A 커뮤니티입니다.
              <br />
              비자, 생활정보, 취업, 교육 등 다양한 주제로 소통하세요.
            </p>
          </div>

          <div className="banner-actions">
            {user ? (
              <button className="cta-button primary">
                <i className="fa-solid fa-plus"></i>
                새 질문 작성하기
              </button>
            ) : (
              <div className="auth-buttons">
                <button className="cta-button primary">
                  <i className="fa-solid fa-sign-in-alt"></i>
                  로그인하고 시작하기
                </button>
                <button className="cta-button secondary">
                  <i className="fa-solid fa-eye"></i>
                  둘러보기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="banner-visual">
          <div className="visual-element">
            <div className="community-icons">
              <div className="icon-circle">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="icon-circle">
                <i className="fa-solid fa-question-circle"></i>
              </div>
              <div className="icon-circle">
                <i className="fa-solid fa-comments"></i>
              </div>
            </div>
            <div className="floating-elements">
              <div className="floating-item" data-float="1">💡</div>
              <div className="floating-item" data-float="2">❓</div>
              <div className="floating-item" data-float="3">💬</div>
              <div className="floating-item" data-float="4">🤝</div>
            </div>
          </div>
        </div>
      </div>

      {/* 퀵 스탯 */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-number">1,234</div>
          <div className="stat-label">등록된 질문</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">2,567</div>
          <div className="stat-label">도움받은 답변</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">456</div>
          <div className="stat-label">활동 중인 회원</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">89%</div>
          <div className="stat-label">문제 해결률</div>
        </div>
      </div>
    </section>
  )
}

// CSS Styles
const styles = `
/* Welcome Banner Styles */
.welcome-banner {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="none"><path d="M0,50 C250,10 750,90 1000,50 L1000,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
  background-size: 100% 100%;
  pointer-events: none;
}

.banner-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.greeting h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.user-name {
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  margin: 10px 0 0 0;
  opacity: 0.9;
  font-weight: 400;
}

.banner-description p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.banner-actions {
  margin-top: 10px;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.cta-button {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
}

.cta-button.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.cta-button.primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

/* Visual Element */
.banner-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 200px;
}

.visual-element {
  position: relative;
  width: 200px;
  height: 200px;
}

.community-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: float 3s ease-in-out infinite;
}

.icon-circle:nth-child(2) {
  animation-delay: 1s;
}

.icon-circle:nth-child(3) {
  animation-delay: 2s;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-item {
  position: absolute;
  font-size: 20px;
  animation: floatAround 6s ease-in-out infinite;
  opacity: 0.7;
}

.floating-item[data-float="1"] {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-item[data-float="2"] {
  top: 20%;
  right: 15%;
  animation-delay: 1.5s;
}

.floating-item[data-float="3"] {
  bottom: 25%;
  left: 15%;
  animation-delay: 3s;
}

.floating-item[data-float="4"] {
  bottom: 15%;
  right: 10%;
  animation-delay: 4.5s;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes floatAround {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(90deg);
  }
  50% {
    transform: translate(-5px, -15px) rotate(180deg);
  }
  75% {
    transform: translate(-10px, 5px) rotate(270deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .banner-content {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }

  .banner-visual {
    height: 150px;
  }

  .visual-element {
    width: 150px;
    height: 150px;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 30px 20px;
    margin-bottom: 20px;
  }

  .greeting h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .banner-description {
    display: none;
  }

  .auth-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
    max-width: 280px;
  }

  .quick-stats {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 12px;
  }

  .icon-circle {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .floating-item {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 20px 15px;
  }

  .greeting h1 {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .quick-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .banner-visual {
    display: none;
  }
}

/* Dark mode support */
[data-theme="dark"] .welcome-banner {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
}

[data-theme="dark"] .cta-button.primary {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

[data-theme="dark"] .cta-button.primary:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

[data-theme="dark"] .icon-circle {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default WelcomeBanner