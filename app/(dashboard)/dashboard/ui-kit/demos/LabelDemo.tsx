'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LabelDemo() {
  return (
    <div className="max-w-xs space-y-2">
      <Label htmlFor="ui-kit-label-workspace">Workspace name</Label>
      <Input id="ui-kit-label-workspace" placeholder="Acme Inc" />
    </div>
  )
}
