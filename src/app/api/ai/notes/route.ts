import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'
import { FREE_AI_LIMIT, checkAndIncrementAiUsage } from '@/lib/ai-limits'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const PROMPT_VERSION = 'v1'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topicId, language = 'en', regenerate = false } = body

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
    }

    const serviceClient = getServiceClient()
    const { data: fullEnt } = await serviceClient
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'FULL')
      .maybeSingle()

    const hasPremium = !!fullEnt

    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id, title, subject_id, subjects(name, slug)')
      .eq('id', topicId)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

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
        return NextResponse.json({ content: cached.content_md, cached: true, updatedAt: cached.updated_at })
      }
    }

    if (!hasPremium) {
      const { allowed, used, limit } = await checkAndIncrementAiUsage(user.id, 'notes', FREE_AI_LIMIT)
      if (!allowed) {
        return NextResponse.json({ error: `Daily AI limit reached (${used}/${limit}). Upgrade to Premium.`, limitReached: true, used, limit }, { status: 429 })
      }
    }

    const langInstruction =
      language === 'hi' ? 'Write in Hindi (Devanagari script).' :
      language === 'hinglish' ? 'Write in Hinglish (mix of Hindi and English, Roman script).' :
      'Write in English.'

    const subjectName = (topic.subjects as unknown as { name: string } | null)?.name ?? 'Biology'

    const prompt = `You are an expert biology educator preparing study notes for GAT-B exam.

${langInstruction}

Generate structured notes for topic: "${topic.title}" from subject "${subjectName}".

Format:
1. Overview (2-3 lines)
2. Key Concepts (bullets)
3. Detailed Explanation
4. Important Points
5. Common Exam Questions`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const contentMd = completion.choices[0]?.message?.content ?? ''

    await supabase.from('ai_notes_cache').upsert(
      { user_id: user.id, topic_id: topicId, language, prompt_version: PROMPT_VERSION, content_md: contentMd, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,topic_id,language,prompt_version' }
    )

    return NextResponse.json({ content: contentMd, cached: false })
  } catch (error) {
    console.error('AI notes error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
