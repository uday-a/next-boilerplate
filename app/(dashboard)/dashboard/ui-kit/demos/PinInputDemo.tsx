'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from '@/components/ui/pin-input'

export default function PinInputDemo() {
  const [otp, setOtp] = useState('')

  return (
    <div className="space-y-2">
      <Label>Verification code</Label>
      <PinInput value={otp} onChange={setOtp} maxLength={6} autoComplete="one-time-code">
        <PinInputGroup>
          <PinInputSlot index={0} />
          <PinInputSlot index={1} />
          <PinInputSlot index={2} />
          <PinInputSeparator />
          <PinInputSlot index={3} />
          <PinInputSlot index={4} />
          <PinInputSlot index={5} />
        </PinInputGroup>
      </PinInput>
    </div>
  )
}
