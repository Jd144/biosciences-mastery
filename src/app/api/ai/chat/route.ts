import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const FREE_AI_DAILY_LIMIT = 5

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

    // Check entitlement and determine tier
    const { data: fullEnt } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'FULL')
      .maybeSingle()

    const isPremium = Boolean(fullEnt)

    if (subjectId && !isPremium) {
      const { data: subjectEnt } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'SUBJECT')
        .eq('subject_id', subjectId)
        .maybeSingle()

      if (!subjectEnt) {
        return NextResponse.json(
          { error: 'Access denied. Please purchase this subject.' },
          { status: 403 }
        )
      }
    }

    // Enforce daily AI limit for free (non-FULL) users
    if (!isPremium) {
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())

      const usedToday = count ?? 0
      if (usedToday >= FREE_AI_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Daily AI limit reached. Free users can make ${FREE_AI_DAILY_LIMIT} AI requests per day. Upgrade to Premium for unlimited access.`,
            limitReached: true,
            used: usedToday,
            limit: FREE_AI_DAILY_LIMIT,
          },
          { status: 429 }
        )
      }
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

    // Log successful AI usage for free users
    if (!isPremium) {
      await supabase.from('ai_usage_log').insert({
        user_id: user.id,
        request_type: 'chat',
      })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
