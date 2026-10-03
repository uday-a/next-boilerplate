import { localizedMetadata } from '@/lib/page-title'
import { DataTableClient } from './data-table-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/data-table')
}

export default function DataTablePage() {
  return <DataTableClient />
}