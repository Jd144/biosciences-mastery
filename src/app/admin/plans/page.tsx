import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('price_inr')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
