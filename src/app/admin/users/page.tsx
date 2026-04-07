import { getServiceClient } from '@/lib/admin'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const svc = getServiceClient()
  const { data } = await svc.auth.admin.listUsers()
  return <UsersClient initialUsers={data?.users ?? []} />
}
