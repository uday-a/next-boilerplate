'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// The <Toaster /> host is mounted once in the dashboard shell; demos just call toast().
function withUndo() {
  toast.success('Invoice INV-2031 deleted', {
    action: { label: 'Undo', onClick: () => toast('Invoice restored') },
  })
}

export default function SonnerDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => toast.success('Changes saved')}>Success</Button>
      <Button variant="outline" size="sm" onClick={() => toast.error('Couldn’t reach the server')}>Error</Button>
      <Button variant="outline" size="sm" onClick={withUndo}>With undo</Button>
    </div>
  )
}
