import {
  createSupabaseServerClient,
  createSupabaseServerReadClient,
  createSupabaseServiceClient
} from '@/lib/supabase-server'

export type SupabaseDbClient = any

export async function getServerDbClient(): Promise<SupabaseDbClient> {
  return createSupabaseServerClient()
}

export async function getServerReadDbClient(): Promise<SupabaseDbClient> {
  return createSupabaseServerReadClient()
}

export function getServiceDbClient(): SupabaseDbClient {
  return createSupabaseServiceClient()
}
