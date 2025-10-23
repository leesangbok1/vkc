'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderMarkdownLite } from '@/lib/utils/markdown'

type RichEditorProps = {
  value: string
  onChange: (nextValue: string) => void
  placeholder?: string
  minRows?: number
  maxLength?: number
  uploadEndpoint?: string
  disabled?: boolean
  onSubmitShortcut?: () => void
  helperText?: string
}

const DEFAULT_UPLOAD_ENDPOINT = '/api/uploads'
const DEFAULT_PLACEHOLDER = '내용을 입력해주세요.'

function htmlToMarkdown(html: string): string {
  if (!html) return ''
  if (typeof window === 'undefined') return html

  const container = document.createElement('div')
  container.innerHTML = html

  const walk = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || '').replace(/\s+/g, ' ')
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement
    const tag = element.tagName.toLowerCase()
    const children = Array.from(element.childNodes).map(walk).join('').trim()

    switch (tag) {
      case 'strong':
      case 'b':
        return children ? `**${children}**` : ''
      case 'em':
      case 'i':
        return children
      case 'u':
        return children
      case 'br':
        return '\n'
      case 'p':
      case 'div':
        return children ? `${children}\n\n` : '\n\n'
      case 'h1':
        return `# ${children}\n\n`
      case 'h2':
        return `## ${children}\n\n`
      case 'h3':
        return `### ${children}\n\n`
      case 'blockquote': {
        const lines = children
          .split('\n')
          .map(line => (line ? `> ${line}` : ''))
          .join('\n')
        return `${lines}\n\n`
      }
      case 'ul': {
        const items = Array.from(element.children)
          .map(child => `- ${walk(child).trim()}`)
          .join('\n')
        return `${items}\n\n`
      }
      case 'ol': {
        const items = Array.from(element.children)
          .map((child, index) => `${index + 1}. ${walk(child).trim()}`)
          .join('\n')
        return `${items}\n\n`
      }
      case 'li':
        return children
      case 'a': {
        const href = element.getAttribute('href') || ''
        const text = children || href
        return href ? `[${text}](${href})` : text
      }
      case 'img': {
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || ''
        return src ? `![${alt}](${src})` : ''
      }
      default:
        return children
    }
  }

  const result = Array.from(container.childNodes).map(walk).join('')
  return result.replace(/\n{3,}/g, '\n\n').trim()
}

export default function RichEditor({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  minRows = 6,
  maxLength,
  uploadEndpoint = DEFAULT_UPLOAD_ENDPOINT,
  disabled = false,
  onSubmitShortcut,
  helperText,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialHtml = useMemo(() => renderMarkdownLite(value), [value])
  const [htmlContent, setHtmlContent] = useState(initialHtml)

  useEffect(() => {
    const latestHtml = renderMarkdownLite(value)
    if (latestHtml.trim() !== htmlContent.trim()) {
      setHtmlContent(latestHtml)
      if (editorRef.current) {
        editorRef.current.innerHTML = latestHtml
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      editorRef.current.innerHTML = htmlContent
    }
  }, [htmlContent, isPreview])

  const syncMarkdown = useCallback(() => {
    if (!editorRef.current) return
    const currentHtml = editorRef.current.innerHTML
    const markdown = htmlToMarkdown(currentHtml)

    if (maxLength && markdown.length > maxLength) {
      if (editorRef.current) {
        editorRef.current.innerHTML = renderMarkdownLite(value)
      }
      return
    }

    setHtmlContent(currentHtml)
    onChange(markdown)
  }, [maxLength, onChange, value])

  const executeCommand = useCallback(
    (command: string, valueArg?: string) => {
      if (!editorRef.current || disabled) return
      editorRef.current.focus()
      document.execCommand(command, false, valueArg ?? undefined)
      syncMarkdown()
    },
    [disabled, syncMarkdown]
  )

  const handleHeading = (level: 1 | 2 | 3) => {
    executeCommand('formatBlock', `h${level}`)
  }

  const handleLink = () => {
    if (!editorRef.current || disabled) return
    const selection = window.getSelection()
    if (!selection || selection.toString().trim().length === 0) {
      window.alert('링크로 지정할 텍스트를 먼저 선택해주세요.')
      return
    }
    const urlInput = window.prompt('링크 URL을 입력해주세요 (http/https 포함)')
    if (!urlInput) return
    const trimmed = urlInput.trim()
    if (!trimmed) return
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    executeCommand('createLink', normalized)
  }

  const handleUpload = async (file: File) => {
    if (!file || disabled) return
    setError(null)
    setIsUploading(true)
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('이미지는 5MB 이하만 업로드할 수 있습니다.')
      }
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || '파일 업로드에 실패했습니다.')
      }

      const json = await response.json()
      const url = json?.url
      if (!url) {
        throw new Error('업로드 URL을 찾을 수 없습니다.')
      }

      if (editorRef.current) {
        editorRef.current.focus()
      }
      document.execCommand('insertImage', false, url)
      syncMarkdown()
    } catch (uploadError: any) {
      const message = uploadError?.message || '파일 업로드에 실패했습니다.'
      setError(message)
      window.alert(message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    if (!editorRef.current) return
    const el = editorRef.current

    const handleInput = () => {
      syncMarkdown()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
    if (onSubmitShortcut && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      onSubmitShortcut()
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === 'i' || event.key === 'I')) {
      event.preventDefault()
    }
  }

    el.addEventListener('input', handleInput)
    el.addEventListener('blur', handleInput)
    el.addEventListener('keydown', handleKeyDown)

    return () => {
      el.removeEventListener('input', handleInput)
      el.removeEventListener('blur', handleInput)
      el.removeEventListener('keydown', handleKeyDown)
    }
  }, [onSubmitShortcut, syncMarkdown])

  const helperMessage =
    helperText || '굵게/머리글/목록/링크/이미지(5MB 이하 PNG·JPEG·WebP)를 지원합니다.'

  return (
    <div className={`vk-editor ${disabled ? 'vk-editor-disabled' : ''}`}>
      <div className="vk-editor-toolbar">
        <button
          type="button"
          className="vk-editor-btn"
          title="굵게 (Ctrl+B)"
          onClick={() => executeCommand('bold')}
        >
          <span className="vk-editor-btn-label">B</span>
        </button>
        <div className="vk-editor-divider" />
        <button
          type="button"
          className="vk-editor-btn"
          title="머리글 1"
          onClick={() => handleHeading(1)}
        >
          H1
        </button>
        <button
          type="button"
          className="vk-editor-btn"
          title="머리글 2"
          onClick={() => handleHeading(2)}
        >
          H2
        </button>
        <button
          type="button"
          className="vk-editor-btn"
          title="머리글 3"
          onClick={() => handleHeading(3)}
        >
          H3
        </button>
        <div className="vk-editor-divider" />
        <button
          type="button"
          className="vk-editor-btn"
          title="번호 목록"
          onClick={() => executeCommand('insertOrderedList')}
        >
          1.
        </button>
        <button
          type="button"
          className="vk-editor-btn"
          title="불릿 목록"
          onClick={() => executeCommand('insertUnorderedList')}
        >
          •
        </button>
        <button
          type="button"
          className="vk-editor-btn"
          title="인용구"
          onClick={() => executeCommand('formatBlock', 'blockquote')}
        >
          ❝
        </button>
        <div className="vk-editor-divider" />
        <button type="button" className="vk-editor-btn" title="링크" onClick={handleLink}>
          🔗
        </button>
        <button
          type="button"
          className="vk-editor-btn"
          title="이미지 업로드"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>
        <div className="vk-editor-spacer" />
        <button
          type="button"
          className={`vk-editor-btn ${isPreview ? 'active' : ''}`}
          onClick={() => setIsPreview(prev => !prev)}
          title={isPreview ? '편집으로 돌아가기' : '미리보기'}
        >
          {isPreview ? '편집' : '미리보기'}
        </button>
        {onSubmitShortcut && <span className="vk-editor-hint">Ctrl + Enter 등록</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={event => {
          const file = event.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />

      {isPreview ? (
        <div
          className="vk-editor-preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(value) }}
        />
      ) : (
        <div
          ref={editorRef}
          className="vk-editor-area"
          contentEditable={!disabled}
          data-placeholder={placeholder}
          style={{ minHeight: `${minRows * 24}px` }}
          suppressContentEditableWarning
          spellCheck
        />
      )}

      <div className="vk-editor-footer">
        <span className="vk-editor-helper">{helperMessage}</span>
        {typeof maxLength === 'number' && (
          <span className={`vk-editor-counter ${value.length >= maxLength ? 'limit' : ''}`}>
            {`${value.length} / ${maxLength}`}
          </span>
        )}
        {error && <span className="vk-editor-error">⚠️ {error}</span>}
      </div>

      <style jsx>{`
        .vk-editor {
          border: 1px solid #d1d5db;
          border-radius: 16px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vk-editor-disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        .vk-editor-toolbar {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.6rem 0.8rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .vk-editor-btn {
          border: 1px solid transparent;
          background: transparent;
          padding: 0.35rem 0.5rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .vk-editor-btn:hover,
        .vk-editor-btn:focus-visible {
          border-color: rgba(59, 130, 246, 0.35);
          background: rgba(59, 130, 246, 0.08);
          color: #1d4ed8;
        }

        .vk-editor-btn.active {
          border-color: rgba(59, 130, 246, 0.55);
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
        }

        .vk-editor-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vk-editor-btn-label {
          font-family: 'Inter', 'Pretendard', system-ui, sans-serif;
          font-weight: 700;
        }

        .vk-editor-divider {
          width: 1px;
          height: 22px;
          background: #e2e8f0;
          margin: 0 0.25rem;
        }

        .vk-editor-spacer {
          flex: 1;
        }

        .vk-editor-hint {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .vk-editor-area {
          min-height: 160px;
          padding: 1rem 1.25rem;
          outline: none;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #111827;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .vk-editor-area:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }

        .vk-editor-preview {
          padding: 1rem 1.25rem;
          background: #f8fafc;
          min-height: 160px;
          overflow-y: auto;
          border-top: 1px dashed #dbeafe;
        }

        .vk-editor-preview :global(p) {
          margin: 0 0 0.75rem;
          line-height: 1.65;
          color: #1f2933;
        }

        .vk-editor-preview :global(ul),
        .vk-editor-preview :global(ol) {
          margin: 0 0 0.75rem 1.1rem;
        }

        .vk-editor-preview :global(blockquote) {
          margin: 0 0 0.75rem;
          padding-left: 0.75rem;
          border-left: 3px solid #60a5fa;
          color: #475569;
        }

        .vk-editor-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.9rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.78rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .vk-editor-helper {
          flex: 1;
          min-width: 160px;
        }

        .vk-editor-counter {
          font-weight: 600;
        }

        .vk-editor-counter.limit {
          color: #b91c1c;
        }

        .vk-editor-error {
          color: #dc2626;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
