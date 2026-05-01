import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('mock_test_sets')
    .select(`
      id, set_no, title, description,
      mock_tests (id, test_no, title, description, duration_minutes, total_marks, is_active)
    `)
    .eq('is_active', true)
    .order('set_no')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
