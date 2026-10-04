'use client'

import { Image as ImageIcon, Link as LinkIcon, List, ListOrdered } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup type="single" defaultValue="list">
      <ToggleGroupItem value="list" aria-label="Bulleted list"><List className="size-4" /></ToggleGroupItem>
      <ToggleGroupItem value="ordered" aria-label="Numbered list"><ListOrdered className="size-4" /></ToggleGroupItem>
      <ToggleGroupItem value="link" aria-label="Link"><LinkIcon className="size-4" /></ToggleGroupItem>
      <ToggleGroupItem value="image" aria-label="Image"><ImageIcon className="size-4" /></ToggleGroupItem>
    </ToggleGroup>
  )
}
