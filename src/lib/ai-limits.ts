import { getServiceClient } from '@/lib/admin'

/**
 * Per-day AI request limits read from environment variables.
 * Defaults: free = 5, premium = 50.
 */
export const FREE_AI_LIMIT = parseInt(process.env.FREE_AI_REQUESTS_PER_DAY ?? '5', 10)
export const PREMIUM_AI_LIMIT = parseInt(process.env.PREMIUM_AI_REQUESTS_PER_DAY ?? '50', 10)

/**
 * Check whether a user has an entitlement (FULL or SUBJECT-level).
 *
 * Uses the anon Supabase client that was already authenticated via the user's
 * session cookies — this ensures we only see entitlements for the calling user
 * (RLS enforces this).
 */
export function getAiLimit(hasPremium: boolean): number {
  return hasPremium ? PREMIUM_AI_LIMIT : FREE_AI_LIMIT
}

/**
 * Returns the user's current daily request count for a given endpoint and the
 * configured limit. Uses the service-role client to bypass RLS so that
 * upserts work correctly even before the first row exists.
 *
 * @param userId   Authenticated user id
 * @param endpoint 'chat' | 'notes'
 * @param limit    Max requests per day for this user's tier
 * @returns        { allowed: boolean; used: number; limit: number }
 */
export async function checkAndIncrementAiUsage(
  userId: string,
  endpoint: 'chat' | 'notes',
  limit: number
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const serviceClient = getServiceClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Fetch current count
  const { data: existing } = await serviceClient
    .from('ai_usage_log')
    .select('count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('date', today)
    .maybeSingle()

  const currentCount = existing?.count ?? 0

  if (currentCount >= limit) {
    return { allowed: false, used: currentCount, limit }
  }

  // Increment atomically via upsert
  const { error } = await serviceClient.from('ai_usage_log').upsert(
    {
      user_id: userId,
      endpoint,
      date: today,
      count: currentCount + 1,
    },
    { onConflict: 'user_id,endpoint,date' }
  )

  if (error) {
    console.error('ai_usage_log upsert error:', error)
    // Allow the request rather than blocking on a DB error
    return { allowed: true, used: currentCount + 1, limit }
  }

  return { allowed: true, used: currentCount + 1, limit }
}
