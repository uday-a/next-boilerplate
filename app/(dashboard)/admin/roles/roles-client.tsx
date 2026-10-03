'use client'

import { useMemo, useState } from 'react'
import { Lock, Search, ShieldAlert, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, cardVariants } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { cn } from '@/lib/utils'
import { allPermissionIds, defaultGrants, permissionGroups, roles, type RoleId } from '@/lib/rbac-mock'

/** RBAC matrix. Port of Nuxt `admin/roles.vue` (mock-backed, session-only). */

type Grants = Record<RoleId, Set<string>>

// Grants are held as Sets per role; `saved` is the baseline we diff against.
const toSets = (g: Record<RoleId, string[]>) =>
  Object.fromEntries(Object.entries(g).map(([k, v]) => [k, new Set(v)])) as Grants
const copy = (g: Grants) => toSets(Object.fromEntries(roles.map((r) => [r.id, [...g[r.id]]])) as Record<RoleId, string[]>)

export function RolesClient() {
  const t = useTranslations()
  const [saved, setSaved] = useState<Grants>(() => toSets(defaultGrants))
  const [grants, setGrants] = useState<Grants>(() => toSets(defaultGrants))
  const [savedFlash, setSavedFlash] = useState(false)
  // Highlight a role column from its summary card.
  const [focusRole, setFocusRole] = useState<RoleId | null>(null)
  const [search, setSearch] = useState('')

  const has = (role: RoleId, perm: string) => grants[role].has(perm)
  const isChanged = (role: RoleId, perm: string) => has(role, perm) !== saved[role].has(perm)

  function toggle(role: RoleId, perm: string, on: boolean) {
    const next = new Set(grants[role])
    if (on) next.add(perm)
    else next.delete(perm)
    setGrants({ ...grants, [role]: next })
  }

  // Group checkbox: checked / indeterminate / unchecked from its permissions.
  function groupState(role: RoleId, ids: string[]): boolean | 'indeterminate' {
    const n = ids.filter((id) => has(role, id)).length
    return n === 0 ? false : n === ids.length ? true : 'indeterminate'
  }

  function toggleGroup(role: RoleId, ids: string[], on: boolean) {
    const next = new Set(grants[role])
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)))
    setGrants({ ...grants, [role]: next })
  }

  const changeCount = roles.reduce((sum, r) => sum + allPermissionIds.filter((id) => isChanged(r.id, id)).length, 0)

  function save() {
    setSaved(copy(grants))
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  function discard() {
    setGrants(copy(saved))
  }

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return permissionGroups
    return permissionGroups
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter((p) => `${g.label} ${p.label} ${p.description}`.toLowerCase().includes(q)),
      }))
      .filter((g) => g.permissions.length)
  }, [search])

  return (
    <Page>
      <PageHeader
        actions={
          <>
            {changeCount ? (
              <span className="text-warning text-xs font-medium tabular-nums">
                {t('admin.roles.unsaved', { n: changeCount })}
              </span>
            ) : savedFlash ? (
              <span className="text-success text-xs font-medium">{t('admin.roles.saved')}</span>
            ) : null}
            <Button variant="outline" size="sm" disabled={!changeCount} onClick={discard}>
              {t('admin.roles.discard')}
            </Button>
            <Button size="sm" disabled={!changeCount} onClick={save}>
              {t('admin.roles.save')}
            </Button>
          </>
        }
      >
        <PageHeaderHeading title={t('nav.items.roles')} description={t('admin.roles.description')} />
      </PageHeader>

      <PageBody className="space-y-4">
        <DemoDataBanner message={t('admin.roles.demo')} />

        {/* Role summaries: click to highlight that column */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              aria-pressed={focusRole === role.id}
              className={cn(
                cardVariants(),
                'focus-visible:ring-ring/50 p-4 text-left focus-visible:ring-[3px] focus-visible:outline-none',
                focusRole === role.id ? 'border-primary/50 bg-primary/5 ring-primary ring-1' : 'hover:border-foreground/20',
              )}
              onClick={() => setFocusRole(focusRole === role.id ? null : role.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{role.name}</span>
                {role.locked ? (
                  <Lock className="text-muted-foreground size-3.5" aria-label={t('admin.roles.locked')} />
                ) : null}
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{role.description}</p>
              <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs tabular-nums">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" aria-hidden="true" />
                  {t('admin.roles.members', { n: role.members })}
                </span>
                <span>
                  <span className="text-foreground font-medium">{grants[role.id].size}</span>/{allPermissionIds.length}
                </span>
              </div>
              <div className="bg-muted mt-2 h-1 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-200"
                  style={{ width: `${Math.round((grants[role.id].size / allPermissionIds.length) * 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b">
            <CardTitle className="text-base">{t('admin.roles.matrix.title')}</CardTitle>
            <CardDescription>{t('admin.roles.matrix.description')}</CardDescription>
            <CardAction>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                prefixIcon={<Search className="size-4" aria-hidden="true" />}
                allowClear
                placeholder={t('admin.roles.matrix.search')}
                className="w-40 sm:w-64"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <TooltipProvider delayDuration={200}>
              {visibleGroups.length ? (
                <div className="max-h-[640px] overflow-auto">
                  <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="bg-card text-muted-foreground sticky top-0 left-0 z-20 border-b px-4 py-2.5 text-left text-xs font-medium tracking-wider uppercase"
                        >
                          {t('admin.roles.matrix.permission')}
                        </th>
                        {roles.map((role) => (
                          <th
                            key={role.id}
                            scope="col"
                            className={cn(
                              'sticky top-0 z-10 w-24 border-b px-2 py-2.5 text-center text-xs font-medium',
                              focusRole === role.id ? 'bg-primary/5 text-foreground' : 'bg-card text-muted-foreground',
                            )}
                          >
                            <span className="inline-flex items-center gap-1">
                              {role.name}
                              {role.locked ? <Lock className="size-3" aria-hidden="true" /> : null}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {visibleGroups.map((group) => {
                      const ids = group.permissions.map((p) => p.id)
                      return (
                        <tbody key={group.id}>
                          {/* Group row: tri-state checkbox per role */}
                          <tr className="bg-muted">
                            <th scope="rowgroup" className="bg-muted sticky left-0 border-b px-4 py-2 text-left text-xs font-semibold">
                              {group.label}
                              <span className="text-muted-foreground ml-1 font-normal">{group.permissions.length}</span>
                            </th>
                            {roles.map((role) => (
                              <td
                                key={role.id}
                                className={cn('border-b px-2 py-2 text-center', focusRole === role.id && 'bg-primary/5')}
                              >
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={groupState(role.id, ids)}
                                    disabled={role.locked}
                                    aria-label={t('admin.roles.matrix.groupAria', { group: group.label, role: role.name })}
                                    onCheckedChange={(v) => toggleGroup(role.id, ids, v === true)}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                          {group.permissions.map((perm) => (
                            <tr key={perm.id} className="hover:bg-muted/40 transition-colors">
                              <th scope="row" className="bg-card sticky left-0 border-b px-4 py-2.5 text-left font-normal">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">{perm.label}</span>
                                  {perm.risky ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ShieldAlert className="text-warning size-3.5" aria-label={t('admin.roles.risky')} />
                                      </TooltipTrigger>
                                      <TooltipContent>{t('admin.roles.riskyHint')}</TooltipContent>
                                    </Tooltip>
                                  ) : null}
                                </div>
                                <div className="text-muted-foreground text-xs">{perm.description}</div>
                              </th>
                              {roles.map((role) => (
                                <td
                                  key={role.id}
                                  className={cn(
                                    'border-b px-2 py-2.5 text-center transition-colors',
                                    isChanged(role.id, perm.id)
                                      ? 'bg-warning/10 ring-warning/60 ring-1 ring-inset'
                                      : focusRole === role.id && 'bg-primary/5',
                                  )}
                                >
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={has(role.id, perm.id)}
                                      disabled={role.locked}
                                      aria-label={`${perm.label} — ${role.name}`}
                                      onCheckedChange={(v) => toggle(role.id, perm.id, v === true)}
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      )
                    })}
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  title={t('admin.roles.matrix.emptyTitle')}
                  description={t('admin.roles.matrix.emptyDescription')}
                />
              )}
            </TooltipProvider>
          </CardContent>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 border-t px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="text-warning size-3.5" aria-hidden="true" />
              {t('admin.roles.legend.risky')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-warning/10 border-warning/60 size-3.5 rounded-sm border" />
              {t('admin.roles.legend.changed')}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5" aria-hidden="true" />
              {t('admin.roles.legend.locked')}
            </span>
          </div>
        </Card>
      </PageBody>
    </Page>
  )
}
