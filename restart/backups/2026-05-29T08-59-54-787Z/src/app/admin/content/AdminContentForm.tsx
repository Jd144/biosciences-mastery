'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  topic: { id: string; title: string; subjects?: { name: string; slug: string } | null } | null
  content: Array<{ language: string; short_notes_md: string | null; detailed_notes_md: string | null; flowchart_mermaid: string | null }>
  tables: Array<{ id: string; title: string; table_json: { headers: string[]; rows: string[][] }; language: string }>
  diagrams: Array<{ id: string; image_url: string; caption: string | null }>
}

export default function AdminContentForm({ topic, content, tables, diagrams }: Props) {
  const enContent = content.find((c) => c.language === 'en') ?? {}
  const [shortNotes, setShortNotes] = useState((enContent as { short_notes_md?: string | null }).short_notes_md ?? '')
  const [detailedNotes, setDetailedNotes] = useState((enContent as { detailed_notes_md?: string | null }).detailed_notes_md ?? '')
  const [flowchart, setFlowchart] = useState((enContent as { flowchart_mermaid?: string | null }).flowchart_mermaid ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          topic_id: topic?.id,
          language: 'en',
          short_notes_md: shortNotes,
          detailed_notes_md: detailedNotes,
          flowchart_mermaid: flowchart,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{topic?.title}</h1>
        <p className="text-gray-500 text-sm">{topic?.subjects?.name}</p>
      </div>

      <div className="space-y-6">
        {/* Short Notes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Short Notes (Markdown)</label>
          <textarea
            value={shortNotes}
            onChange={(e) => setShortNotes(e.target.value)}
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="## Key Points&#10;- Point 1&#10;- Point 2"
          />
        </div>

        {/* Detailed Notes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Notes (Markdown)</label>
          <textarea
            value={detailedNotes}
            onChange={(e) => setDetailedNotes(e.target.value)}
            rows={16}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="# Topic Title&#10;&#10;## Introduction&#10;..."
          />
        </div>

        {/* Flowchart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Flowchart (Mermaid syntax)</label>
          <textarea
            value={flowchart}
            onChange={(e) => setFlowchart(e.target.value)}
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="graph TD&#10;A[Start] --> B[Step 1]&#10;B --> C[Step 2]"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={save} loading={saving}>
            {saved ? '✓ Saved!' : 'Save Content'}
          </Button>
          <span className="text-sm text-gray-400">{tables.length} tables, {diagrams.length} diagrams</span>
        </div>
      </div>
    </div>
  )
}
