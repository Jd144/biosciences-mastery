import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, amountPaise } = await request.json()
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  if (!amountPaise || amountPaise <= 0) return NextResponse.json({ error: 'amountPaise is required' }, { status: 400 })

  const svc = getServiceClient()
  const { data: coupon, error } = await svc
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return NextResponse.json({ error: 'Coupon not yet valid' }, { status: 400 })
  if (coupon.valid_to && new Date(coupon.valid_to) < now) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  if (coupon.usage_limit !== null && coupon.uses_count >= coupon.usage_limit) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })

  let discountPaise = 0
  if (coupon.discount_type === 'percent') {
    discountPaise = Math.floor((amountPaise * coupon.discount_value) / 100)
  } else {
    discountPaise = Math.min(coupon.discount_value * 100, amountPaise)
  }
  const finalAmount = amountPaise - discountPaise

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    discountPaise,
    finalAmount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
  })
}
