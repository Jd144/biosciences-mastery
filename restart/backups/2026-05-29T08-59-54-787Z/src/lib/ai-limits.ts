import { getServiceClient } from '@/lib/admin'

/**
 * Per-day AI request limit for free users, read from environment variable.
 * Premium users bypass rate limiting entirely and have unlimited access.
 */
export const FREE_AI_LIMIT = parseInt(process.env.FREE_AI_REQUESTS_PER_DAY ?? '5', 10)
/**
 * @deprecated Premium users now have unlimited AI access. This constant is retained
 * for backward compatibility with any external tooling that reads the env var, but it
 * has no effect on request handling.
 */
export const PREMIUM_AI_LIMIT = parseInt(process.env.PREMIUM_AI_REQUESTS_PER_DAY ?? '50', 10)

export function getAiLimit(hasPremium: boolean): number {
  return hasPremium ? PREMIUM_AI_LIMIT : FREE_AI_LIMIT
}

/**
 * Atomically increments the daily AI usage counter for a user and returns
 * whether the request is allowed within the tier limit.
 *
 * Uses the `increment_ai_usage` Postgres function (SECURITY DEFINER) so the
 * fetch-and-increment happens in a single SQL statement, preventing races
 * where two concurrent requests could both slip through the limit check.
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

  const { data, error } = await serviceClient.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_limit: limit,
  })

  if (error) {
    console.error('increment_ai_usage RPC error:', error)
    // Allow the request rather than blocking on a DB error so users aren't
    // penalised for infrastructure issues.
    return { allowed: true, used: 0, limit }
  }

  const row = Array.isArray(data) ? data[0] : data
  return {
    allowed: row.allowed as boolean,
    used: row.used as number,
    limit: row.daily_limit as number,
  }
}
