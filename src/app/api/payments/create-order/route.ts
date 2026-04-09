import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'
// import { PRICES } from '@/lib/utils'

export async function POST(request: NextRequest) {

  console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID)
console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "EXISTS" : "MISSING")
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay env variables missing' },
        { status: 500 }
      )
    }

   // ✅ Sahi tarika
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { planType?: string; subjectSlug?: string; couponCode?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    const { planType, subjectSlug, couponCode } = body

    if (!planType || !['FULL', 'SINGLE_SUBJECT'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    let subjectId: string | null = null
    let amountPaise: number

    // Fetch plan prices from DB
    const { data: plansData, error: plansError } = await supabase
      .from('plans')
      .select('name, price_inr')
    if (plansError || !plansData) {
      return NextResponse.json({ error: 'Could not fetch plan prices' }, { status: 500 })
    }
    const planPrices: Record<string, number> = {}
    for (const plan of plansData) {
      planPrices[plan.name] = Math.round(Number(plan.price_inr) * 100)
    }

    if (planType === 'FULL') {
      amountPaise = planPrices.FULL ?? 99900

      const { data: existing } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'FULL')
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'You already own the full course' },
          { status: 409 }
        )
      }
    } else {
      if (!subjectSlug) {
        return NextResponse.json(
          { error: 'subjectSlug is required for SINGLE_SUBJECT plan' },
          { status: 400 }
        )
      }

      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id, slug')
        .eq('slug', subjectSlug)
        .eq('is_active', true)
        .single()

      if (subjectError || !subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
      }

      subjectId = subject.id
      amountPaise = planPrices.SINGLE_SUBJECT ?? 44900

      const { data: fullEntitlement } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'FULL')
        .maybeSingle()

      if (fullEntitlement) {
        return NextResponse.json(
          { error: 'You already own the full course. No need to buy individual subjects.' },
          { status: 409 }
        )
      }

      const { data: existingSubject } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'SUBJECT')
        .eq('subject_id', subjectId)
        .maybeSingle()

      if (existingSubject) {
        return NextResponse.json(
          { error: 'You already own this subject' },
          { status: 409 }
        )
      }
    }

    // Apply coupon if provided
    let discountPaise = 0
    let appliedCouponCode: string | null = null

    if (couponCode) {
      const svc = getServiceClient()
      const { data: coupon } = await svc
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle()

      if (coupon) {
        const now = new Date()
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null
        const validTo = coupon.valid_to ? new Date(coupon.valid_to) : null
        const withinDates = (!validFrom || validFrom <= now) && (!validTo || validTo >= now)
        const withinLimit = coupon.usage_limit === null || coupon.uses_count < coupon.usage_limit

        if (withinDates && withinLimit) {
          if (coupon.discount_type === 'percent') {
            discountPaise = Math.floor((amountPaise * coupon.discount_value) / 100)
          } else {
            discountPaise = Math.min(coupon.discount_value * 100, amountPaise)
          }
          appliedCouponCode = coupon.code
        }
      }
    }

    // Razorpay minimum order amount is ₹1 (100 paise)
    const RAZORPAY_MIN_PAISE = 100
    const finalAmountPaise = Math.max(amountPaise - discountPaise, RAZORPAY_MIN_PAISE)

    // Create Razorpay order
    let razorpayOrder
    try {
      const receipt = `order_${user.id.slice(0, 8)}_${Date.now()}`
      razorpayOrder = await razorpay.orders.create({
        amount: finalAmountPaise,
        currency: 'INR',
        receipt,
        notes: {
          user_id: user.id,
          plan_type: planType,
          subject_id: subjectId ?? '',
        },
      })
    } catch (razorErr: unknown) {
      console.error('Razorpay error:', razorErr)
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', detail: razorErr instanceof Error ? razorErr.message : String(razorErr) },
        { status: 500 }
      )
    }

    // Store order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        plan_type: planType,
        subject_id: subjectId,
        amount_paise: finalAmountPaise,
        razorpay_order_id: razorpayOrder.id,
        status: 'created',
        coupon_code: appliedCouponCode,
        discount_paise: discountPaise,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: finalAmountPaise,
      currency: 'INR',
      dbOrderId: order.id,
      discountPaise,
      originalAmount: amountPaise,
    })
  } catch (error: unknown) {
    console.error('Create order error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

