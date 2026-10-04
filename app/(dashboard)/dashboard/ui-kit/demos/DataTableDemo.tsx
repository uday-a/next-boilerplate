'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'

interface Member {
  name: string
  email: string
  role: string
  status: 'Active' | 'Invited'
}

const members: Member[] = [
  { name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'Owner', status: 'Active' },
  { name: 'Liam Carter', email: 'liam.carter@example.com', role: 'Admin', status: 'Active' },
  { name: 'Olivia Brooks', email: 'olivia.brooks@example.com', role: 'Member', status: 'Invited' },
  { name: 'Noah Bennett', email: 'noah.bennett@example.com', role: 'Member', status: 'Active' },
  { name: 'Ava Thompson', email: 'ava.thompson@example.com', role: 'Viewer', status: 'Invited' },
]

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} label="Email" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'Active' ? 'success' : 'secondary'}>{row.original.status}</Badge>
    ),
  },
]

export default function DataTableDemo() {
  return <DataTable columns={columns} data={members} hideToolbar enablePagination={false} />
}
