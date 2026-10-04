'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export default function SheetDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>View and edit item details.</SheetDescription>
        </SheetHeader>
        {/* The React sheet has no SheetBody; these are the Vue SheetBody classes. */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <Label htmlFor="ui-kit-sheet-name">Name</Label>
            <Input id="ui-kit-sheet-name" defaultValue="Acme Inc" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ui-kit-sheet-email">Email</Label>
            <Input id="ui-kit-sheet-email" defaultValue="hello@acme.com" />
          </div>
        </div>
        <SheetFooter>
          <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
