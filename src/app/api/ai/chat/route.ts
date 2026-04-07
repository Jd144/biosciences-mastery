import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'
import OpenAI from 'openai'
import { FREE_AI_DAILY_LIMIT } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topicId, subjectId, messages, language = 'en' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    // Determine premium status (FULL entitlement or per-subject entitlement)
    let isPremium = false
    if (subjectId) {
      const { data: fullEnt } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'FULL')
        .maybeSingle()

      if (fullEnt) {
        isPremium = true
      } else {
        const { data: subjectEnt } = await supabase
          .from('entitlements')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'SUBJECT')
          .eq('subject_id', subjectId)
          .maybeSingle()
        isPremium = !!subjectEnt
      }
    } else {
      // No subjectId provided — check for any FULL entitlement
      const { data: fullEnt } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'FULL')
        .maybeSingle()
      isPremium = !!fullEnt
    }

    // Enforce rate limit for free users (premium = unlimited, skip check entirely)
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0]
      const serviceClient = getServiceClient()

      const { data: usageRow } = await serviceClient
        .from('ai_usage_logs')
        .select('request_count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle()

      const currentCount = usageRow?.request_count ?? 0

      if (currentCount >= FREE_AI_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${FREE_AI_DAILY_LIMIT} AI requests per day). Upgrade to Premium for unlimited access.`,
            limitReached: true,
            limit: FREE_AI_DAILY_LIMIT,
            remaining: 0,
          },
          { status: 429 }
        )
      }

      // Increment usage counter
      await serviceClient.from('ai_usage_logs').upsert(
        { user_id: user.id, usage_date: today, request_count: currentCount + 1 },
        { onConflict: 'user_id,usage_date' }
      )
    }

    // Fetch topic context
    let systemContext = 'You are an expert biology tutor for GAT-B exam preparation.'

    if (topicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select('title, subjects(name)')
        .eq('id', topicId)
        .single()

      if (topic) {
        const subjectName = (topic.subjects as unknown as { name: string } | null)?.name ?? 'Biology'
        systemContext = `You are an expert biology tutor for GAT-B (Graduate Aptitude Test in Biotechnology) exam preparation.
You are helping a student understand the topic "${topic.title}" from "${subjectName}".
Provide clear, accurate, exam-focused answers.`
      }
    }

    const langInstruction =
      language === 'hi'
        ? ' Respond in Hindi.'
        : language === 'hinglish'
        ? ' Respond in Hinglish (mix of Hindi and English).'
        : ' Respond in English.'

    systemContext += langInstruction

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContext },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? ''

    return NextResponse.json({ reply, isPremium })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
