'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export default function SliderDemo() {
  const [value, setValue] = useState([65])

  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor="ui-kit-slider">
        Slider (<span className="tabular-nums">{value[0]}%</span>)
      </Label>
      <Slider
        id="ui-kit-slider"
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={1}
        aria-label="Demo slider"
      />
    </div>
  )
}
