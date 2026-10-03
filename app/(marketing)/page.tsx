import { Bento01 } from '@/components/blocks/Bento01'
import { Contact01 } from '@/components/blocks/Contact01'
import { Cta01 } from '@/components/blocks/Cta01'
import { Faq01 } from '@/components/blocks/Faq01'
import { Features01 } from '@/components/blocks/Features01'
import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'
import { Hero01 } from '@/components/blocks/Hero01'
import { Logos01 } from '@/components/blocks/Logos01'
import { Pricing01 } from '@/components/blocks/Pricing01'
import { Testimonials01 } from '@/components/blocks/Testimonials01'

export const metadata = { title: 'The workspace your team will actually use' }

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header01 />
      <main id="main-content" tabIndex={-1} className="outline-none [&>section]:scroll-mt-20">
        <section id="top">
          <Hero01 />
        </section>
        <section id="logos">
          <Logos01 />
        </section>
        <section id="features">
          <Features01 />
        </section>
        <section id="bento">
          <Bento01 />
        </section>
        <section id="pricing">
          <Pricing01 />
        </section>
        <section id="customers">
          <Testimonials01 />
        </section>
        <section id="faq">
          <Faq01 />
        </section>
        <section id="contact">
          <Contact01 />
        </section>
        <section id="cta">
          <Cta01 />
        </section>
      </main>
      <Footer01 />
    </div>
  )
}