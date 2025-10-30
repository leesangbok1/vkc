import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'
import { ReportTargetType } from '@/lib/constants/reports'

type SupabaseDbClient = SupabaseClient<Database>

const TARGET_TABLES: Record<ReportTargetType, keyof Database['public']['Tables']> = {
  question: 'questions',
  post: 'posts',
  answer: 'answers',
  comment: 'comments'
}

/**
 * Ensure the reported content exists. Returns true if found, false if missing.
 */
export async function ensureReportTargetExists(
  client: SupabaseDbClient,
  targetId: string,
  targetType: ReportTargetType
): Promise<boolean> {
  const table = TARGET_TABLES[targetType]
  if (!table) return false

  const { data, error } = await client
    .from(table as string)
    .select('id')
    .eq('id', targetId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return Boolean(data?.id)
}

/**
 * Mark the target content as reported/unreported. Uses service role client.
 */
export async function setTargetReportedFlag(
  client: SupabaseDbClient,
  targetId: string,
  targetType: ReportTargetType,
  isReported: boolean
) {
  const table = TARGET_TABLES[targetType]
  if (!table) return

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = {
    is_reported: isReported,
    updated_at: now
  }

  const { error } = await client
    .from(table as string)
    .update(updates)
    .eq('id', targetId)

  if (error) {
    throw error
  }
}
