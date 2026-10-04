import { Footer01 } from '@/components/blocks/Footer01'
import { Header01 } from '@/components/blocks/Header01'
import { publicMetadata } from '@/lib/seo'

export const metadata = publicMetadata('/privacy', 'Privacy Policy')

// Sample copy. Replace with your own before launch and have counsel review it.
const sections = [
  {
    heading: "Data we collect",
    body: "Account details (name, email, workspace), the content you create in projects, and usage data such as pages visited and features used.",
  },
  {
    heading: "How we use data",
    body: "To run and secure the service, send product and billing emails, and improve features. We never sell personal data.",
  },
  {
    heading: "Sub-processors",
    body: "We use a small set of vetted providers for hosting, payments, email delivery and error monitoring. The current list is available on request.",
  },
  {
    heading: "Your rights",
    body: "You can access, correct, export or delete your personal data at any time from your account settings, or by contacting us.",
  },
  {
    heading: "Contact",
    body: "Privacy questions or requests? Email privacy@uipkge.dev.",
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header01 />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-4 outline-none">
        <article className="space-y-4">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
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
