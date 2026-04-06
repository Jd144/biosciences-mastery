import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { PRICES } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // ✅ Debug env variables
    console.log("RAZORPAY_KEY_ID", process.env.RAZORPAY_KEY_ID)
    console.log("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET)

    // ✅ Validate Razorpay envs
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay env variables missing' },
        { status: 500 }
      )
    }

    // ✅ Razorpay instance
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

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    const { planType, subjectSlug } = body

    if (!planType || !['FULL', 'SINGLE_SUBJECT'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    let subjectId: string | null = null
    let amountPaise: number

    if (planType === 'FULL') {
      amountPaise = PRICES.FULL

      // Check if user already has FULL entitlement
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
      // SINGLE_SUBJECT
      if (!subjectSlug) {
        return NextResponse.json(
          { error: 'subjectSlug is required for SINGLE_SUBJECT plan' },
          { status: 400 }
        )
      }

      // Fetch subject
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
      amountPaise = PRICES.SINGLE_SUBJECT

      // Check if user already has FULL entitlement
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

      // Check if user already has this subject
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

    // Create Razorpay order
    let razorpayOrder
    try {
      const receipt = `order_${user.id.slice(0, 8)}_${Date.now()}`
      razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          user_id: user.id,
          plan_type: planType,
          subject_id: subjectId ?? '',
        },
      })
    } catch (razorErr: any) {
      console.error('Razorpay error:', razorErr)
      return NextResponse.json({ error: 'Failed to create Razorpay order', detail: razorErr?.message }, { status: 500 })
    }

    // Store order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        plan_type: planType,
        subject_id: subjectId,
        amount_paise: amountPaise,
        razorpay_order_id: razorpayOrder.id,
        status: 'created',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      dbOrderId: order.id,
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({
      ok: false,
      error: error?.message || JSON.stringify(error) || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }, { status: 500 })
  }
}
