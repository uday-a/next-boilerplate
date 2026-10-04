'use client'

import { Fingerprint, Mail, Palette, Settings } from 'lucide-react'
import { IconBox } from '@/components/ui/icon-box'

export default function IconBoxDemo() {
  return (
    <div className="flex gap-2">
      <IconBox icon={Mail} />
      <IconBox icon={Settings} variant="muted" />
      <IconBox icon={Palette} variant="muted" />
      <IconBox icon={Fingerprint} variant="custom" />
    </div>
  )
}
