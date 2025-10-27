/**
 * 텍스트를 문장 단위로 파싱하여 N개 문장까지만 표시
 * @param text 원본 텍스트
 * @param sentenceLimit 표시할 문장 개수 (기본값: 2)
 * @returns 제한된 문장 텍스트
 */
export function truncateToSentences(text: string, sentenceLimit: number = 2): string {
  if (!text) return ''

  // 문장 구분자: 마침표, 느낌표, 물음표 (뒤에 공백이 있거나 문자열 끝)
  const sentenceRegex = /[.!?]+(?:\s+|$)/g

  let sentences: string[] = []
  let lastIndex = 0
  let match

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = text.substring(lastIndex, match.index + match[0].length).trim()
    if (sentence) {
      sentences.push(sentence)
    }
    lastIndex = match.index + match[0].length
  }

  // 마지막 문장 (문장 부호가 없는 경우)
  if (lastIndex < text.length) {
    const lastSentence = text.substring(lastIndex).trim()
    if (lastSentence) {
      sentences.push(lastSentence)
    }
  }

  // 문장이 sentenceLimit개 이하인 경우: 전체 반환
  if (sentences.length <= sentenceLimit) {
    return text.trim()
  }

  // sentenceLimit개 문장까지만 반환 + "..."
  const limitedText = sentences.slice(0, sentenceLimit).join(' ')
  return limitedText + '...'
}
