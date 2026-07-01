'use client'

import * as React from 'react'
import Link from 'next/link'
import { Boxes, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { ApiResponse } from '@/lib/api/response'

export function Header01() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [loggedIn, setLoggedIn] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: unknown }>>)
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Boxes className="size-4" />
          </div>
          <span className="text-base font-semibold">Acme</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Features</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a>
          <a href="#customers" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Customers</a>
          <a href="#docs" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Docs</a>
          <a href="#blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Blog</a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Start free trial</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                    <Boxes className="size-3.5" />
                  </div>
                  <span className="text-sm font-semibold">Acme</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile">
                <a
                  href="#features"
                  className="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#customers"
                  className="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Customers
                </a>
                <a
                  href="#docs"
                  className="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Docs
                </a>
                <a
                  href="#blog"
                  className="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </a>
              </nav>
              <div className="flex flex-col gap-2 border-t p-4">
                {loggedIn ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      Go to dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                        Start free trial
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
