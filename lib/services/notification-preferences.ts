export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  browser_notifications: boolean
  question_answers: boolean
  answer_comments: boolean
  question_comments: boolean
  expert_matches: boolean
  vote_updates: boolean
  weekly_digest: boolean
  mentions: boolean
  priority_threshold: NotificationPriority
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_notifications: true,
  push_notifications: false,
  browser_notifications: true,
  question_answers: true,
  answer_comments: true,
  question_comments: true,
  expert_matches: true,
  vote_updates: false,
  weekly_digest: true,
  mentions: true,
  priority_threshold: 'medium'
}

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3
}

const NOTIFICATION_TYPE_PREFERENCE_MAP: Record<string, keyof NotificationPreferences> = {
  new_answer: 'question_answers',
  answer_accepted: 'question_answers',
  question_commented: 'question_comments',
  answer_commented: 'answer_comments',
  expert_matched: 'expert_matches',
  question_matched: 'expert_matches',
  question_upvoted: 'vote_updates',
  answer_upvoted: 'vote_updates',
  mention: 'mentions',
  weekly_digest: 'weekly_digest'
}

export function normalizePriority(priority?: string | null): NotificationPriority {
  if (!priority) return 'medium'
  return ['low', 'medium', 'high', 'urgent'].includes(priority)
    ? (priority as NotificationPriority)
    : 'medium'
}

export function resolvePreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES }
  }

  const maybePreferences = raw as Partial<NotificationPreferences>

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...maybePreferences,
    priority_threshold: normalizePriority(maybePreferences.priority_threshold)
  }
}

export function isTypeAllowed(type: string, prefs: NotificationPreferences): boolean {
  const preferenceKey = NOTIFICATION_TYPE_PREFERENCE_MAP[type]
  if (!preferenceKey) return true
  return Boolean(prefs[preferenceKey])
}

export function isPriorityAllowed(priority: NotificationPriority, prefs: NotificationPreferences): boolean {
  return PRIORITY_ORDER[priority] >= PRIORITY_ORDER[prefs.priority_threshold]
}

export function filterChannels(requestedChannels: string[] | undefined, prefs: NotificationPreferences): string[] {
  const channels = Array.isArray(requestedChannels) && requestedChannels.length > 0
    ? requestedChannels
    : ['in_app']

  const allowed = new Set<string>()

  for (const channel of channels) {
    if (channel === 'in_app') {
      allowed.add(channel)
      continue
    }

    if (channel === 'email' && prefs.email_notifications) {
      allowed.add(channel)
      continue
    }

    if (channel === 'push' && prefs.push_notifications) {
      allowed.add(channel)
      continue
    }

    if (channel === 'browser' && prefs.browser_notifications) {
      allowed.add(channel)
      continue
    }

    if (!['email', 'push', 'browser'].includes(channel)) {
      allowed.add(channel)
    }
  }

  if (!allowed.size) {
    allowed.add('in_app')
  }

  return Array.from(allowed)
}
