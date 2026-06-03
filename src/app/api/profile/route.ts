import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profileRes, examsRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, profile_picture_url, bio, selected_exam_id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('exams').select('id, code, name').order('name'),
  ])

  if (profileRes.error) {
    return NextResponse.json({ error: profileRes.error.message }, { status: 500 })
  }

  if (examsRes.error) {
    return NextResponse.json({ error: examsRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: {
      full_name: profileRes.data?.full_name ?? user.user_metadata?.full_name ?? '',
      profile_picture_url: profileRes.data?.profile_picture_url ?? '',
      bio: profileRes.data?.bio ?? '',
      selected_exam_id: profileRes.data?.selected_exam_id ?? null,
      email: user.email ?? '',
    },
    exams: examsRes.data ?? [],
  })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : ''
  const profilePictureUrl = typeof body.profile_picture_url === 'string' ? body.profile_picture_url.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const selectedExamId = typeof body.selected_exam_id === 'string' && body.selected_exam_id ? body.selected_exam_id : null

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      user_id: user.id,
      full_name: fullName || null,
      profile_picture_url: profilePictureUrl || null,
      bio: bio || null,
      selected_exam_id: selectedExamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { error: deleteError } = await supabase.from('user_exams').delete().eq('user_id', user.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  if (selectedExamId) {
    const { error: trackError } = await supabase.from('user_exams').insert({
      user_id: user.id,
      exam_id: selectedExamId,
    })

    if (trackError) {
      return NextResponse.json({ error: trackError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
