import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'

const MAX_ATTEMPTS_PER_HOUR = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
    }

    const serviceClient = getServiceClient()

    // Rate-limit: check attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentAttempts } = await serviceClient
      .from('code_verification_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('success', false)
      .gte('attempted_at', oneHourAgo)

    if ((recentAttempts ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Look up the code
    const { data: accessCode } = await serviceClient
      .from('access_codes')
      .select('id, assigned_email, used_by_user_id, used_at')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()

    // Validate: code must exist, email must match, must not already be used by someone else
    const userEmail = user.email ?? ''
    const isValid =
      accessCode &&
      accessCode.assigned_email.toLowerCase() === userEmail.toLowerCase() &&
      (!accessCode.used_by_user_id || accessCode.used_by_user_id === user.id)

    if (!isValid) {
      // Log failed attempt
      await serviceClient.from('code_verification_attempts').insert({
        user_id: user.id,
        success: false,
      })
      return NextResponse.json({ error: 'Invalid or expired access code.' }, { status: 400 })
    }

    // Check if user already has access (idempotent)
    const { data: existingAccess } = await serviceClient
      .from('user_code_access')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingAccess) {
      // Grant access
      await serviceClient.from('user_code_access').insert({
        user_id: user.id,
        access_code_id: accessCode.id,
      })

      // Mark code as used
      await serviceClient
        .from('access_codes')
        .update({ used_by_user_id: user.id, used_at: new Date().toISOString() })
        .eq('id', accessCode.id)
    }

    // Log successful attempt
    await serviceClient.from('code_verification_attempts').insert({
      user_id: user.id,
      success: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Access code verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
