'use client'

import * as React from 'react'
import Link from 'next/link'
import { Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const Github = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
  </svg>
)

const REPO_URL = 'https://github.com/uday-a/next-boilerplate'

/**
 * Concise marketing footer — real destinations only. Port of Nuxt
 * `Footer01.vue` @462c304: a boilerplate footer full of href="#"
 * teaches dead links. Add columns back as the pages exist.
 */
export function Footer01() {
  const [newsletter, setNewsletter] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!newsletter) return
    setSubscribed(true)
    setNewsletter('')
  }

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <Boxes className="size-4" aria-hidden="true" />
              </div>
              <span className="text-base font-semibold">Acme</span>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm">
              Projects, billing and permissions for growing teams. Product updates once a month.
            </p>
            <form className="flex max-w-sm gap-2" onSubmit={subscribe}>
              <Input
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                type="email"
                placeholder="you@company.com"
                required
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
            {subscribed ? <p className="text-success text-xs">Thanks — check your inbox to confirm.</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Help center
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">© 2026 Acme. All rights reserved.</p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
