import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { message, start_time, end_time, popup_duration, is_active, page_filter, user_filter } = body;
  if (!message || !start_time || !end_time || !popup_duration) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const serviceSupabase = getServiceClient();
  const { data, error } = await serviceSupabase.from('announcements').update({
    message, start_time, end_time, popup_duration, is_active, page_filter, user_filter
  }).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const serviceSupabase = getServiceClient();
  const { error } = await serviceSupabase.from('announcements').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
