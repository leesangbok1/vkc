import React from 'react'

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text = '로딩 중...',
  fullscreen = false,
  overlay = false
}) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg'
  }

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    success: 'spinner-success',
    danger: 'spinner-danger',
    warning: 'spinner-warning',
    info: 'spinner-info',
    light: 'spinner-light',
    dark: 'spinner-dark'
  }

  const containerClass = [
    'loading-spinner',
    fullscreen && 'loading-fullscreen',
    overlay && 'loading-overlay'
  ].filter(Boolean).join(' ')

  const spinnerClass = [
    'spinner',
    sizeClasses[size],
    colorClasses[color]
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={spinnerClass}></div>
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  )
}

// 다양한 로딩 컴포넌트들
export const ButtonSpinner = ({ size = 'small' }) => (
  <LoadingSpinner size={size} text="" />
)

export const PageSpinner = () => (
  <LoadingSpinner size="large" text="페이지를 불러오는 중..." fullscreen />
)

export const OverlaySpinner = ({ text = '처리 중...' }) => (
  <LoadingSpinner size="medium" text={text} overlay />
)

export const InlineSpinner = ({ text = '로딩 중...' }) => (
  <div className="inline-loading">
    <LoadingSpinner size="small" text={text} />
  </div>
)

// 스켈레톤 로더
export const SkeletonLoader = ({
  lines = 3,
  height = '20px',
  className = ''
}) => (
  <div className={`skeleton-loader ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className="skeleton-line"
        style={{ height, width: index === lines - 1 ? '60%' : '100%' }}
      ></div>
    ))}
  </div>
)

// CSS Styles
const styles = `
/* Loading Spinner Styles */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
  border-style: solid;
}

/* Spinner Sizes */
.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-md {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.spinner-lg {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

/* Spinner Colors */
.spinner-primary {
  border-color: #f3f3f3;
  border-top-color: #007bff;
}

.spinner-secondary {
  border-color: #f3f3f3;
  border-top-color: #6c757d;
}

.spinner-success {
  border-color: #f3f3f3;
  border-top-color: #28a745;
}

.spinner-danger {
  border-color: #f3f3f3;
  border-top-color: #dc3545;
}

.spinner-warning {
  border-color: #f3f3f3;
  border-top-color: #ffc107;
}

.spinner-info {
  border-color: #f3f3f3;
  border-top-color: #17a2b8;
}

.spinner-light {
  border-color: #343a40;
  border-top-color: #f8f9fa;
}

.spinner-dark {
  border-color: #f3f3f3;
  border-top-color: #343a40;
}

.loading-text {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

/* Inline Loading */
.inline-loading {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* Skeleton Loader */
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 0;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Dark mode support */
[data-theme="dark"] .loading-fullscreen,
[data-theme="dark"] .loading-overlay {
  background-color: rgba(26, 26, 26, 0.9);
}

[data-theme="dark"] .loading-text {
  color: #ffffff;
}

[data-theme="dark"] .skeleton-line {
  background: linear-gradient(90deg, #2d2d2d 25%, #404040 50%, #2d2d2d 75%);
  background-size: 200% 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .loading-text {
    font-size: 14px;
  }

  .spinner-lg {
    width: 50px;
    height: 50px;
    border-width: 5px;
  }
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default LoadingSpinner