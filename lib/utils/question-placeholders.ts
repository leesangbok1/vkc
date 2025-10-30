import { mockQuestions } from '@/lib/mock-data'

export const DEFAULT_QUESTION_TITLE_PLACEHOLDER = '간단하고 명확한 질문 제목을 작성해주세요'

export const DEFAULT_QUESTION_CONTENT_GUIDE = `구체적인 상황과 궁금한 점을 자세히 설명해주세요.

예시:
- 현재 상황은 어떤가요?
- 어떤 도움이 필요한가요?
- 시도해본 방법이 있나요?`

export type QuestionPlaceholderExample = {
  id: string
  title: string
  summary: string
}

const MAX_SUMMARY_LENGTH = 140

const QUESTION_EXAMPLES: QuestionPlaceholderExample[] = (() => {
  const examples = new Map<string, QuestionPlaceholderExample>()

  mockQuestions.forEach((question) => {
    const normalizedTitle = normalizeWhitespace(question.title ?? '')
    if (!normalizedTitle) return

    const normalizedContent = normalizeWhitespace(question.content ?? '')
    const summarySource = normalizedContent || normalizedTitle
    const summary = truncate(summarySource, MAX_SUMMARY_LENGTH)

    examples.set(normalizedTitle, {
      id: String(question.id),
      title: normalizedTitle,
      summary,
    })
  })

  return Array.from(examples.values())
})()

function normalizeWhitespace(value?: string | null) {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

function truncate(value: string, maxLength: number) {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`
}

export function getRandomQuestionExample(): QuestionPlaceholderExample | null {
  if (QUESTION_EXAMPLES.length === 0) return null
  const index = Math.floor(Math.random() * QUESTION_EXAMPLES.length)
  return QUESTION_EXAMPLES[index] ?? null
}

export function buildQuestionPlaceholders(
  example: QuestionPlaceholderExample | null,
  options?: { extraGuide?: string }
) {
  const extraGuide = options?.extraGuide?.trim()
  const baseGuide = extraGuide
    ? `${DEFAULT_QUESTION_CONTENT_GUIDE}\n\n${extraGuide}`
    : DEFAULT_QUESTION_CONTENT_GUIDE

  if (!example) {
    return {
      title: DEFAULT_QUESTION_TITLE_PLACEHOLDER,
      content: baseGuide,
    }
  }

  const titlePlaceholder = `예: ${example.title}`
  const segments = [titlePlaceholder]
  if (example.summary) {
    segments.push(example.summary)
  }

  const contentPlaceholder = baseGuide
    ? `${segments.join('\n')}\n\n${baseGuide}`
    : segments.join('\n')

  return {
    title: titlePlaceholder,
    content: contentPlaceholder,
  }
}

export function getRandomQuestionPlaceholders(options?: { extraGuide?: string }) {
  return buildQuestionPlaceholders(getRandomQuestionExample(), options)
}
