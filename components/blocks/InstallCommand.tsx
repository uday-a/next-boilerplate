'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

/** Copyable single-line install command. Port of Nuxt `InstallCommand.vue`. */
export function InstallCommand({ command }: { command: string }) {
  const t = useTranslations()
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = command
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-muted flex items-center gap-2 rounded-md py-1 pr-1 pl-3">
      <code className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs" title={command}>{command}</code>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        aria-label={copied ? t('uiKit.card.copied') : t('uiKit.card.copy')}
        onClick={copy}
      >
        {copied ? <Check className="text-success size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? t('uiKit.card.copied') : ''}
      </span>
    </div>
  )
}
