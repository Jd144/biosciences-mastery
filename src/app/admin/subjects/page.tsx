import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const svc = getServiceClient()

    const { data, error } = await svc
      .from('subjects')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}
