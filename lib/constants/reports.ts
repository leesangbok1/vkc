export const REPORT_TARGET_TYPES = ['question', 'post', 'answer', 'comment'] as const
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]

export const REPORT_STATUSES = ['pending', 'in_review', 'resolved', 'dismissed'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const isReportTargetType = (value: string): value is ReportTargetType =>
  (REPORT_TARGET_TYPES as readonly string[]).includes(value)

export const isReportStatus = (value: string): value is ReportStatus =>
  (REPORT_STATUSES as readonly string[]).includes(value)

export type ReportReasonOption = {
  value: string
  label: string
  description?: string
}

export const REPORT_REASON_OPTIONS: ReportReasonOption[] = [
  { value: 'spam', label: '스팸/광고', description: '홍보 목적의 반복 게시물이나 스팸으로 보이는 콘텐츠' },
  { value: 'misinformation', label: '허위 정보', description: '사실과 다르거나 오해를 불러일으킬 수 있는 내용' },
  { value: 'abuse', label: '욕설/혐오 표현', description: '욕설, 혐오, 차별적인 표현이 포함된 콘텐츠' },
  { value: 'illegal', label: '불법/유해한 내용', description: '법률을 위반하거나 위험을 초래할 수 있는 정보' },
  { value: 'privacy', label: '개인정보 노출', description: '타인의 개인정보가 노출된 콘텐츠' },
  { value: 'other', label: '기타', description: '기타 운영 원칙을 위반한 경우' }
]

export const REPORT_REASON_LABEL_MAP = REPORT_REASON_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {}
)

export const DEFAULT_REPORT_REASON = REPORT_REASON_OPTIONS[0]!.value
