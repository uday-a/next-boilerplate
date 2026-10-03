import { localizedMetadata } from '@/lib/page-title'
import { UsersClient } from './users-client'

export function generateMetadata() {
  return localizedMetadata('/admin/users')
}

export default function AdminUsersPage() {
  return <UsersClient />
}
