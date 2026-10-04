'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SwitchDemo() {
  return (
    <div className="max-w-xs space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="ui-kit-switch-notifications" className="text-sm font-normal">Notifications</Label>
        <Switch id="ui-kit-switch-notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="ui-kit-switch-digest" className="text-sm font-normal">Weekly digest</Label>
        <Switch id="ui-kit-switch-digest" />
      </div>
    </div>
  )
}
