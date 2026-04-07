import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const FREE_AI_LIMIT = 5 // messages per day for free (no entitlement) users

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

    // Check entitlement (determines free vs premium)
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

        if (!subjectEnt) {
          return NextResponse.json(
            { error: 'Access denied. Please purchase this subject.' },
            { status: 403 }
          )
        }
        isPremium = true
      }
    }

    // Server-side AI rate limiting for free users (5 messages/day, UTC calendar day)
    if (!isPremium) {
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
      const { data: usageRow, error: usageReadErr } = await supabase
        .from('ai_daily_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle()

      if (usageReadErr) {
        // If we can't read usage (e.g. table not yet migrated), fail open to avoid blocking users
        console.error('AI usage read error:', usageReadErr)
      } else {
        const currentCount = usageRow?.count ?? 0
        if (currentCount >= FREE_AI_LIMIT) {
          return NextResponse.json(
            {
              error: `You've used all ${FREE_AI_LIMIT} free AI questions for today. Upgrade to Premium for unlimited access, or try again tomorrow.`,
              limitReached: true,
              limit: FREE_AI_LIMIT,
            },
            { status: 429 }
          )
        }

        // Increment usage counter (upsert)
        await supabase.from('ai_daily_usage').upsert(
          { user_id: user.id, usage_date: today, count: currentCount + 1 },
          { onConflict: 'user_id,usage_date' }
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

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
