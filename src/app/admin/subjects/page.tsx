'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Subject {
  id: string
  name: string
  slug: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      setSubjects(data || [])
      setLoading(false)
    }
    fetchSubjects()
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Link
          href="/admin/subjects/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Subject
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : subjects.length === 0 ? (
        <p className="text-gray-500">No subjects found. Add one!</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, i) => (
              <tr key={subject.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{subject.name}</td>
                <td className="p-3 text-gray-500">{subject.slug}</td>
              </tr>
