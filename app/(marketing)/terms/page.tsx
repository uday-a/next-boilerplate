import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header01 />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 py-16 outline-none">
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