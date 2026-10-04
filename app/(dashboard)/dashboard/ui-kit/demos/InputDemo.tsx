'use client'

import { Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InputDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="ui-kit-input-email">Text input</Label>
        <Input id="ui-kit-input-email" prefixIcon={<Mail />} placeholder="name@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ui-kit-input-password">Password</Label>
        <Input id="ui-kit-input-password" type="password" defaultValue="secret123" showPasswordToggle />
      </div>
    </div>
  )
}
