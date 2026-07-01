'use client'

import { ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const steps = ['Profile', 'Workspace', 'Invite'] as const

export function OnboardingClient() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSize, setWorkspaceSize] = useState('1-5')
  const [invites, setInvites] = useState('')

  function next() {
    if (step < 2) setStep((step + 1) as 0 | 1 | 2)
    else router.push('/dashboard')
  }

  function back() {
    if (step > 0) setStep((step - 1) as 0 | 1 | 2)
  }

  function skip() {
    router.push('/dashboard')
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
        <ol className="mb-6 flex items-center gap-3 text-xs">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border text-[11px] font-medium',
                  i < step && 'bg-primary text-primary-foreground border-primary',
                  i === step && 'border-foreground text-foreground',
                  i > step && 'text-muted-foreground',
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={cn(i === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
              {i < steps.length - 1 && <ArrowRight className="text-muted-foreground size-3" />}
            </li>
          ))}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 0 && 'Tell us about you'}
              {step === 1 && 'Create your workspace'}
              {step === 2 && 'Invite your team'}
            </CardTitle>
            <CardDescription>
              {step === 0 && 'Helps us tailor the dashboard to your role.'}
              {step === 1 && 'Where all your work will live. You can rename it later.'}
              {step === 2 && 'Optional. You can invite more people anytime from Settings → Team.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="onb-name">Full name</Label>
                  <Input
                    id="onb-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ada Lovelace"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Your role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineer">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="pm">Product</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="onb-ws">Workspace name</Label>
                  <Input
                    id="onb-ws"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Acme Inc"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Team size</Label>
                  <Select value={workspaceSize} onValueChange={setWorkspaceSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1–5</SelectItem>
                      <SelectItem value="6-20">6–20</SelectItem>
                      <SelectItem value="21-100">21–100</SelectItem>
                      <SelectItem value="100+">100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="grid gap-2">
                <Label htmlFor="onb-invites">Emails (comma-separated)</Label>
                <Input
                  id="onb-invites"
                  value={invites}
                  onChange={(e) => setInvites(e.target.value)}
                  placeholder="alice@acme.com, bob@acme.com"
                />
                <p className="text-muted-foreground text-xs">We&apos;ll send each one an invite link.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={back}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={skip}>
              Skip setup
            </Button>
          )}
          <Button onClick={next}>{step === 2 ? 'Finish' : 'Continue'}</Button>
        </div>
      </main>
    </div>
  )
}