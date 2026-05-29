import { getServiceClient } from '@/lib/admin'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const svc = getServiceClient()
  const [usersRes, entitlementsRes] = await Promise.all([
    svc.auth.admin.listUsers(),
    svc.from('entitlements').select('user_id, type'),
  ])

  const users = usersRes.data?.users ?? []
  const entitlements: { user_id: string; type: string }[] = entitlementsRes.data ?? []

  // Build a map: userId -> isPremium
  const premiumUserIds = new Set(
    entitlements.filter((e) => e.type === 'FULL').map((e) => e.user_id)
  )

  const enriched = users.map((u) => ({
    ...u,
    isPremium: premiumUserIds.has(u.id),
  }))

  return <UsersClient initialUsers={enriched} />
}
