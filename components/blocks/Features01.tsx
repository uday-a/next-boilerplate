import { BarChart3, Calendar, FileCheck2, ShieldCheck, Users, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Features01() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl space-y-3">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything teams need, nothing they don't.</h2>
          <p className="text-muted-foreground text-lg">
            Six modules that work together out of the box. Pay only for what you use.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Users className="size-5" />
              </div>
              <CardTitle className="text-base">Employee directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Single source of truth for people, roles and reporting lines — searchable and exportable.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Wallet className="size-5" />
              </div>
              <CardTitle className="text-base">Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Multi-currency runs with automatic tax filing and direct deposit. Pause and resume in one click.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <BarChart3 className="size-5" />
              </div>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                OKRs, 1:1s, 360 reviews and continuous feedback all linked to the org chart.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <FileCheck2 className="size-5" />
              </div>
              <CardTitle className="text-base">Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                34 templated tasks split across pre-start, day 1, week 1, month 1 and 90-day milestones.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Calendar className="size-5" />
              </div>
              <CardTitle className="text-base">Time off</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Accrual-based leave with manager approval workflow and shared team calendar.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-base">Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                GDPR, SOC2 and HIPAA-ready audit trails. Right-to-erasure built in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
