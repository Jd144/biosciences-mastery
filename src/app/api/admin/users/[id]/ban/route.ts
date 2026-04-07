import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await request.json()
  if (!['ban', 'unban'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const svc = getServiceClient()
  const { data, error } = await svc.auth.admin.updateUserById(id, {
    // 876600h ≈ 100 years — effectively permanent ban
    ban_duration: action === 'ban' ? '876600h' : 'none',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, user: data.user })
}
