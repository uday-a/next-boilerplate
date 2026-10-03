import { localizedMetadata } from '@/lib/page-title'
import { RolesClient } from './roles-client'

export function generateMetadata() {
  return localizedMetadata('/admin/roles')
}

export default function AdminRolesPage() {
  return <RolesClient />
}
