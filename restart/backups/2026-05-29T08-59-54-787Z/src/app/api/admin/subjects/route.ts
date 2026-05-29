import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('*, topics(count)')
    .order('order_index')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  // Only allow expected fields
  const { name, slug, price_inr } = body
  if (!name || !slug || typeof price_inr !== 'number' || price_inr < 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const serviceSupabase = getServiceClient()
  const { data, error } = await serviceSupabase
    .from('subjects')
    .insert({ name, slug, price_inr })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
