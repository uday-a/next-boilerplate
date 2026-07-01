import { Activity, Clock, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function Bento01() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl space-y-3">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Built for scale</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A workspace your team grows into, not out of.</h2>
          <p className="text-muted-foreground text-lg">
            Four surfaces that work end-to-end. Replace any one without touching the rest.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
          <Card className="lg:col-span-2 lg:row-span-2">
            <CardContent className="flex h-full flex-col gap-6 p-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Sparkles className="size-5" />
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight">AI-assisted reviews</h3>
                <p className="text-muted-foreground">
                  Draft 360 feedback in seconds. The assistant reads your goals, your 1:1 notes and your peer reviews,
                  then writes a first pass you can edit. Every suggestion cites the source so nothing comes out of
                  nowhere.
                </p>
              </div>

              <div className="bg-muted/30 mt-auto rounded-lg border p-5">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Draft quality</span>
                  <span className="font-mono">92 / 100</span>
                </div>
                <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                  <div className="bg-primary h-full w-[92%] rounded-full" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <p className="text-foreground font-mono text-base">12</p>
                    <p className="text-muted-foreground">Goals</p>
                  </div>
                  <div>
                    <p className="text-foreground font-mono text-base">34</p>
                    <p className="text-muted-foreground">1:1 notes</p>
                  </div>
                  <div>
                    <p className="text-foreground font-mono text-base">8</p>
                    <p className="text-muted-foreground">Peers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 lg:row-span-1">
            <CardContent className="flex h-full items-start gap-5 p-6">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Activity className="size-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">Real-time activity</h3>
                <p className="text-muted-foreground text-sm">
                  Every event — hire, promotion, time-off, payroll run — streams into a single timeline you can filter by
                  team, person or module.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">12 min</p>
                <p className="text-muted-foreground mt-1 text-sm">Average setup time</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">SOC 2 · ISO 27001 · GDPR</p>
                <p className="text-muted-foreground mt-1 text-sm">Encrypted at rest, audited quarterly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
