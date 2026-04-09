import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId, type, subjectId } = await request.json()
  if (!userId || !type || (type === 'SUBJECT' && !subjectId)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const serviceSupabase = getServiceClient()
  // Remove existing FULL/SUBJECT entitlement for this user/subject if any
  if (type === 'FULL') {
    await serviceSupabase.from('entitlements').delete().eq('user_id', userId).eq('type', 'FULL')
  } else if (type === 'SUBJECT') {
    await serviceSupabase.from('entitlements').delete().eq('user_id', userId).eq('type', 'SUBJECT').eq('subject_id', subjectId)
  }
  // Insert new entitlement
  const { data, error } = await serviceSupabase.from('entitlements').insert({
    user_id: userId,
    type,
    subject_id: type === 'SUBJECT' ? subjectId : null,
    is_free: true
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
