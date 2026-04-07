import { getServiceClient } from '@/lib/admin'
import SettingsClient from './SettingsClient'

export default async function AdminSettingsPage() {
  const svc = getServiceClient()
  const { data } = await svc.from('app_settings').select('*')
  const settings: Record<string, string> = {}
  for (const row of (data ?? [])) settings[row.key] = row.value
  return <SettingsClient initialSettings={settings} />
}
