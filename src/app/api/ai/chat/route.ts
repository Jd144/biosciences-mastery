import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'
import { FREE_AI_LIMIT, checkAndIncrementAiUsage } from '@/lib/ai-limits'
import Groq from 'groq-sdk'

export async function POST(request: NextRequest) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  })

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Premium check
    const serviceClient = getServiceClient()
    const { data: fullEnt } = await serviceClient
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'FULL')
      .maybeSingle()

    const hasPremium = !!fullEnt

    // Rate limit
    if (!hasPremium) {
      const { allowed, used, limit } = await checkAndIncrementAiUsage(
        user.id,
        'chat',
        FREE_AI_LIMIT
      )

      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily AI limit reached (${used}/${limit}). Upgrade to Premium.`,
            limitReached: true,
            used,
            limit,
          },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const { topicId, messages, language = 'en' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    // Topic context
    let systemContext =
      'You are an expert biology tutor for GAT-B exam preparation.'

    if (topicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select('title, subjects(name)')
        .eq('id', topicId)
        .single()

      if (topic) {
        const subjectName =
          (topic.subjects as unknown as { name: string } | null)?.name ??
          'Biology'

        systemContext = `You are an expert biology tutor for GAT-B exam preparation.
You are helping a student understand "${topic.title}" from "${subjectName}".
Give clear, exam-focused answers.`
      }
    }

    // Language control
    const langInstruction =
      language === 'hi'
        ? ' Respond in Hindi.'
        : language === 'hinglish'
        ? ' Respond in Hinglish.'
        : ' Respond in English.'

    systemContext += langInstruction

    // ✅ GROQ CALL (correct)
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192', // 🔥 correct model
      messages: [
        { role: 'system', content: systemContext },
        ...messages.slice(-10),
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? ''

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
