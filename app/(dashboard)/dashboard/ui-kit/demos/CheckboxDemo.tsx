'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function CheckboxDemo() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox id="ui-kit-terms" />
        <Label htmlFor="ui-kit-terms" className="text-sm font-normal">Accept terms</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="ui-kit-news" defaultChecked />
        <Label htmlFor="ui-kit-news" className="text-sm font-normal">Newsletter</Label>
      </div>
    </div>
  )
}
