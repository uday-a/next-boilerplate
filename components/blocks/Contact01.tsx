'use client'

import * as React from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LeafletMap, LeafletMarker, LeafletPopup } from '@/components/ui/leaflet-map'
import { kindDotBg, kindDotClass } from '@/lib/locations'

// Stable identity: LeafletMap re-centres when `center` changes. [lng, lat].
const APPLE_PARK: [number, number] = [-122.009, 37.3349]

export interface Contact01Props {
  onSubmit?: (payload: {
    name: string
    email: string
    company: string
    subject: string
    message: string
  }) => void
}

export function Contact01({ onSubmit }: Contact01Props) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [subject, setSubject] = React.useState('sales')
  const [message, setMessage] = React.useState('')
  const [sent, setSent] = React.useState(false)

  const canSubmit = !!name && !!email && !!message

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit?.({ name, email, company, subject, message })
    setSent(true)
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Contact</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Talk to a human</h2>
            <p className="text-muted-foreground text-lg">
              Tell us a bit about your team and we&apos;ll show you how we&apos;d fit. Average reply: 4 hours.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Email</p>
                  <a href="mailto:hello@acme.test" className="text-sm font-medium hover:underline"> hello@acme.test </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Phone</p>
                  <p className="text-sm font-medium">+1 (415) 555-0142</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Office</p>
                  <p className="text-sm font-medium">120 Howard St, San Francisco</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/40 mt-6 h-48 overflow-hidden rounded-lg border border-dashed">
              <LeafletMap
                variant="muted"
                center={APPLE_PARK}
                zoom={14}
                scrollWheelZoom={false}
                role="region"
                aria-label="Map showing Apple Park in Cupertino"
              >
                <LeafletMarker lngLat={APPLE_PARK} anchor="center">
                  {/* Same HQ marker as the dashboard Locations page. */}
                  <span className="relative flex items-center justify-center">
                    <span className={`absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping ${kindDotBg('hq')}`} aria-hidden="true" />
                    <span className={`outline-background relative block size-5 rounded-full ring-4 outline-2 ${kindDotClass('hq')}`} />
                  </span>
                  <LeafletPopup offset={[0, -10]}>
                    <div className="text-sm font-semibold">Apple Park</div>
                    <div className="text-muted-foreground text-xs">One Apple Park Way, Cupertino, CA</div>
                  </LeafletPopup>
                </LeafletMarker>
              </LeafletMap>
            </div>
          </div>

          <Card>
            {!sent ? (
              <>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>We reply during business hours (PT)</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={submit} suppressHydrationWarning>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="contact-name">Name</Label>
                        <Input
                          id="contact-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="off"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact-email">Work email</Label>
                        <Input
                          id="contact-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          autoComplete="off"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-company">Company</Label>
                      <Input id="contact-company" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-subject">I&apos;m interested in</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger id="contact-subject">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Talking to sales</SelectItem>
                          <SelectItem value="support">Customer support</SelectItem>
                          <SelectItem value="partnership">Partnerships</SelectItem>
                          <SelectItem value="other">Something else</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea id="contact-message" value={message} onValueChange={setMessage} placeholder="How can we help?" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={!canSubmit}>
                      Send message
                      <Send className="ml-2 size-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="space-y-4 pt-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Message sent</h3>
                  <p className="text-muted-foreground text-sm">Thanks {name}, we&apos;ll be in touch within a few hours.</p>
                </div>
                <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
