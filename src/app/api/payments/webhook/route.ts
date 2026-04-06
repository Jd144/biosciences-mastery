import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event !== 'payment.captured') {
      // Acknowledge other events but don't process
      return NextResponse.json({ received: true })
    }

    const payment = event.payload.payment.entity
    const razorpayOrderId = payment.order_id
    const razorpayPaymentId = payment.id

    const supabase = getServiceClient()

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found for razorpay_order_id:', razorpayOrderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Idempotency: skip if already paid
    if (order.status === 'paid') {
      return NextResponse.json({ received: true, message: 'Already processed' })
    }

    // Update order to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Create entitlement
    const EXCLUSION_CONSTRAINT_ERROR = '23P01'
    const UNIQUE_VIOLATION_ERROR = '23505'

    if (order.plan_type === 'FULL') {
      const { error: entitlementError } = await supabase
        .from('entitlements')
        .insert({
          user_id: order.user_id,
          type: 'FULL',
          subject_id: null,
        })

      if (entitlementError && entitlementError.code !== EXCLUSION_CONSTRAINT_ERROR && entitlementError.code !== UNIQUE_VIOLATION_ERROR) {
        console.error('Entitlement (FULL) error:', entitlementError)
      }
    } else if (order.plan_type === 'SINGLE_SUBJECT' && order.subject_id) {
      const { error: entitlementError } = await supabase
        .from('entitlements')
        .upsert(
          {
            user_id: order.user_id,
            type: 'SUBJECT',
            subject_id: order.subject_id,
          },
          { onConflict: 'user_id,subject_id', ignoreDuplicates: true }
        )

      if (entitlementError) {
        console.error('Entitlement (SUBJECT) error:', entitlementError)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
