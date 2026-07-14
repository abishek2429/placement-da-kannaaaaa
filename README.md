# Placement Readiness Portal

**25MX Cohort — MCA Department, PSG College of Technology**  
*Placement Rep: Tino Britty J*

A fully transparent, GitHub-driven leaderboard and submission portal. No database, no logins. Everything is driven by PRs and Markdown files.  
> Students fork → work in their own folder → open PR → owner merges → leaderboard updates automatically.

📊 **Live Site:** [placement-readiness.vercel.app](https://placement-readiness.vercel.app)  
📖 **How to contribute:** [HOW_TO_CONTRIBUTE.md](./HOW_TO_CONTRIBUTE.md)  
👤 **Owner guide:** [OWNER_GUIDE.md](./OWNER_GUIDE.md)

---

## Leaderboard (auto-updated after every merge)

<!-- LEADERBOARD:START -->
| Rank | Student | Roll No | Score | Attendance |
|------|---------|---------|-------|-----------|
| 🥇 1 | Surya Narayanan | 25mx305 | 90 | 3/3 (100%) |
| 🥈 2 | Arun Selvam | 25mx301 | 88 | 3/3 (100%) |
| 🥉 3 | Kavitha Senthil | 25mx308 | 83 | 3/3 (100%) |
| 4 | Gowtham Sekar | 25mx313 | 82 | 3/3 (100%) |
| 5 | Meena Sundaram | 25mx310 | 77 | 3/3 (100%) |
| 6 | Karthik Rajan | 25mx303 | 75 | 3/3 (100%) |
| 7 | Priya Lakshmi | 25mx302 | 72 | 2/3 (67%) |
| 8 | Sangeetha Devi | 25mx312 | 71 | 2/3 (67%) |
| 9 | Bala Murugan | 25mx307 | 68 | 2/3 (67%) |
| 10 | Divya Prabhakaran | 25mx304 | 63 | 2/3 (67%) |

**🏆 Top Team:** Team 3 (avg: 72.5 pts)  
**Today's submissions:** 6/14 students submitted · **Last updated:** 2026-07-16
<!-- LEADERBOARD:END -->

---

## Repository structure

```
placement-readiness/
├── students/roster.json          ← master student list
├── scoreboard.json               ← all scores (source of truth)
├── attendance.json               ← per-day attendance
├── teams.json                    ← team roster + rollups
├── activities/2026-07-10..2026-07-14/      ← one folder per student per day
├── scripts/                      ← Node scripts run by GitHub Actions
├── .github/workflows/            ← validate-pr.yml, on-merge.yml
└── website/                      ← Next.js 14 app (deployed to Vercel)
```

---

## Quick links

- 🔴 **Students who haven't submitted today** — check the [live dashboard](https://placement-readiness.vercel.app)
- 📋 [Full Leaderboard](https://placement-readiness.vercel.app/leaderboard)
- 👥 [Team Standings](https://placement-readiness.vercel.app/teams)
- 📅 [Activity Timeline](https://placement-readiness.vercel.app/activities)
