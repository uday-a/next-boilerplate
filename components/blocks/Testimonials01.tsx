'use client'

import * as React from 'react'
import { Quote } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    quote:
      'We replaced four spreadsheets and two SaaS tools with this. Onboarding time dropped from 6 days to under 4 hours.',
    name: 'Aisha Rahman',
    role: 'Head of People',
    company: 'Northwind Logistics',
    initials: 'AR',
  },
  {
    quote:
      'The audit trail alone is worth it. SOC2 evidence collection went from a quarterly nightmare to a one-click export.',
    name: 'Marco Vidal',
    role: 'Director of Compliance',
    company: 'Helio Health',
    initials: 'MV',
  },
  {
    quote:
      'My favourite part is how fast it is. No spinners, no loading states. Search returns instantly across the entire org.',
    name: 'Tomoko Saito',
    role: 'IT Operations',
    company: 'Pixel & Co',
    initials: 'TS',
  },
]

export function Testimonials01() {
  const [active, setActive] = React.useState(0)

  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Testimonials</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Loved by teams everywhere</h2>
        </div>

        <Card className="mt-10">
          <CardContent className="space-y-6 p-8 text-center">
            <Quote className="text-primary mx-auto size-8" />
            <p className="text-foreground text-xl leading-relaxed sm:text-2xl">
              &ldquo;{testimonials[active].quote}&rdquo;
            </p>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-12">
                <AvatarFallback>{testimonials[active].initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{testimonials[active].name}</p>
                <p className="text-muted-foreground text-xs">
                  {testimonials[active].role} · {testimonials[active].company}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`Show testimonial from ${t.name}`}
              aria-current={i === active}
              className={cn(
                'size-2 rounded-full transition-all duration-200',
                i === active ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60',
              )}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
