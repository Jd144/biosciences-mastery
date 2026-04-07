'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, FileText, GitBranch, Table, Image, HelpCircle, ClipboardList, Sparkles, MessageCircle, RefreshCw, Send, Lock } from 'lucide-react'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FREE_AI_DAILY_LIMIT, PREMIUM_QUIZ_QUESTION_COUNT } from '@/lib/limits'

interface Props {
  subject: { id: string; slug: string; name: string }
  topic: { id: string; slug: string; title: string }
  userId: string
  content: Array<{ language: string; short_notes_md: string | null; detailed_notes_md: string | null; flowchart_mermaid: string | null }>
  tables: Array<{ id: string; title: string; table_json: { headers: string[]; rows: string[][] }; language: string }>
  diagrams: Array<{ id: string; image_url: string; caption: string | null; alt_text: string | null }>
  pyqs: Array<{ id: string; year: number; question: string; options: { A: string; B: string; C: string; D: string }; answer: string; explanation: string | null }>
  quizzes: Array<{ id: string; quiz_no: number; title: string | null; quiz_questions: Array<{ id: string; question_no: number; question: string; options: { A: string; B: string; C: string; D: string }; answer: string; explanation: string | null }> }>
  isPremium: boolean
  quizQuestionLimit: number
}

const TABS = [
  { id: 'short-notes', label: 'Short Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'detailed-notes', label: 'Detailed Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'flowchart', label: 'Flowchart', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'tables', label: 'Tables', icon: <Table className="w-4 h-4" /> },
  { id: 'diagrams', label: 'Diagrams', icon: <Image className="w-4 h-4" /> },
  { id: 'pyqs', label: 'PYQs', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'quizzes', label: 'Quizzes', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'ai-notes', label: 'AI Notes', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'doubt-chat', label: 'Doubt Chat', icon: <MessageCircle className="w-4 h-4" /> },
]

function MarkdownContent({ md }: { md: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p>{message}</p>
    </div>
  )
}

function PremiumLock() {
  return (
    <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50">
      <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
      <p className="text-gray-700 font-semibold mb-1">Premium Content</p>
      <p className="text-sm text-gray-500 mb-4">Upgrade to unlock full notes, flowcharts, tables, diagrams, and AI features.</p>
      <Link
        href={`/app/buy/full`}
        className="inline-block bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Upgrade to Premium — ₹999
      </Link>
    </div>
  )
}

function PYQItem({ pyq }: { pyq: Props['pyqs'][0] }) {
  const [showAnswer, setShowAnswer] = useState(false)
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-medium text-gray-800 text-sm">{pyq.question}</p>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full shrink-0">{pyq.year}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
          <div
            key={opt}
            className={`text-xs px-3 py-2 rounded-lg border ${
              showAnswer && opt === pyq.answer
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <span className="font-semibold mr-1">{opt}.</span>
            {pyq.options[opt]}
          </div>
        ))}
      </div>
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="text-xs text-emerald-600 hover:underline font-medium"
        >
          Show Answer & Explanation
        </button>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-emerald-700 mb-1">Answer: {pyq.answer}</p>
          {pyq.explanation && <p className="text-emerald-600">{pyq.explanation}</p>}
        </div>
      )}
    </div>
  )
}

type QuizQuestion = Props['quizzes'][0]['quiz_questions'][0]

function FlatQuizComponent({ questions }: { questions: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = submitted
    ? questions.filter((q) => selectedAnswers[q.id] === q.answer).length
    : 0

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Quiz ({questions.length} questions)</h3>
        {submitted && (
          <span className="text-sm font-medium text-emerald-700">
            Score: {score}/{questions.length}
          </span>
        )}
      </div>
      <div className="p-5 space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-gray-800 mb-3">
              {idx + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const isSelected = selectedAnswers[q.id] === opt
                const isCorrect = submitted && opt === q.answer
                const isWrong = submitted && isSelected && opt !== q.answer
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-medium'
                        : isWrong
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-semibold mr-1">{opt}.</span>
                    {q.options[opt]}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-xs text-gray-500 mt-2 pl-2 border-l-2 border-gray-200">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
        {!submitted && questions.length > 0 && (
          <Button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            size="sm"
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  )
}

function AINotesTab({ topicId, subjectId, isPremium }: { topicId: string; subjectId: string; isPremium: boolean }) {
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en')
  const [cached, setCached] = useState(false)
  const [error, setError] = useState('')

  const generate = async (regenerate = false) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, language, regenerate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNotes(data.content)
      setCached(data.cached)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!isPremium && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Free plan:</strong> {FREE_AI_DAILY_LIMIT} AI requests per day across all AI features.{' '}
          <Link href="/app/buy/full" className="underline font-semibold text-emerald-700">Upgrade for unlimited.</Link>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
        <Button onClick={() => generate(false)} loading={loading} size="sm">
          <Sparkles className="w-4 h-4 mr-1.5" />
          {notes ? 'Load Notes' : 'Generate AI Notes'}
        </Button>
        {notes && (
          <Button onClick={() => generate(true)} loading={loading} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Regenerate
          </Button>
        )}
        {cached && <span className="text-xs text-gray-400 italic">Cached</span>}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!notes && !loading && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Click &ldquo;Generate AI Notes&rdquo; to create personalized study notes</p>
          <p className="text-xs text-gray-400">Notes are generated once and cached for future use</p>
        </div>
      )}

      {notes && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <MarkdownContent md={notes} />
        </div>
      )}
    </div>
  )
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function DoubtChatTab({ topicId, subjectId, isPremium }: { topicId: string; subjectId: string; isPremium: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en')
  const [limitReached, setLimitReached] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          subjectId,
          messages: newMessages,
          language,
        }),
      })
      const data = await res.json()
      if (res.status === 429) {
        setLimitReached(true)
        setMessages([...newMessages, { role: 'assistant', content: data.error }])
        return
      }
      if (!res.ok) throw new Error(data.error)
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch (err: unknown) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[60vh] bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">AI Doubt Solver</span>
          {!isPremium && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Free: {FREE_AI_DAILY_LIMIT} requests/day
            </span>
          )}
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none"
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
          <option value="hinglish">Hinglish</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Ask any doubt about this topic!</p>
            {!isPremium && (
              <p className="text-xs mt-1 text-amber-600">Free plan: {FREE_AI_DAILY_LIMIT} AI requests per day</p>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <MarkdownContent md={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Limit reached banner */}
      {limitReached && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-800 text-center">
          Daily limit reached.{' '}
          <Link href="/app/buy/full" className="underline font-semibold text-emerald-700">
            Upgrade to Premium
          </Link>{' '}
          for unlimited AI access.
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={limitReached ? 'Daily limit reached — upgrade for more' : 'Ask your doubt...'}
          disabled={limitReached}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || loading || limitReached} size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function TopicPageClient({ subject, topic, userId, content, tables, diagrams, pyqs, quizzes, isPremium, quizQuestionLimit }: Props) {
  const [activeTab, setActiveTab] = useState('short-notes')

  const enContent = content.find((c) => c.language === 'en') ?? content[0]
  const enTables = tables.filter((t) => t.language === 'en')

  // Flatten and limit quiz questions based on tier
  const allQuizQuestions: QuizQuestion[] = quizzes
    .slice()
    .sort((a, b) => a.quiz_no - b.quiz_no)
    .flatMap((quiz) =>
      (quiz.quiz_questions ?? []).slice().sort((a, b) => a.question_no - b.question_no)
    )
    .slice(0, quizQuestionLimit)

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/app/subjects" className="hover:text-emerald-600">Subjects</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/app/subjects/${subject.slug}`} className="hover:text-emerald-600">{subject.name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{topic.title}</span>
      </nav>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{topic.title}</h1>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />

      <div className="bg-white rounded-b-xl rounded-tr-xl border border-t-0 border-gray-100 p-6">
        {/* Short Notes — available to all */}
        <TabPanel id="short-notes" activeTab={activeTab}>
          {enContent?.short_notes_md ? (
            <MarkdownContent md={enContent.short_notes_md} />
          ) : (
            <EmptyState message="Short notes not yet available for this topic." />
          )}
        </TabPanel>

        {/* Detailed Notes — premium only */}
        <TabPanel id="detailed-notes" activeTab={activeTab}>
          {isPremium ? (
            enContent?.detailed_notes_md ? (
              <MarkdownContent md={enContent.detailed_notes_md} />
            ) : (
              <EmptyState message="Detailed notes not yet available for this topic." />
            )
          ) : (
            <PremiumLock />
          )}
        </TabPanel>

        {/* Flowchart — premium only */}
        <TabPanel id="flowchart" activeTab={activeTab}>
          {isPremium ? (
            enContent?.flowchart_mermaid ? (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Flowchart (Mermaid)</h3>
                <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                  {enContent.flowchart_mermaid}
                </pre>
              </div>
            ) : (
              <EmptyState message="Flowchart not yet available for this topic." />
            )
          ) : (
            <PremiumLock />
          )}
        </TabPanel>

        {/* Tables — premium only */}
        <TabPanel id="tables" activeTab={activeTab}>
          {isPremium ? (
            enTables.length > 0 ? (
              <div className="space-y-8">
                {enTables.map((t) => (
                  <div key={t.id}>
                    <h3 className="font-semibold text-gray-800 mb-3">{t.title}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            {t.table_json.headers?.map((h, i) => (
                              <th key={i} className="border border-gray-200 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-700">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.table_json.rows?.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              {row.map((cell, j) => (
                                <td key={j} className="border border-gray-200 px-4 py-2 text-gray-600">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Tables not yet available for this topic." />
            )
          ) : (
            <PremiumLock />
          )}
        </TabPanel>

        {/* Diagrams — premium only */}
        <TabPanel id="diagrams" activeTab={activeTab}>
          {isPremium ? (
            diagrams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {diagrams.map((d) => (
                  <div key={d.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.image_url} alt={d.alt_text ?? d.caption ?? 'Diagram'} className="w-full" />
                    {d.caption && (
                      <p className="px-4 py-2 text-sm text-gray-500 text-center border-t border-gray-100">{d.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Diagrams not yet available for this topic." />
            )
          ) : (
            <PremiumLock />
          )}
        </TabPanel>

        {/* PYQs — available to all */}
        <TabPanel id="pyqs" activeTab={activeTab}>
          {pyqs.length > 0 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">{pyqs.length} questions from official GAT-B papers</p>
              {pyqs.map((pyq) => <PYQItem key={pyq.id} pyq={pyq} />)}
            </div>
          ) : (
            <EmptyState message="PYQs not yet available for this topic." />
          )}
        </TabPanel>

        {/* Quizzes — free: 10 questions, premium: 50 questions */}
        <TabPanel id="quizzes" activeTab={activeTab}>
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {allQuizQuestions.length} question{allQuizQuestions.length !== 1 ? 's' : ''} available
              {!isPremium && (
                <span className="ml-1 text-amber-600">(free plan — {quizQuestionLimit} per topic)</span>
              )}
            </p>
            {!isPremium && (
              <Link
                href="/app/buy/full"
                className="text-xs text-emerald-700 underline font-semibold"
              >
                Upgrade for {PREMIUM_QUIZ_QUESTION_COUNT} questions
              </Link>
            )}
          </div>
          {allQuizQuestions.length > 0 ? (
            <FlatQuizComponent questions={allQuizQuestions} />
          ) : (
            <EmptyState message="Quizzes not yet available for this topic." />
          )}
        </TabPanel>

        {/* AI Notes — available to all (rate limited for free) */}
        <TabPanel id="ai-notes" activeTab={activeTab}>
          <AINotesTab topicId={topic.id} subjectId={subject.id} isPremium={isPremium} />
        </TabPanel>

        {/* Doubt Chat — available to all (rate limited for free) */}
        <TabPanel id="doubt-chat" activeTab={activeTab}>
          <DoubtChatTab topicId={topic.id} subjectId={subject.id} isPremium={isPremium} />
        </TabPanel>
      </div>
    </div>
  )
}
