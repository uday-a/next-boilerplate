import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'

export const metadata = { title: 'Terms of Service · Acme' }

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: <time dateTime="2026-05-17">May 17, 2026</time>
          </p>

          <h2 className="mt-8 text-xl font-semibold">1. Agreement</h2>
          <p className="text-muted-foreground">
            Replace this stub with your actual terms before launch. Consider consulting counsel.
          </p>

          <h2 className="mt-6 text-xl font-semibold">2. Use of the Service</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">3. Accounts</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">4. Billing</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">5. Termination</h2>
          <p className="text-muted-foreground">…</p>

          <h2 className="mt-6 text-xl font-semibold">6. Contact</h2>
          <p className="text-muted-foreground">support@acme.dev</p>
        </article>
      </main>
      <Footer01 />
    </div>
  )
}