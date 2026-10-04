'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaDemo() {
  return (
    <div className="space-y-2">
      <Label htmlFor="ui-kit-textarea">Message</Label>
      <Textarea id="ui-kit-textarea" placeholder="Enter your message..." rows={3} />
    </div>
  )
}
