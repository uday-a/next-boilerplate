'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse } from '@/lib/api/response'

export function Hero01() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: unknown }>>)
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  return (
    <section className="bg-background relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" />
              New: AI-powered insights
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              The platform your team will actually use.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              One workspace for everything your team needs. Built on shadcn/ui primitives — fast, accessible, easy to
              customise.
            </p>
            <div className="flex flex-wrap items-center gap-3">
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
                {/* The login page has a one-click demo workspace; send people there
                    rather than to a video that doesn't exist. */}
                <Link href="/login">
                  <PlayCircle className="size-4" aria-hidden="true" />
                  Try the live demo
                </Link>
              </Button>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span>★★★★★ 4.9 on G2</span>
              <span>14-day free trial</span>
              <span>No credit card required</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mr-0" aria-hidden="true">
            {/* WHY: flat system -- shadow-sm only. Cards sit on
                borders, not elevation. */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Onboarding queue</CardTitle>
                <CardDescription>3 starting Monday</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>LW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Lena Wei</p>
                    <p className="text-muted-foreground text-xs">Engineering</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>JR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Joaquín Reyes</p>
                    <p className="text-muted-foreground text-xs">Engineering</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Priya Shah</p>
                    <p className="text-muted-foreground text-xs">Engineering</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardContent>
            </Card>
            <div className="relative -mt-4 hidden grid-cols-2 gap-4 px-4 md:grid">
              <Card className="rotate-2 shadow-sm">
                <CardContent className="space-y-1 p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Active users</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">1,284</p>
                  <p className="text-success text-xs">+8.2% MoM</p>
                </CardContent>
              </Card>
              <Card className="-rotate-2 shadow-sm">
                <CardContent className="space-y-1 p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Uptime</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">100%</p>
                  <p className="text-muted-foreground text-xs">12 cycles, 0 misses</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}