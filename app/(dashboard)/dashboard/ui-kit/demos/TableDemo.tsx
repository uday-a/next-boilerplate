'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const invoices = [
  { id: 'INV-1042', customer: 'Northwind Labs', amount: '$1,280.00', status: 'Paid' },
  { id: 'INV-1041', customer: 'Brightline Co', amount: '$640.00', status: 'Due' },
  { id: 'INV-1040', customer: 'Harbor Analytics', amount: '$2,150.00', status: 'Paid' },
]

export default function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono text-xs">{inv.id}</TableCell>
            <TableCell>{inv.customer}</TableCell>
            <TableCell>
              <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
