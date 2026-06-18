'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/blocks/DashboardLayout'
import { breadcrumbSegmentLabel } from '@/lib/breadcrumb-labels'
import type { SessionUser } from '@/lib/auth/types'
import type { ApiResponse } from '@/lib/api/response'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
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
    if (parts.length === 0) return [{ label: 'Dashboard' }]
    return parts.map((p, i) => ({
      label: breadcrumbSegmentLabel(p),
      href: i < parts.length - 1 ? `/${parts.slice(0, i + 1).join('/')}` : undefined,
    }))
  }, [pathname])

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
          ? { name: user.name, email: user.email, avatar: user.avatar ?? undefined }
          : undefined
      }
      onProfileSelect={onProfileSelect}
      onCommandSelect={(item) => {
        if (item.hint) router.push(item.hint)
      }}
    >
      {children}
    </DashboardLayout>
  )
}