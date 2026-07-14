// TypeScript types matching the JSON schemas defined in the project spec

export interface RosterEntry {
  name: string
  github: string
  team: string
  joinedAt: string
}

export type Roster = Record<string, RosterEntry>

// ── Scoreboard ───────────────────────────────────────────────────────────────

export interface DayScore {
  submitted: number      // 10 if folder exists, else 0
  quality: number        // 0–10, set by owner
  reflection: number     // 0–10, set by owner
  prompting: number      // 0–10, set by owner (0 for 2026-07-10)
  documentation: number  // 0–5, heuristic
}

export interface ManualAdjustment {
  reason: string
  points: number
  addedBy: string
  date: string
}

export interface StudentScore {
  total: number
  byDay: Record<string, DayScore>   // key = "2026-07-10", "2026-07-11", ...
  manualAdjustments: ManualAdjustment | null
}

export type Scoreboard = Record<string, StudentScore>

// ── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'manual-present'

export type StudentAttendance = Record<string, AttendanceStatus>  // key = "2026-07-10"

export type Attendance = Record<string, StudentAttendance>

// ── Teams ────────────────────────────────────────────────────────────────────

export interface Team {
  name: string
  lab: string
  members: string[]        // array of roll numbers
  averageScore: number
  attendanceRate: number   // 0–100
  helpingBonus: number
}

export type Teams = Record<string, Team>

// ── Derived / View types ─────────────────────────────────────────────────────

export interface StudentSummary {
  roll: string
  name: string
  github: string
  team: string
  total: number
  attendanceCount: number
  attendanceDays: number
  attendancePct: number
  hasSubmittedToday: boolean
}

export interface TeamSummary {
  id: string
  name: string
  lab: string
  memberCount: number
  averageScore: number
  attendanceRate: number
  helpingBonus: number
  members: StudentSummary[]
}

export interface ActivityDay {
  id: string           // "2026-07-10"
  label: string        // "Day 1"
  submissionCount: number
  totalStudents: number
  submissionRate: number
  submitters: string[] // roll numbers
  nonSubmitters: string[]
}
