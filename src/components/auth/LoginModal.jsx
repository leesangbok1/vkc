import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '@services/AuthContext'
import LoadingSpinner from '@components/common/LoadingSpinner'

const LoginModal = ({ onClose }) => {
  const { loginWithGoogle, loginWithFacebook, loading, error } = useAuth()
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      onClose()
    } catch (err) {
      console.error('Google 로그인 실패:', err)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook()
      onClose()
    } catch (err) {
      console.error('Facebook 로그인 실패:', err)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      className={`login-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="login-modal">
        <div className="modal-header">
          <h2>로그인 / 회원가입</h2>
          <button className="close-btn" onClick={handleClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <p className="login-description">
            Viet K-Connect에 오신 것을 환영합니다!<br />
            소셜 계정으로 간편하게 시작하세요.
          </p>

          {error && (
            <div className="error-message">
              <i className="fa-solid fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="login-buttons">
            <button
              className="login-btn google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <i className="fa-brands fa-google"></i>
                  Google로 계속하기
                </>
              )}
            </button>

            <button
              className="login-btn facebook-btn"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <i className="fa-brands fa-facebook"></i>
                  Facebook으로 계속하기
                </>
              )}
            </button>

            <button
              className="login-btn kakao-btn"
              disabled={loading}
              onClick={() => alert('카카오 로그인 준비 중입니다.')}
            >
              <i className="fa-solid fa-comment"></i>
              카카오로 계속하기
            </button>
          </div>

          <div className="login-terms">
            <p>
              로그인하면 <a href="/terms">이용약관</a> 및 <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* Login Modal Styles */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalShow 0.2s ease;
}

.login-modal-overlay.closing {
  animation: modalHide 0.2s ease;
}

.login-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  margin: 20px;
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.login-description {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-btn {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-btn {
  background: #ffffff;
  color: #333;
  border: 2px solid #ddd;
}

.google-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #007bff;
}

.facebook-btn {
  background: #1877F2;
  color: white;
}

.facebook-btn:hover:not(:disabled) {
  background: #166FE5;
}

.kakao-btn {
  background: #FEE500;
  color: #3C1E1E;
}

.kakao-btn:hover:not(:disabled) {
  background: #FDD835;
}

.login-terms {
  margin-top: 20px;
  text-align: center;
}

.login-terms p {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.login-terms a {
  color: #007bff;
  text-decoration: none;
}

.login-terms a:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes modalShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalHide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .login-modal {
    margin: 10px;
    border-radius: 8px;
  }

  .modal-header,
  .modal-body {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .login-btn {
    padding: 14px 16px;
  }
}

/* Dark mode support */
[data-theme="dark"] .login-modal {
  background: #2d2d2d;
}

[data-theme="dark"] .modal-header h2 {
  color: #ffffff;
}

[data-theme="dark"] .login-description {
  color: #cccccc;
}

[data-theme="dark"] .google-btn {
  background: #404040;
  color: #ffffff;
  border-color: #555555;
}

[data-theme="dark"] .google-btn:hover:not(:disabled) {
  background: #4a4a4a;
  border-color: #007bff;
}

[data-theme="dark"] .close-btn {
  color: #cccccc;
}

[data-theme="dark"] .close-btn:hover {
  background: #404040;
  color: #ffffff;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default LoginModal