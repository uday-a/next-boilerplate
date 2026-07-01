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

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main className="[&>section]:scroll-mt-20">
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