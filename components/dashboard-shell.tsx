'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/blocks/DashboardLayout'
import { Toaster } from '@/components/ui/sonner'
import { routeLabel } from '@/lib/breadcrumb-labels'
import type { SessionUser } from '@/lib/auth/types'
import type { ApiResponse } from '@/lib/api/response'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: SessionUser; loggedInAt?: number }>>)
      .then((res) => {
        if (res.ok) setUser(res.data.user)
      })
      .catch(() => undefined)
  }, [])

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return [{ label: t('nav.items.dashboard') }]
    return parts.map((_, i) => {
      const path = `/${parts.slice(0, i + 1).join('/')}`
      return { label: routeLabel(path, t), href: i < parts.length - 1 ? path : undefined }
    })
  }, [pathname, t])

  async function onProfileSelect(key: string) {
    if (key === 'logout') {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
      return
    }
    if (key === 'account') router.push('/settings/account')
    if (key === 'billing') router.push('/settings/billing')
    if (key === 'settings') router.push('/settings')
  }

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      user={
        user
          ? { name: user.name, email: user.email, avatar: user.avatar ?? undefined, role: user.role }
          : undefined
      }
      onProfileSelect={onProfileSelect}
      onCommandSelect={(item) => {
        if (item.hint) router.push(item.hint)
      }}
    >
      {children}
      {/* WHY: copy-to-clipboard confirmations (data table, billing) need a
          mounted Toaster to render anywhere under the dashboard shell. */}
      <Toaster />
    </DashboardLayout>
  )
}