import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Crown, Sparkles, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, slug, name, description')
    .eq('is_active', true)
    .order('order_index')
    .limit(6)

  // Check entitlements
  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('type, subject_id')
    .eq('user_id', user.id)

  const hasFull = entitlements?.some((e) => e.type === 'FULL') ?? false
  const ownedSubjectCount = entitlements?.filter((e) => e.type === 'SUBJECT').length ?? 0
  const isPremium = hasFull || ownedSubjectCount > 0

  const displayName = user.email ?? user.phone ?? 'Student'

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
        <p className="text-gray-500 mt-1">{displayName}</p>
      </div>

      {/* Access Status */}
      {hasFull ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Crown className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">Premium — Full Course</p>
            <p className="text-emerald-600 text-sm">Unlimited access to all subjects, AI features, and quizzes.</p>
          </div>
        </div>
      ) : isPremium ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Crown className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold text-blue-800">Premium — {ownedSubjectCount} Subject{ownedSubjectCount !== 1 ? 's' : ''}</p>
            <p className="text-blue-600 text-sm">Full access to your purchased subjects.</p>
          </div>
          <Link
            href="/app/buy/full"
            className="ml-auto shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium"
          >
            Upgrade to Full ₹999
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Free Plan</p>
            <p className="text-amber-600 text-sm">Limited access: 10 quiz questions/topic, 5 AI requests/day. Upgrade for full access.</p>
          </div>
          <Link
            href="/app/buy/full"
            className="ml-auto shrink-0 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium"
          >
            Upgrade ₹999
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">10</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Requests/Day</p>
              <p className="text-2xl font-bold text-gray-900">{hasFull ? 'Unlimited' : '5'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-2xl font-bold text-gray-900">{hasFull ? 'Premium' : isPremium ? 'Subject' : 'Free'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Subjects</h2>
          <Link href="/app/subjects" className="text-emerald-600 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(subjects ?? []).map((subject) => (
            <Link
              key={subject.id}
              href={`/app/subjects/${subject.slug}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-gray-800 text-sm">{subject.name}</span>
              </div>
              {subject.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{subject.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
