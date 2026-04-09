import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  const { userId, password } = await request.json()
  if (!userId || !password || password.length < 6) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  // Only admin can change
  const svc = getServiceClient()
  // Optionally: check admin session here
  try {
    const { error } = await svc.auth.admin.updateUserById(userId, { password })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
