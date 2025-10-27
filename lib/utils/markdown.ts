const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char)
}

export function renderMarkdownLite(raw: string): string {
  if (!raw) return ''

  let html = escapeHtml(raw.replace(/\r\n/g, '\n'))

  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  html = html.replace(
    /^(- .+(?:\n- .+)*)/gm,
    (match) => `<ul>${match.replace(/^- (.+)$/gm, '<li>$1</li>')}</ul>`
  )

  const paragraphs = html
    .split(/\n{2,}/)
    .map((block) => {
      if (/^\s*<(h\d|blockquote|ul)/.test(block)) {
        return block.replace(/\n/g, '<br />')
      }
      const content = block.replace(/\n/g, '<br />')
      return `<p>${content}</p>`
    })
    .join('')

  return paragraphs
}
