import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllData,
  buildStudentSummaries,
  buildTeamSummaries,
  buildActivityDays,
  getDaysRun,
  getLatestDay,
} from '@/lib/data'
import MissingSubmissionsAlert from '@/components/MissingSubmissionsAlert'
import LeaderboardTable from '@/components/LeaderboardTable'
import { AggregatedHeatmap } from '@/components/Heatmap'

export const metadata: Metadata = {
  title: 'Dashboard — Placement Readiness Portal',
  description: 'Daily submission tracking, leaderboard, and team standings for the 25MX Placement Readiness cohort.',
}

export const revalidate = 60

export default async function DashboardPage() {
  const { roster, scoreboard, attendance, teams } = await getAllData()
  const daysRun = getDaysRun(attendance)
  const latestDay = getLatestDay(attendance)
  const students = buildStudentSummaries(roster, scoreboard, attendance)
  const teamSummaries = buildTeamSummaries(teams, roster, scoreboard, attendance)
  const activityDays = buildActivityDays(roster, attendance)

  const totalStudents = Object.keys(roster).length
  const todaySubmissions = latestDay
    ? Object.values(attendance).filter(a => {
        const s = a[latestDay]
        return s === 'present' || s === 'manual-present'
      }).length
    : 0

  const overallAttendancePct =
    daysRun.length > 0 && totalStudents > 0
      ? Math.round(
          (activityDays.reduce((sum, d) => sum + d.submissionCount, 0) /
            (daysRun.length * totalStudents)) *
            100
        )
      : 0

  const topTeam = teamSummaries[0]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 text-xs text-brand-400 mb-3 font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Live Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Placement Readiness <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
            Programme 25MX
          </span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg max-w-2xl">
          Tracking daily submissions, cohort performance, and team standings. {daysRun.length} day{daysRun.length !== 1 ? 's' : ''} run so far.
        </p>
      </div>

      {/* ── Stat row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform">
          <div className="stat-label mb-2 opacity-80">Today&apos;s Submissions</div>
          <div className="stat-value text-3xl">
            {todaySubmissions}
            <span className="text-xl text-slate-500 font-normal">/{totalStudents}</span>
          </div>
          <div className="stat-sub mt-2 opacity-60">
            {latestDay ? `Day ${parseInt(latestDay.replace('day', ''), 10)}` : '—'}
          </div>
        </div>

        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform">
          <div className="stat-label mb-2 opacity-80">Overall Attendance</div>
          <div className={`stat-value text-3xl ${overallAttendancePct >= 80 ? 'text-brand-400' : overallAttendancePct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {overallAttendancePct}%
          </div>
          <div className="stat-sub mt-2 opacity-60">across {daysRun.length} sessions</div>
        </div>

        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform">
          <div className="stat-label mb-2 opacity-80">Top Score</div>
          <div className="stat-value text-3xl text-brand-300">{students[0]?.total ?? 0}</div>
          <div className="stat-sub mt-2 opacity-60">{students[0]?.name ?? '—'}</div>
        </div>

        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform">
          <div className="stat-label mb-2 opacity-80">Top Team</div>
          <div className="stat-value text-xl text-purple-300">{topTeam?.name ?? '—'}</div>
          <div className="stat-sub mt-2 opacity-60">{topTeam?.averageScore ?? 0} avg pts</div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Missing submissions — 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Today&apos;s Status</h2>
            {latestDay && (
              <Link
                href={`/activities/${latestDay}`}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                View day detail →
              </Link>
            )}
          </div>
          <MissingSubmissionsAlert
            roster={roster}
            attendance={attendance}
            latestDay={latestDay}
          />
        </div>

        {/* Team standings — 1/3 */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white">Team Standings</h2>
            <Link href="/teams" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
              All teams →
            </Link>
          </div>
          <div className="space-y-3">
            {teamSummaries.slice(0, 5).map((team, i) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <div className="card-hover flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 text-sm flex-shrink-0 border border-slate-700/50">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-400 font-semibold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{team.name}</div>
                    <div className="text-xs text-slate-400">Lab {team.lab}</div>
                  </div>
                  <div className="font-bold text-brand-300 tabular-nums text-lg">{team.averageScore}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contribution heatmap ────────────────────────────────────────────── */}
      <div className="card animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-white">Cohort Submission Heatmap</h2>
          <span className="text-xs font-medium text-slate-500">Colour = % submitted that day</span>
        </div>
        <AggregatedHeatmap
          attendance={attendance}
          daysRun={daysRun}
          totalStudents={totalStudents}
        />
      </div>

      {/* ── Top 5 leaderboard preview ────────────────────────────────────────── */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-white">Top 5 Students</h2>
          <Link href="/leaderboard" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Full leaderboard →
          </Link>
        </div>
        <LeaderboardTable students={students} limit={5} showAttendance />
      </div>
    </div>
  )
}
