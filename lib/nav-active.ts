/**
 * Route-aware nav highlighting for sidebar-02.
 * Dashboard is exact-only so /dashboard/kanban does not light up Dashboard.
 */
export function isNavItemActive(pathname: string, url: string): boolean {
  const path = pathname.split('?')[0] ?? pathname
  if (url === '/dashboard') return path === '/dashboard'
  if (path === url) return true
  return path.startsWith(`${url}/`)
}