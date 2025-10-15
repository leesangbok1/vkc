'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ExpertApplicationPage() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAgreed, setIsAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files) return

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles: File[] = []

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: 지원되지 않는 파일 형식입니다.`)
        return
      }

      if (file.size > maxSize) {
        alert(`${file.name}: 파일 크기가 10MB를 초과합니다.`)
        return
      }

      validFiles.push(file)
    })

    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  function removeFile(fileName: string) {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    handleFiles(e.dataTransfer.files)
  }

  function getFileIcon(fileType: string) {
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    return '📎'
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  async function handleSubmit() {
    if (uploadedFiles.length === 0) {
      alert('파일을 업로드해주세요.')
      return
    }

    if (!isAgreed) {
      alert('Certified User 신청 약관에 동의해주세요.')
      return
    }

    setIsLoading(true)

    // Mock API call
    setTimeout(() => {
      alert('Certified User 신청이 성공적으로 제출되었습니다!\n검토 후 연락드리겠습니다.')
      setIsLoading(false)
      router.push('/')
    }, 1500)
  }

  return (
    <main className="main-layout">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Certified User 신청</h1>
        </div>

        {/* Expert Apply Layout: flexible main content + 280px sidebar */}
        <div className="expert-apply-layout">
          {/* Left: Main Upload Section */}
          <div className="main-content">
            <div className="upload-section">
              <h2 className="upload-title">자격증·서류를 제출해 보세요!</h2>
              <p className="upload-subtitle">png, jpg, jpeg, pdf 파일만 첨부가 가능해요.</p>

              {/* File Upload Area */}
              <div
                className="upload-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  type="file"
                  id="file-input"
                  className="file-input-hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  이곳에 파일을 끌어오거나 <span className="upload-link">클릭하여</span> 파일을 첨부해 주세요
                </div>
                <div className="upload-hint">최대 10MB까지 업로드 가능합니다</div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <div className="file-icon">{getFileIcon(file.type)}</div>
                        <div className="file-details">
                          <div className="file-name">{file.name}</div>
                          <div className="file-size">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <button
                        className="file-remove"
                        onClick={() => removeFile(file.name)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agreement */}
              <div className="agreement-section">
                <div
                  className="agreement-item"
                  onClick={() => setIsAgreed(!isAgreed)}
                >
                  <div className={`agreement-checkbox ${isAgreed ? 'checked' : ''}`}>
                    <span>{isAgreed ? '✓' : ''}</span>
                  </div>
                  <span className="agreement-text">Certified User 신청 전 확인해 주세요.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => router.back()}
                >
                  취소
                </button>
                <button
                  className="btn-primary"
                  disabled={!(uploadedFiles.length > 0 && isAgreed) || isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? '제출 중...' : '제출하기'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="info-section">
            <h3 className="info-title">Certified User 분야</h3>
            <p className="info-content">아래 토픽에 답변을 남길 수 있어요.</p>

            <div className="expert-topics">
              <div className="topic-item">
                <div className="topic-icon">🛂</div>
                <div className="topic-info">
                  <div className="topic-name">비자 Certified User</div>
                  <div className="topic-desc">비자 신청, 연장, 변경 상담</div>
                </div>
              </div>
              <div className="topic-item">
                <div className="topic-icon">💼</div>
                <div className="topic-info">
                  <div className="topic-name">취업 상담사</div>
                  <div className="topic-desc">취업 준비, 면접, 이력서 작성</div>
                </div>
              </div>
              <div className="topic-item">
                <div className="topic-icon">🎓</div>
                <div className="topic-info">
                  <div className="topic-name">유학 가이드</div>
                  <div className="topic-desc">대학 입학, 장학금, 학업 상담</div>
                </div>
              </div>
              <div className="topic-item">
                <div className="topic-icon">🏠</div>
                <div className="topic-info">
                  <div className="topic-name">생활 정보</div>
                  <div className="topic-desc">주거, 의료, 금융, 일상 생활</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
