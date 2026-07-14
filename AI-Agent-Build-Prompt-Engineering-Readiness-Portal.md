# AI Agent Build Prompt — Engineering Readiness Portal

> Paste this entire document as your instruction to the coding agent (Claude Code or equivalent). It is written as a complete, self-contained spec so the agent does not need to ask clarifying questions about architecture, data flow, or scope.

---

## 1. What you are building

A public, read-only "engineering readiness" proof-and-leaderboard portal for a college department, used by ~70 students over multiple weeks. There is **no login, no signup, no database, and no backend server**. GitHub itself is the identity system, the version history, and the data store. The Next.js site is purely a rendering layer over JSON files that live in the same GitHub repository.

**Owner workflow (the placement representative):**
- Owns the main repository.
- Students fork it, work only inside their own folder, and open PRs.
- Owner reviews and merges PRs into `main`.
- A GitHub Action recalculates all scores/attendance/leaderboards from merged content and regenerates the README and JSON files, then triggers a Vercel redeploy.
- Nobody other than the owner ever pushes to `main` directly.

**Non-negotiable constraints:**
- Zero build errors, zero TypeScript errors, `next build` must succeed cleanly at every stage of development — do not leave TODOs that break the build.
- No authentication of any kind. Everything is public.
- No external database or paid service. Only: GitHub (repo + Actions), Vercel (hosting, free tier), and the GitHub REST API.
- Must comfortably scale to 70 students × many weeks of activities without the JSON files or build times becoming unmanageable (see §4 for how).
- Mobile-responsive — faculty will often check it from a phone.
- Fast: initial load should feel instant even with 70 student profiles.

---

## 2. Repository structure

Create exactly this structure:

```
placement-readiness/
├── README.md                      ← auto-generated leaderboard lives here (between markers)
├── HOW_TO_CONTRIBUTE.md           ← beginner-friendly Git/GitHub walkthrough (see §7)
├── scoreboard.json                ← source of truth for all scores
├── attendance.json                ← derived + manual attendance record
├── teams.json                     ← team roster + team-level rollups
├── students/
│   └── roster.json                ← master list: rollnumber → name, github username, team
├── activities/
│   ├── 2026-07-10/
│   │   ├── _template/
│   │   │   ├── README.md
│   │   │   ├── reflection.md
│   │   │   └── prompts.md
│   │   └── 25mx301/               ← one folder per student who submits, created via their PR
│   │       ├── README.md
│   │       ├── reflection.md
│   │       └── prompts.md
│   ├── 2026-07-11/ ...
│   └── ...
├── .github/
│   └── workflows/
│       ├── validate-pr.yml        ← runs on every PR into main
│       └── on-merge.yml           ← runs after merge to main
├── scripts/
│   ├── validate-submission.mjs    ← used by validate-pr.yml
│   ├── recalculate-scores.mjs     ← used by on-merge.yml
│   └── generate-readme.mjs        ← used by on-merge.yml
└── website/                       ← the Next.js app (can also be repo root — your call, document which)
    ├── app/
    ├── components/
    ├── lib/
    └── public/
```

Students never touch `.github/`, `scripts/`, `website/`, or any other student's folder. Their PRs should only ever contain files under `students/{rollnumber}/` (Day 1 profile) and `activities/dayXX/{rollnumber}/`.

---

## 3. Data schemas

### `students/roster.json`
```json
{
  "25mx301": {
    "name": "Full Name",
    "github": "githubusername",
    "team": "team1",
    "joinedAt": "2026-07-14"
  }
}
```

### `teams.json`
```json
{
  "team1": {
    "name": "Team 1",
    "lab": "A",
    "members": ["25mx301", "25mx302"],
    "averageScore": 0,
    "helpingBonus": 0
  }
}
```

### `scoreboard.json`
```json
{
  "25mx301": {
    "total": 0,
    "byDay": {
      "2026-07-10": { "submitted": 10, "quality": 0, "reflection": 0, "prompting": 0, "documentation": 0 },
      "2026-07-11": { "submitted": 10, "quality": 8, "reflection": 9, "prompting": 7, "documentation": 5 }
    },
    "manualAdjustments": {
      "reason": "network outage 2026-07-12, verbal approval given",
      "points": 10,
      "addedBy": "owner",
      "date": "2026-07-16"
    }
  }
}
```

### `attendance.json`
```json
{
  "25mx301": {
    "2026-07-10": "present",
    "2026-07-11": "present",
    "2026-07-12": "manual-present",
    "2026-07-13": "absent"
  }
}
```
Rule: `present` = at least one file merged into `activities/dayXX/{rollnumber}/` that day. `manual-present` = owner override. Anything else = `absent`. Never require manual roll call input for the default case.

---

## 4. Scaling strategy (important — read before building)

Do **not** make the Next.js app read the entire Git history or re-clone the repo on every request. Instead:

1. All computed state lives in the three flat JSON files above (`scoreboard.json`, `attendance.json`, `teams.json`) plus `students/roster.json`. These are small even at 70 students × 10 weeks (well under a few hundred KB).
2. The Next.js app fetches these JSON files via the GitHub raw content API (`https://raw.githubusercontent.com/{owner}/{repo}/main/scoreboard.json`) with Next.js `fetch(..., { next: { revalidate: 60 } })` — a 60-second cache is enough; this is not a real-time system.
3. Individual activity content (`reflection.md`, `prompts.md`) is fetched **on-demand**, only when a student's profile page or an activity detail page is opened — never bulk-fetched for the dashboard. Use the GitHub Contents API for these individual file reads.
4. Never do full-repo scans in a request handler. If you need a list of "who submitted today," that list must already exist as a field inside `attendance.json`, computed by the GitHub Action at merge time — not computed live by the website.
5. Use Next.js static generation for the shell and dynamic/ISR (`revalidate`) for the data-driven pieces, so the app stays fast even as history grows.

---

## 5. GitHub Actions

### `.github/workflows/validate-pr.yml`
Triggers on `pull_request` targeting `main`.
Must:
- Check that the PR's changed files are **only** inside an allowed path pattern: `students/{rollnumber}/**` or `activities/day*/{rollnumber}/**`, where `{rollnumber}` matches the PR author's mapped entry in `roster.json`. Reject (fail the check) if a PR touches any other path — this is what prevents 70 people from ever colliding on shared files.
- Run `scripts/validate-submission.mjs`, which checks:
  - Required files present for the activity type (`README.md`, `reflection.md`, and `prompts.md` where applicable).
  - `reflection.md` is non-empty and under a sane max length (avoid pasted essays that break formatting).
  - No binary files over e.g. 2MB (keep repo lightweight).
- Post the validation result as a PR check — green tick or clear failure message — so the owner can merge with confidence without manually inspecting structure every time.

### `.github/workflows/on-merge.yml`
Triggers on `push` to `main` (i.e., after the owner merges a PR).
Must:
1. Run `scripts/recalculate-scores.mjs`:
   - Recompute `attendance.json` from which `activities/dayXX/{rollnumber}/` folders exist as of this commit.
   - Recompute per-student `scoreboard.json` totals (leave `quality`/`reflection`/`prompting`/`documentation` sub-scores as whatever the owner last set manually or via a simple heuristic — see §6 — but always recompute `submitted` automatically and always re-sum `total` including `manualAdjustments`).
   - Recompute `teams.json` rollups (average score per team, attendance rate per team).
2. Run `scripts/generate-readme.mjs`:
   - Regenerate the leaderboard table inside `README.md` between two HTML comment markers, e.g. `<!-- LEADERBOARD:START -->` … `<!-- LEADERBOARD:END -->`, so the rest of the README (which can contain human-written project description) is never overwritten.
   - Include: top 10 individuals, top team, today's submission count vs total roster.
3. Commit these regenerated files back to `main` with a bot commit message like `chore: recalculate scores [skip ci]` — the `[skip ci]` (or equivalent guard) is essential to avoid an infinite Action loop triggering itself.
4. Call the Vercel Deploy Hook URL (stored as a repo secret `VERCEL_DEPLOY_HOOK`) via a simple `curl -X POST` step, so the live site refreshes.

Both workflows must be written so a `next build` failure anywhere in the *website* code never blocks these two Actions — they only touch the JSON/README layer, not the Next.js app itself.

---

## 6. Scoring heuristic (baseline, owner can always override)

Automatic component:
- `submitted` = 10 if the folder for that day exists for that student, else 0.

Semi-automatic components (agent should implement a lightweight heuristic, but must make it trivially overridable by the owner editing the JSON directly):
- `documentation` = 5 if `README.md` in the student's day folder is non-empty and includes at least the required section headers, else scaled down.
- `reflection` and `prompting` and `quality` default to a neutral middle value (e.g. 5/10) at merge time, and are expected to be adjusted by the owner afterward via a simple admin flow (see §8) — do not try to "grade" open-ended writing algorithmically; that is a judgment call for the owner, not the script.

Total per activity = sum of the five sub-scores (max 45), matching the Week 1 conducting guide.

---

## 7. `HOW_TO_CONTRIBUTE.md` (must be generated, written for complete beginners)

Write this file in the repo, in plain language, containing:
1. What forking means and why they're doing it (one paragraph, no jargon).
2. Exact command sequence, copy-pasteable, for:
   - Forking via the GitHub UI (screenshotted description in words, since we can't embed real screenshots — describe exactly where to click).
   - `git clone https://github.com/{their-username}/placement-readiness.git`
   - `cd placement-readiness`
   - Creating their day's files inside the correct folder.
   - `git add . && git commit -m "2026-07-11: 25mx301 submission"`
   - `git push origin main`
   - Opening a PR from their fork back to the owner's repo via the GitHub UI, with the exact button sequence described.
3. A short "if something goes wrong" section covering: merge conflicts, forgetting to fork before cloning, PR opened against the wrong branch, and "my push was rejected."
4. A line stating explicitly: **only edit files inside your own `students/{rollnumber}/` and `activities/dayXX/{rollnumber}/` folders — editing anything else will fail the automatic check.**

---

## 8. Next.js application

**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS. No external UI kit required — keep it lightweight.

**Pages/routes:**
- `/` — Dashboard home: today's submission count vs roster size, quick leaderboard top 5, team standings summary, a GitHub-style contribution heatmap aggregated across all students.
- `/leaderboard` — Full individual leaderboard, sortable by total score, with attendance % column.
- `/teams` — All 7 teams, average score, attendance rate, member count.
- `/teams/[teamId]` — Team detail: member list with individual scores, team heatmap.
- `/students/[rollnumber]` — Student profile: their scoreboard breakdown, per-day attendance, and links to view their `reflection.md` / `prompts.md` content (fetched on-demand from GitHub Contents API, rendered as markdown).
- `/activities` — Timeline of all days run so far, with per-day submission rate.
- `/activities/[day]` — Detail for one day: objective, who submitted, who didn't.
- `/how-to-contribute` — Renders `HOW_TO_CONTRIBUTE.md` directly on the site (not just in the repo) so students can read it without needing to know how to browse GitHub.

**Components to build:**
- `Heatmap` — GitHub-style contribution grid (green/grey squares per day per student, or aggregated).
- `LeaderboardTable` — sortable, responsive, collapses to cards on mobile.
- `TeamCard`, `StudentCard`.
- `MarkdownRenderer` — for rendering fetched `reflection.md`/`prompts.md` content safely (sanitize before rendering).

**Design guidance:** clean, minimal, high information density without clutter — this is a working tool faculty will glance at daily, not a marketing site. Favor clear typography and whitespace over decoration. Make the "who hasn't submitted today" view impossible to miss on the home page — that's the single most useful thing for the owner and faculty.

---

## 9. Manual override / admin flow (still no login)

Since there is no login system, the owner adjusts scores the same way students submit: by editing `scoreboard.json` (or `attendance.json`) directly on `main` (owner has direct push rights, this is the one exception to "everyone PRs") and letting `on-merge.yml` recompute totals and regenerate the README/site around that edit. Document this clearly in a short `OWNER_GUIDE.md` alongside `HOW_TO_CONTRIBUTE.md` so this isn't lost knowledge if the role changes hands next year.

---

## 10. Build order for the agent

Work in this order and confirm a clean `next build` after each phase before moving to the next:

1. Scaffold the repo structure from §2, with placeholder/sample JSON matching the schemas in §3 (a handful of fake students) so the site has something to render immediately.
2. Write `scripts/validate-submission.mjs` and `scripts/recalculate-scores.mjs` and `scripts/generate-readme.mjs`, test them locally against the sample data with plain `node scripts/xyz.mjs`.
3. Write the two GitHub Actions workflows, referencing the scripts above.
4. Scaffold the Next.js app: layout, Tailwind config, the `/` dashboard page first (highest value page), confirm build.
5. Build out `/leaderboard`, `/teams`, `/teams/[teamId]`.
6. Build `/students/[rollnumber]` including the on-demand markdown fetch from the GitHub Contents API.
7. Build `/activities` and `/activities/[day]`.
8. Build `/how-to-contribute` and generate the actual `HOW_TO_CONTRIBUTE.md` and `OWNER_GUIDE.md` content files.
9. Final pass: mobile responsiveness check, run `next build` one last time, confirm zero errors/warnings that would block deployment.
10. Output final instructions for the owner: how to set the `VERCEL_DEPLOY_HOOK` secret, how to connect the repo to Vercel, and how to do the very first PR merge test end-to-end.

---

## 11. Acceptance checklist (the agent should self-verify before declaring done)

- [ ] `next build` succeeds with zero errors and zero type errors
- [ ] No authentication anywhere in the codebase
- [ ] No database/ORM dependency anywhere in `package.json`
- [ ] `validate-pr.yml` correctly rejects a PR that touches a file outside the submitting student's own folders (test with a sample PR)
- [ ] `on-merge.yml` regenerates README leaderboard between markers without touching the rest of the README
- [ ] `on-merge.yml` includes a loop guard (`[skip ci]` or path filter) so it cannot re-trigger itself infinitely
- [ ] Dashboard home page clearly surfaces "who hasn't submitted today"
- [ ] Student profile page successfully renders a fetched `reflection.md` as formatted markdown
- [ ] Mobile viewport (375px) renders all pages without horizontal scroll or broken tables
- [ ] `HOW_TO_CONTRIBUTE.md` contains copy-pasteable commands, not just descriptions
