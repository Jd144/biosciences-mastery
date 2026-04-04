import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entitlements, error } = await supabase
      .from('entitlements')
      .select('*, subjects(id, slug, name)')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 })
    }

    const hasFull = entitlements.some((e) => e.type === 'FULL')
    const subjectIds = entitlements
      .filter((e) => e.type === 'SUBJECT' && e.subject_id)
      .map((e) => e.subject_id)

    return NextResponse.json({
      hasFull,
      subjectIds,
      entitlements,
    })
  } catch (error) {
    console.error('Entitlements fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
