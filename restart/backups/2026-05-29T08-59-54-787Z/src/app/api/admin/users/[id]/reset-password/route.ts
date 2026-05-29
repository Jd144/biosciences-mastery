import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })

  const svc = getServiceClient()

  // Fetch user email first
  const { data: targetUser, error: fetchErr } = await svc.auth.admin.getUserById(id)
  if (fetchErr || !targetUser?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const email = targetUser.user.email
  if (!email) {
    return NextResponse.json({ error: 'User has no email address' }, { status: 400 })
  }

  // Generate a password recovery link (magic link for password reset)
  const { data, error } = await svc.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ link: data.properties?.action_link ?? null, email })
}
