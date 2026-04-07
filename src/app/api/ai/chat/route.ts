import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementAiUsage, getAiLimit } from '@/lib/ai-limits'
import OpenAI from 'openai'

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

    // Check entitlement (determines rate-limit tier)
    let hasPremium = false
    if (subjectId) {
      const { data: fullEnt } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'FULL')
        .maybeSingle()

      if (fullEnt) {
        hasPremium = true
      } else {
        const { data: subjectEnt } = await supabase
          .from('entitlements')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'SUBJECT')
          .eq('subject_id', subjectId)
          .maybeSingle()

        if (subjectEnt) hasPremium = true
      }
    }

    // Enforce per-day rate limit server-side
    const limit = getAiLimit(hasPremium)
    const usage = await checkAndIncrementAiUsage(user.id, 'chat', limit)
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Daily AI limit reached (${usage.limit} requests/day). ${
            hasPremium
              ? 'Please try again tomorrow.'
              : 'Upgrade to premium for a higher limit.'
          }`,
          limitExceeded: true,
          used: usage.used,
          limit: usage.limit,
        },
        { status: 429 }
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

    return NextResponse.json({ reply, used: usage.used, limit: usage.limit })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
