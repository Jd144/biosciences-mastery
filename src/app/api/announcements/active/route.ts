import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const user = searchParams.get('user')
  const now = new Date().toISOString()
  const supabase = await createClient()
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .lte('start_time', now)
    .gte('end_time', now)
    .order('start_time', { ascending: false })
    .limit(1)
  if (page) {
    query = query.or(`page_filter.is.null,page_filter.eq.${page}`)
  }
  if (user) {
    query = query.or(`user_filter.is.null,user_filter.eq.${user}`)
  }
  const { data, error } = await query
  if (error || !data || !data[0]) return NextResponse.json({})
  return NextResponse.json(data[0])
}
