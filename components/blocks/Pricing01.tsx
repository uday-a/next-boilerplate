'use client'

import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Cycle = 'monthly' | 'yearly'
type Plan = 'pro' | 'team' | 'enterprise'

export interface Pricing01Props {
  onSubscribe?: (plan: Plan, cycle: Cycle) => void
  onContactSales?: () => void
}

export function Pricing01({ onSubscribe, onContactSales }: Pricing01Props = {}) {
  const [cycle, setCycle] = React.useState<Cycle>('monthly')

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Plans for teams of every size</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
            No hidden fees. Cancel anytime. Save 20% with annual billing.
          </p>

          <div className="mt-6 inline-flex">
            <ToggleGroup
              type="single"
              value={cycle}
              onValueChange={(v) => v && setCycle(v as Cycle)}
            >
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">−20%</Badge>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <CardDescription>For small teams trying things out.</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">${cycle === 'monthly' ? 9 : 7}</span>
                <span className="text-muted-foreground text-sm">/ user / month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Up to 10 employees</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Core HR + directory</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Time off + holidays</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {onSubscribe ? (
                <Button className="w-full" variant="outline" onClick={() => onSubscribe('pro', cycle)}>
                  Start free
                </Button>
              ) : (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/sign-up">Start free</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="relative">
            <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 gap-1 shadow-sm">
              <Sparkles className="size-3" /> Most popular
            </Badge>
            <Card className="border-primary ring-primary/10 shadow-lg ring-1">
              <CardHeader>
                <CardTitle className="text-xl">Team</CardTitle>
                <CardDescription>For growing companies scaling people ops.</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">${cycle === 'monthly' ? 29 : 24}</span>
                  <span className="text-muted-foreground text-sm">/ user / month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    <span>Unlimited employees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    <span>Payroll + tax filing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    <span>Onboarding workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    <span>Performance reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    <span>Slack + priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {onSubscribe ? (
                  <Button className="w-full" onClick={() => onSubscribe('team', cycle)}>
                    Start 14-day trial
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/sign-up">Start 14-day trial</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <CardDescription>Custom controls for regulated industries.</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Everything in Team</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>SSO + SCIM provisioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Audit logs + role policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span>99.99% SLA</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {onContactSales ? (
                <Button className="w-full" variant="outline" onClick={onContactSales}>
                  Talk to sales
                </Button>
              ) : (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Talk to sales</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}