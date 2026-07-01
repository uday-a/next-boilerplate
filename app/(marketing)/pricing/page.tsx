import { Faq01 } from '@/components/blocks/Faq01'
import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'
import { PricingClient } from './pricing-client'

export const metadata = {
  title: 'Pricing · Acme',
  description: 'Simple, transparent pricing for teams of every size.',
}

export default function PricingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pricing</h1>
            <p className="text-muted-foreground mt-3 text-base">Start free. Upgrade when you outgrow it.</p>
          </header>
        </div>
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