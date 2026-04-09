import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json([])
  const { data, error } = await supabase
    .from('ai_notes_cache')
    .select('topic_id, language, prompt_version, content_md, updated_at, topics(title, subjects(name))')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
