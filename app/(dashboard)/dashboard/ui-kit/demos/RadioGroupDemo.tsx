'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const options = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
]

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Density">
      {options.map(o => (
        <div key={o.value} className="flex items-center gap-2">
          <RadioGroupItem id={`ui-kit-radio-${o.value}`} value={o.value} />
          <Label htmlFor={`ui-kit-radio-${o.value}`} className="text-sm font-normal">{o.label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}
