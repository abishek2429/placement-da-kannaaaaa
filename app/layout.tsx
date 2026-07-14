import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER ?? 'brittytino'
const REPO  = process.env.NEXT_PUBLIC_GITHUB_REPO  ?? 'placement-readiness'

export const metadata: Metadata = {
  title: {
    default: 'Placement Readiness Portal — 25MX',
    template: '%s | Placement Readiness',
  },
  description:
    'Public leaderboard and proof portal for the 25MX Placement Readiness programme. Track submissions, scores, and attendance across all students and teams.',
  metadataBase: new URL('https://placement-readiness.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Placement Readiness Portal',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased overflow-x-hidden relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <Navbar githubOwner={OWNER} githubRepo={REPO} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {children}
          </main>
          <footer className="mt-16 border-t border-slate-800/60 py-8 text-center text-xs text-slate-500 backdrop-blur-sm">
            <p className="font-medium text-slate-400">
              MCA Department, PSG College of Technology · 25MX Cohort
            </p>
          <p className="mt-1">
            Placement Rep: Tino Britty J ·{' '}
            <a
              href={`https://github.com/${OWNER}/${REPO}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-400 underline underline-offset-2"
            >
              GitHub Repository
            </a>
          </p>
          <p className="mt-2 text-slate-600">Scores refresh every 60 seconds · No login required</p>
        </footer>
        </div>
      </body>
    </html>
  )
}
