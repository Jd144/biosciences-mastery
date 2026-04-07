import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'
import { randomBytes } from 'crypto'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(12)
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
}

async function checkAdmin(): Promise<{ user: { id: string; email?: string } } | NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { user }
}

export async function GET() {
  const result = await checkAdmin()
  if (result instanceof NextResponse) return result

  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('access_codes')
    .select(`
      id, code, assigned_email, used_at, created_at,
      used_by_user_id
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data })
}

export async function POST(request: NextRequest) {
  const result = await checkAdmin()
  if (result instanceof NextResponse) return result
  const { user } = result

  const body = await request.json()
  const { assignedEmail } = body

  if (!assignedEmail || !assignedEmail.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const serviceClient = getServiceClient()

  // Check if a code already exists for this email
  const { data: existing } = await serviceClient
    .from('access_codes')
    .select('id, code')
    .eq('assigned_email', assignedEmail.toLowerCase().trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: `A code already exists for ${assignedEmail}` },
      { status: 409 }
    )
  }

  const code = generateCode()
  const { data, error } = await serviceClient
    .from('access_codes')
    .insert({
      code,
      assigned_email: assignedEmail.toLowerCase().trim(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const result = await checkAdmin()
  if (result instanceof NextResponse) return result

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const serviceClient = getServiceClient()
  const { error } = await serviceClient.from('access_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
