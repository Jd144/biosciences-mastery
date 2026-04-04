import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

// Manage topic_content, topic_tables, topic_diagrams
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  if (!topicId) return NextResponse.json({ error: 'topicId required' }, { status: 400 })

  const [content, tables, diagrams] = await Promise.all([
    supabase.from('topic_content').select('*').eq('topic_id', topicId),
    supabase.from('topic_tables').select('*').eq('topic_id', topicId),
    supabase.from('topic_diagrams').select('*').eq('topic_id', topicId),
  ])

  return NextResponse.json({
    content: content.data ?? [],
    tables: tables.data ?? [],
    diagrams: diagrams.data ?? [],
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { type, ...data } = body
  const serviceSupabase = getServiceClient()

  const table = type === 'content' ? 'topic_content' : type === 'table' ? 'topic_tables' : 'topic_diagrams'
  const { data: result, error } = await serviceSupabase
    .from(table)
    .upsert(data, { onConflict: type === 'content' ? 'topic_id,language' : undefined })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(result, { status: 201 })
}
