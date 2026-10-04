import { Faq01 } from '@/components/blocks/Faq01'
import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'
import { publicMetadata } from '@/lib/seo'
import { PricingClient } from './pricing-client'

export const metadata = publicMetadata('/pricing', 'Pricing', 'Simple, transparent pricing for teams of every size.')

export default function PricingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header01 />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <section>
          <PricingClient />
        </section>
        <section>
          <Faq01 />
        </section>
      </main>
      <Footer01 />
    </div>
  )
}