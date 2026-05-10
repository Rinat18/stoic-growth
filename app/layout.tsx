import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stoic Growth',
  description: 'Личный трекер стоицизма',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={geist.className}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="font-semibold text-green-400 tracking-tight">Stoic Growth</span>
            <div className="flex gap-6 text-sm text-zinc-400">
              <Link href="/" className="hover:text-zinc-100 transition-colors">Dashboard</Link>
              <Link href="/calendar" className="hover:text-zinc-100 transition-colors">Календарь</Link>
              <Link href="/journal" className="hover:text-zinc-100 transition-colors">Журнал</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
