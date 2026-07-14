import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getAllData,
  buildActivityDays,
} from '@/lib/data'

interface Props {
  params: Promise<{ date: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params
  const label = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return {
    title: `${label} Activity`,
    description: `Submission details for ${label} of the Placement Readiness programme.`,
  }
}

export const revalidate = 60

const DAY_THEMES: Record<string, { title: string; desc: string; tasks: string[] }> = {
  '2026-07-10': {
    title: 'Foundation Day: Claim Your Folder',
    desc: 'The goal of this day is purely operational — every student experiences the full Git loop once.',
    tasks: [
      'Fork the repo via GitHub UI',
      'Clone your fork locally',
      'Create students/25mxXXX/profile.md with your name, GitHub username, and one-line goal',
      'Commit → push → open PR to main',
    ],
  },
  '2026-07-11': {
    title: 'Solve First, Ask Smart',
    desc: 'Two-phase individual activity: solve without AI first, then with structured prompting.',
    tasks: [
      'Phase 1 (25 min, no AI): solve the coding problem, note where you got stuck',
      'Phase 2 (25 min, AI-assisted): use Claude with structured prompts to improve/complete your solution',
      'Submit README.md, reflection.md, and prompts.md',
    ],
  },
  '2026-07-12': {
    title: 'Debug Battle',
    desc: 'Team-based activity: debug a deliberately-broken codebase. Individual PRs still required.',
    tasks: [
      'Get the bug-file link from the placement rep',
      'Work as a team to find all 3–4 bugs',
      'Each member submits their own README.md, reflection.md, and prompts.md documenting their specific findings',
    ],
  },
  '2026-07-13': {
    title: 'Mini Build: Reverse-Engineer a Feature',
    desc: 'Team-based design thinking exercise — produce an architecture diagram and write-up.',
    tasks: [
      'Choose a familiar app feature (e.g. WhatsApp read-receipts)',
      'As a team, hypothesise how it works — produce architecture.png + write-up',
      'Note what you would ask Claude to verify your reasoning',
      'Each member submits their own README.md, reflection.md, prompts.md',
    ],
  },
  '2026-07-14': {
    title: 'Demo Day + Leaderboard Reveal',
    desc: 'Teams present their best work; final PRs merged live; weekly leaderboard revealed.',
    tasks: [
      'Prepare a 5-minute team demo of your best Day 3 or Day 4 output',
      'Submit final reflection.md and prompts.md for the week',
      'Watch the live leaderboard reveal on the website',
    ],
  },
}

export default async function ActivityDetailPage({ params }: Props) {
  const { date } = await params
  const { roster, attendance } = await getAllData()
  const activityDays = buildActivityDays(roster, attendance)

  const activityDay = activityDays.find(d => d.id === date)
  if (!activityDay) notFound()

  const theme = DAY_THEMES[date]
  const label = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        <Link href="/activities" className="hover:text-slate-300 transition-colors">Activities</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-300">{label}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-brand-600/15 border border-brand-500/25 rounded-lg text-brand-400 text-sm font-bold">
            {label}
          </span>
          <span className={`badge ${
            activityDay.submissionRate >= 80
              ? 'badge-green'
              : activityDay.submissionRate >= 50
              ? 'badge-yellow'
              : 'badge-red'
          }`}>
            {activityDay.submissionCount}/{activityDay.totalStudents} submitted
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {theme?.title ?? label}
        </h1>
        {theme?.desc && (
          <p className="text-slate-400 mt-2 max-w-2xl">{theme.desc}</p>
        )}
      </div>

      {/* Task list */}
      {theme?.tasks && (
        <div className="card">
          <h2 className="font-bold text-white mb-3 text-sm">Today&apos;s Tasks</h2>
          <ol className="space-y-2">
            {theme.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-bold mt-0.5">
                  {i + 1}
                </span>
                {task}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Submission status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Not submitted */}
        <div>
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-red-400">✗</span>
            Not Submitted
            <span className="badge-red ml-1">{activityDay.nonSubmitters.length}</span>
          </h2>
          {activityDay.nonSubmitters.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-brand-400 font-medium">🎉 Everyone submitted!</p>
            </div>
          ) : (
            <div className="card border-red-500/20 bg-red-500/5">
              <div className="flex flex-wrap gap-1.5">
                {activityDay.nonSubmitters.map(roll => (
                  <Link
                    key={roll}
                    href={`/students/${roll}`}
                    className="inline-flex flex-col items-start px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20
                               text-red-400 text-xs hover:bg-red-500/20 transition-colors group"
                  >
                    <span className="font-mono">{roll}</span>
                    <span className="text-red-600 group-hover:text-red-400 transition-colors">
                      {roster[roll]?.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submitted */}
        <div>
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-brand-400">✓</span>
            Submitted
            <span className="badge-green ml-1">{activityDay.submitters.length}</span>
          </h2>
          {activityDay.submitters.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            <div className="card border-brand-500/20 bg-brand-500/5">
              <div className="flex flex-wrap gap-1.5">
                {activityDay.submitters.map(roll => (
                  <Link
                    key={roll}
                    href={`/activities/${date}/${roll}`}
                    className="inline-flex flex-col items-start px-2 py-1.5 rounded bg-brand-500/10 border border-brand-500/20
                               text-brand-400 text-xs hover:bg-brand-500/20 transition-colors group"
                  >
                    <span className="font-mono">{roll}</span>
                    <span className="text-brand-600 group-hover:text-brand-400 transition-colors">
                      {roster[roll]?.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
