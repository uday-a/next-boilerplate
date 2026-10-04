import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'
import { publicMetadata } from '@/lib/seo'

export const metadata = publicMetadata('/terms', 'Terms of Service')

// Sample copy. Replace with your own before launch and have counsel review it.
const sections = [
  {
    heading: "Agreement",
    body: "By creating an account or using UIPKGE, you agree to these terms on behalf of yourself and the organization you represent.",
  },
  {
    heading: "Use of the service",
    body: "Use the service only for lawful purposes. Do not attempt to disrupt it, access other customers' data, or resell access without a written agreement.",
  },
  {
    heading: "Accounts",
    body: "You are responsible for the people you invite to your workspace and for keeping sign-in methods secure. Tell us promptly about any unauthorized access.",
  },
  {
    heading: "Billing",
    body: "Paid plans renew automatically each month or year until canceled. Seat changes are prorated on your next invoice. Fees are non-refundable except where required by law.",
  },
  {
    heading: "Termination",
    body: "You can cancel at any time from Settings \u2192 Billing. We may suspend accounts that break these terms. After cancellation you can export your data for 30 days.",
  },
  {
    heading: "Contact",
    body: "Questions about these terms? Email legal@uipkge.dev.",
  },
]

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-4 outline-none">
        <article className="space-y-4">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground text-sm">
              Last updated: <time dateTime="2026-05-17">May 17, 2026</time>
            </p>
          </header>
          {sections.map((section, i) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {i + 1}. {section.heading}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer01 />
    </div>
  )
}
