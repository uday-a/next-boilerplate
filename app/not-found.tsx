import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-muted-foreground font-mono text-sm tracking-widest">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="text-muted-foreground mt-3 text-base">The page you were looking for doesn’t exist or was moved.</p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
