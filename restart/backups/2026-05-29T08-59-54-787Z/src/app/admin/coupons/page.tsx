import { getServiceClient } from '@/lib/admin'
import CouponsClient from './CouponsClient'

export default async function AdminCouponsPage() {
  const svc = getServiceClient()
  const { data: coupons } = await svc.from('coupons').select('*').order('created_at', { ascending: false })
  return <CouponsClient initialCoupons={coupons ?? []} />
}
