# Week 1 — Placement Readiness Portal Launch
### Conducting Guide for the Placement Representative

**Cohort:** 25MX (≤70 students)
**Time slot:** 3:30 PM – 5:30 PM daily
**Venue:** Lab A + Lab B (≈35 students each)
**Teams:** 7 teams × 10 students
**Repo model:** Fork → work in own folder → PR to main → you review & merge → GitHub Action recalculates everything

---

## 0. Before Day 1 — One-time setup (do this yourself, 1–2 hours)

1. Create the main repo (e.g. `placement-readiness`) — public.
2. Build it using the **AI Agent Build Prompt** (separate file) so the site, JSON schemas, and GitHub Actions already exist.
3. Add a `students/roster.json` with all 70 roll numbers pre-listed (empty scores). This means Day 1 for students is just *claiming* their folder, not creating the whole structure from scratch.
4. Assign each student to one of 7 teams in `teams.json`. Suggested split for even helping-load:
   - **Lab A:** Teams 1, 2, 3, 4 (≈40 students)
   - **Lab B:** Teams 5, 6, 7 (≈30 students)
5. Print/share one single link: the repo URL + a pinned `HOW_TO_CONTRIBUTE.md`.
6. Decide your PR-merge routine: merge in two batches — once at ~4:50 PM (mid-check) and once at ~5:25 PM (final), so the leaderboard updates live before students leave.

---

## Daily Format (same shell every day, 2 hours)

| Time | Block |
|---|---|
| 3:30–3:40 | Briefing — today's activity, objective, what "done" looks like |
| 3:40–3:50 | Seating by team, laptops open, repo/fork check |
| 3:50–4:45 | Work block (solve → document → commit) |
| 4:45–5:05 | PR submission window — students open PRs, you start merging |
| 5:05–5:20 | Live leaderboard shown on projector, shout-outs |
| 5:20–5:30 | Preview tomorrow, close labs |

Keep this shell identical every day — the only thing that changes is the activity. Predictability is what lets 70 students self-serve without you re-explaining logistics daily.

---

## Day 1 (Monday) — Foundation Day: "Claim Your Folder"

**Objective:** Every student successfully forks, clones, commits, pushes, and gets ONE PR merged. No coding content yet — this day exists purely to remove Git friction for the rest of the week.

**Task for students:**
1. Fork the repo.
2. Create `students/25mx301/profile.md` (their own roll number folder) with: name, GitHub username, one-line goal for the week.
3. Commit → push → open PR to main.

**Conducting steps:**
- 3:30 – Show the fork button live on projector. Walk through it once, slowly, end-to-end for one student.
- 3:40 – Split into labs, teams sit together so confident students help nearby teammates before you.
- Circulate and fix Git errors in person — most will be: wrong remote, forgot to fork before clone, PR to wrong branch.
- 4:45 – Start merging. Do this on the projector so everyone sees their PR go green and their name appear in `README.md`'s roster table.
- Anyone who genuinely cannot get PR merged today: note manually in `scoreboard.json` under `manualAdjustments`, don't let them lose the day.

**Why this day matters:** it converts "70 unpredictable Git skill levels" into "70 students who've done it once." Everything after Day 1 is just repeating this same loop with real content.

---

## Day 2 (Tuesday) — Solve First, Ask Smart (individual)

Reuses your existing "Solve First, Ask Smart" format — this is the one you already know works.

**Task:**
1. Phase 1 (no AI, 25 min): solve a short coding problem individually, write down where they got stuck.
2. Phase 2 (AI-assisted, 25 min): use Claude with the structured prompting protocol to improve/complete it.
3. Submit `activities/2026-07-11/25mx301/README.md`, `reflection.md`, `prompts.md`.

**Reflection template fields:** Problem · My Initial Thinking · Where I Got Stuck · Claude Prompts Used · What AI Taught Me · What I'd Do Differently.

**Conducting steps:**
- Enforce the no-AI phase strictly (laptops on airplane mode or Claude tab closed) — this is what makes the reflection honest.
- Walk labs during Phase 2, look for copy-paste-without-understanding; ask 1 verbal question per student ("why did you use that prompt?").

---

## Day 3 (Wednesday) — Debug Battle (team-based)

**Objective:** introduce team scoring and peer-helping.

**Task:** Give each team the same deliberately-broken small codebase (a script with 3–4 planted bugs). Team works together, each member still submits their own PR documenting which bug(s) they found/fixed and how.

**Conducting steps:**
- One shared bug-file per team, distributed as a GitHub Gist link or in `activities/2026-07-12/starter/`.
- Team members can split bugs but must each write their own `reflection.md` — this keeps individual accountability inside a team activity.
- Track "Helping Others" bonus points manually for students who visibly helped teammates (you or team volunteers report these at 5:05).

---

## Day 4 (Thursday) — Mini Build (team-based)

**Objective:** a small end-to-end build, e.g. "reverse-engineer one feature of a familiar app" (WhatsApp read-receipts, Swiggy cart, etc.) — pick one, same for all teams so it's comparable.

**Task:** Each team produces one `architecture.png`/diagram + short write-up of how they think the feature works, plus what they'd ask an AI to verify their reasoning. Individual submission still required (own folder, own PR) even though the discussion is team-based.

**Conducting steps:**
- This is the most open-ended day — expect more questions. Budget extra facilitation time in the 3:50–4:45 block.
- Encourage diagrams over paragraphs; this is what faculty will find most impressive to skim.

---

## Day 5 (Friday) — Demo Day + Leaderboard Reveal

**Objective:** close the week with visibility and recognition — this is the day faculty should ideally sit in on.

**Structure:**
- 3:30–3:45: Brief recap of the week.
- 3:45–4:45: Each of the 7 teams gets ~5 minutes to demo their best Day 3/4 output on the projector.
- 4:45–5:05: Final PRs merged live.
- 5:05–5:25: **Live leaderboard reveal** on the website (not README) — top 3 individuals, top team, "Most Helpful," "Best Reflection," "Best Documentation" awards (these can be manual picks you add to `scoreboard.json`).
- 5:25–5:30: Auto-generated Weekly Report is shown (attendance %, most active student, participation rate) — this is the artifact you forward to faculty.

---

## Team Structure (7 teams, ~10 each)

Keep teams stable for the whole week — don't reshuffle. Stability is what makes the Day 3/4 team scores meaningful and lets the "Helping Others" dynamic develop naturally.

| Team | Lab | Suggested size |
|---|---|---|
| Team 1 | A | 10 |
| Team 2 | A | 10 |
| Team 3 | A | 10 |
| Team 4 | A | 10 |
| Team 5 | B | 10 |
| Team 6 | B | 10 |
| Team 7 | B | 10 |

Adjust the last team's count to absorb your actual headcount (60–70).

---

## Scoring Formula (per activity, max 45 points/day)

| Component | Points |
|---|---|
| Submitted on time (PR merged) | 10 |
| Solution / PR quality | 10 |
| Reflection quality | 10 |
| Prompting quality (AI usage shown) | 10 |
| Documentation clarity | 5 |

**Team bonus (Days 3–4 only):** average of team members' daily scores + up to 10 bonus points for "Helping Others," added manually by you in `scoreboard.json → manualAdjustments`.

**Attendance rule:** `Merged PR that day = Present`. No manual roll call needed. Manual override exists only for genuine network/laptop failures — log these transparently so the record stays trustworthy as *proof*, not just a nice number.

**Weekly total:** out of 225 (5 days × 45), displayed as a percentage on the dashboard so it's comparable across weeks if you continue this beyond week 1.

---

## Your Daily Checklist (as repo owner)

- [ ] Before session: confirm yesterday's GitHub Action ran and `README.md` leaderboard is current
- [ ] During session: review incoming PRs, merge in two batches (4:50 / 5:25)
- [ ] After session: check Action re-ran, scoreboard/attendance JSON updated, Vercel redeployed
- [ ] End of day: skim 2–3 reflections for quality signal, note anything for tomorrow's briefing
- [ ] Friday only: forward the auto-generated weekly report link to faculty

---

## Common Failure Points to Watch For

- Students editing `main` directly instead of their fork → PR will show unrelated diffs. Catch this in Day 1.
- Two students editing the same shared file → merge conflicts. Solution: every student only ever touches files inside their own `students/{rollnumber}/` and `activities/dayXX/{rollnumber}/` folders — never a shared file directly.
- Network drops mid-lab → keep the manual override field in `scoreboard.json` for exactly this.
- Students who "solve" using AI before the no-AI phase on Day 2 → spot-check with a quick verbal question, don't try to police this technically.
