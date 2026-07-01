import { DashboardShell } from '@/components/dashboard-shell'

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}