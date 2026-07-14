import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllData,
  buildActivityDays,
} from '@/lib/data'

export const metadata: Metadata = {
  title: 'Activities',
  description: 'Timeline of all Placement Readiness sessions with per-day submission rates.',
}

export const revalidate = 60

export default async function ActivitiesPage() {
  const { roster, attendance } = await getAllData()
  const activityDays = buildActivityDays(roster, attendance)

  const DAY_THEMES: Record<string, { title: string; desc: string }> = {
    '2026-07-10': { title: 'Foundation Day',          desc: 'Claim your folder — Git, forks, and first PRs.' },
    '2026-07-11': { title: 'Solve First, Ask Smart',  desc: 'No-AI phase → AI-assisted phase → structured reflection.' },
    '2026-07-12': { title: 'Debug Battle',            desc: 'Team-based: debug a planted-bug codebase together.' },
    '2026-07-13': { title: 'Mini Build',              desc: 'Reverse-engineer a feature, produce architecture diagram.' },
    '2026-07-14': { title: 'Demo Day',                desc: 'Team presentations, live leaderboard reveal, weekly report.' },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Activity <span className="text-gradient">Timeline</span>
        </h1>
        <p className="text-gray-400 mt-1">
          {activityDays.length} session{activityDays.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {activityDays.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No sessions have started yet. Check back after Day 1!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activityDays.map((day) => {
            const theme = DAY_THEMES[day.id]
            const pct = day.submissionRate
            const progressColor =
              pct >= 80 ? 'bg-brand-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'

            return (
              <Link key={day.id} href={`/activities/${day.id}`}>
                <div className="card-hover flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date badge */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center text-center backdrop-blur-sm shadow-inner shadow-brand-500/10">
                    <div>
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-purple-300 leading-none">
                        {new Date(day.id).getDate()}
                      </div>
                      <div className="text-[10px] font-bold text-brand-400 mt-1 uppercase tracking-widest">
                        {new Date(day.id).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">
                      {theme?.title ?? day.label}
                    </div>
                    {theme?.desc && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{theme.desc}</div>
                    )}

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="progress-bar w-full max-w-xs">
                        <div
                          className={`progress-fill ${progressColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="font-bold text-white tabular-nums text-lg">
                        {day.submissionCount}/{day.totalStudents}
                      </div>
                      <div className="text-xs text-gray-500">submitted</div>
                    </div>
                    <div className={`text-center ${pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      <div className="font-bold tabular-nums text-lg">{pct}%</div>
                      <div className="text-xs text-gray-500">rate</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
