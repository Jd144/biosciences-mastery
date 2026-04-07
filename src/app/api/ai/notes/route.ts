import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const PROMPT_VERSION = 'v1'
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
    const { topicId, language = 'en', regenerate = false } = body

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
    }

    // Fetch topic + subject info
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id, title, subject_id, subjects(name, slug)')
      .eq('id', topicId)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check entitlement and determine tier
    const subjectId = topic.subject_id
    const { data: fullEnt } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'FULL')
      .maybeSingle()

    const isPremium = Boolean(fullEnt)

    if (!isPremium) {
      const { data: subjectEnt } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'SUBJECT')
        .eq('subject_id', subjectId)
        .maybeSingle()

      if (!subjectEnt) {
        return NextResponse.json({ error: 'Access denied. Please purchase this subject.' }, { status: 403 })
      }
    }

    // Check cache (unless regenerate requested)
    if (!regenerate) {
      const { data: cached } = await supabase
        .from('ai_notes_cache')
        .select('content_md, updated_at')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .eq('language', language)
        .eq('prompt_version', PROMPT_VERSION)
        .maybeSingle()

      if (cached) {
        return NextResponse.json({
          content: cached.content_md,
          cached: true,
          updatedAt: cached.updated_at,
        })
      }
    }

    // Enforce daily AI limit for free (non-FULL) users before calling OpenAI
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

    // Generate using OpenAI
    const langInstruction =
      language === 'hi'
        ? 'Write in Hindi (Devanagari script).'
        : language === 'hinglish'
        ? 'Write in Hinglish (mix of Hindi and English, use Roman script for Hindi words).'
        : 'Write in English.'

    const subjectName = (topic.subjects as unknown as { name: string } | null)?.name ?? 'Biology'

    const prompt = `You are an expert biology educator preparing study notes for GAT-B (Graduate Aptitude Test in Biotechnology) exam preparation.

${langInstruction}

Generate comprehensive study notes for the topic: "${topic.title}" from the subject "${subjectName}".

Format your response as structured Markdown with:
1. **Overview** — 2-3 line summary
2. **Key Concepts** — bullet points of essential concepts
3. **Detailed Explanation** — organized sections with clear headings
4. **Important Points to Remember** — exam-focused bullet points
5. **Common Exam Questions** — 3-5 typical question patterns for this topic

Keep it concise but comprehensive, suitable for GAT-B level examination.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const contentMd = completion.choices[0]?.message?.content ?? ''

    // Save to cache (upsert)
    await supabase.from('ai_notes_cache').upsert(
      {
        user_id: user.id,
        topic_id: topicId,
        language,
        prompt_version: PROMPT_VERSION,
        content_md: contentMd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id,language,prompt_version' }
    )

    // Log successful AI usage for free users
    if (!isPremium) {
      await supabase.from('ai_usage_log').insert({
        user_id: user.id,
        request_type: 'notes',
      })
    }

    return NextResponse.json({
      content: contentMd,
      cached: false,
    })
  } catch (error) {
    console.error('AI notes error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
