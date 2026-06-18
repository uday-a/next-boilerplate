'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ApiResponse } from '@/lib/api/response'

export function Cta01() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: unknown }>>)
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  return (
    <section className="bg-background relative overflow-hidden">
      <div className="from-primary/15 via-background to-background pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br" />
      <div className="bg-primary/10 pointer-events-none absolute right-1/4 -bottom-40 size-[500px] rounded-full blur-3xl" />

      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to give your team a Monday they'll actually look forward to?
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          Set up takes 12 minutes. Migrate from your current tool with one CSV upload.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {loggedIn ? (
            <Button asChild size="lg">
              <Link href="/dashboard">
                Go to dashboard
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start free trial
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Book a demo</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">14-day free trial · No credit card required · Cancel anytime</p>
      </div>
    </section>
  )
}