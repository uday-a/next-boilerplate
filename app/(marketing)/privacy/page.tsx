import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'

export const metadata = { title: 'Privacy Policy · Acme' }

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: <time dateTime="2026-05-17">May 17, 2026</time>
          </p>

          <h2 className="mt-8 text-xl font-semibold">1. Data we collect</h2>
          <p className="text-muted-foreground">
            Replace this stub with your actual policy. Cover what you store, why, and how long.
          </p>

          <h2 className="mt-6 text-xl font-semibold">2. How we use data</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">3. Sub-processors</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">4. Your rights</h2>
          <p className="text-muted-foreground">Access, rectification, deletion, portability, objection.</p>

          <h2 className="mt-6 text-xl font-semibold">5. Contact</h2>
          <p className="text-muted-foreground">privacy@acme.dev</p>
        </article>
      </main>
      <Footer01 />
    </div>
  )
}