'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectDemo() {
  return (
    <div className="max-w-xs space-y-2">
      <Label htmlFor="ui-kit-select">Plan</Label>
      <Select defaultValue="pro">
        <SelectTrigger id="ui-kit-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
