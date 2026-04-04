import { getServiceClient } from '@/lib/admin'

export default async function AdminUsersPage() {
  const serviceSupabase = getServiceClient()
  const { data } = await serviceSupabase.auth.admin.listUsers()
  const users = data?.users ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email / Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Sign In</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                <td className="px-4 py-3 text-gray-800">{u.email ?? u.phone ?? u.id}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-IN') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
