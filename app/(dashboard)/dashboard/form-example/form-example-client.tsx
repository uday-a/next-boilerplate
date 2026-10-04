'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  bio: z.string().max(280, 'Bio must be 280 characters or fewer'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function FormExampleClient() {
  const t = useTranslations()
  const [submitted, setSubmitted] = useState<ProfileForm | null>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', bio: '' },
  })

  function onSubmit(values: ProfileForm) {
    setSubmitted(values)
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.formExample')}
          description="A profile form that checks every field before it saves."
        />
      </PageHeader>
      <PageBody className="max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Validates on submit. Edit and click Save.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} aria-invalid={!!form.formState.errors.name} />
                      </FormControl>
                      <FormDescription>Shown to other workspace members.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} aria-invalid={!!form.formState.errors.email} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          value={field.value}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          aria-invalid={!!form.formState.errors.bio}
                        />
                      </FormControl>
                      <FormDescription>280 characters max.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved profile</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{submitted.name}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{submitted.email}</dd>
                <dt className="text-muted-foreground">Bio</dt>
                <dd>{submitted.bio || '—'}</dd>
              </dl>
            </CardContent>
          </Card>
        ) : null}
      </PageBody>
    </Page>
  )
}