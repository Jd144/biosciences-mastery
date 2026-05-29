import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plans')
    .select('name, price_inr')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Return as { [name]: price_inr }
  const prices: Record<string, number> = {}
  for (const plan of data ?? []) {
    prices[plan.name] = Number(plan.price_inr)
  }
  return NextResponse.json(prices)
}
