import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })
const shareTech = Share_Tech_Mono({ subsets: ['latin'], weight: '400', variable: '--font-share-tech' })

export const metadata: Metadata = {
  title: 'STOIC.OS // RINAT',
  description: 'Personal growth system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${orbitron.variable} ${shareTech.variable}`}>
      <body className="min-h-screen">
        {/* Top nav */}
        <nav className="border-b border-cyan-500/20 bg-[#020c18]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="status-dot" />
              <span className="glow-text text-sm font-bold tracking-[0.2em]">STOIC.OS</span>
              <span className="text-[10px] text-cyan-500/50 tracking-widest hidden sm:block">// PERSONAL GROWTH SYSTEM</span>
            </div>
            <div className="flex gap-1">
              {[
                { href: '/', label: 'MISSION' },
                { href: '/calendar', label: 'TACTICAL' },
                { href: '/journal', label: 'INTEL' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-[10px] tracking-[0.15em] text-cyan-500/60 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/* Bottom scan line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Bottom status bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-cyan-500/10 bg-[#020c18]/60 backdrop-blur-sm px-6 py-1">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <span className="text-[9px] text-cyan-500/30 tracking-widest font-mono">SYS.ONLINE</span>
            <span className="text-[9px] text-cyan-500/30 tracking-widest font-mono">STOIC PROTOCOL v1.0</span>
            <span className="text-[9px] text-cyan-500/30 tracking-widest font-mono">SECURE</span>
          </div>
        </div>
      </body>
    </html>
  )
}
