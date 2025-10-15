export default function NotFound() {
  return (
    <div className="not-found-layout">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-number">
            404
          </h1>

          <h2 className="not-found-title section-title">
            페이지를 찾을 수 없습니다
          </h2>

          <p className="not-found-message">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="not-found-actions">
          <a href="/" className="btn-primary not-found-primary-btn">
            홈으로 돌아가기
          </a>

          <div className="not-found-links">
            <a href="/questions" className="not-found-link">
              질문 보기
            </a>
            {' • '}
            <a href="/auth/login" className="not-found-link">
              로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
