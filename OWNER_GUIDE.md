# Owner Guide — Placement Readiness Portal

> This file is for whoever holds the role of placement representative and owns the `brittytino/placement-readiness` repository. Keep it updated as the role changes hands.

---

## Your daily workflow

### During a session (3:30–5:30 PM)

| Time | What to do |
|------|-----------|
| 3:30 | Show the fork button live on projector for Day 1 |
| 4:50 | First merge batch — review open PRs, merge any that have a green validation tick |
| 5:25 | Second merge batch — final PRs |
| 5:30 | Confirm the GitHub Action ran (check Actions tab) and the leaderboard updated |

### After a session

1. Check `https://github.com/brittytino/placement-readiness/actions` — the `on-merge.yml` Action should show a green run.
2. Open the live site — verify the dashboard shows today's submission count.
3. Skim 2–3 reflections for quality signal.

---

## How the automated system works

1. A student forks, creates files in their folder, and opens a PR.
2. `validate-pr.yml` runs automatically — checks file paths, required files, reflection length.
3. You see a green tick (or red X) on the PR.
4. You merge the PR.
5. `on-merge.yml` runs automatically — recalculates scores, attendance, team rollups, regenerates the README leaderboard, commits everything back with `[skip ci]`, and pings your Vercel deploy hook.
6. The live site refreshes within ~60 seconds.

You never need to run scripts manually. The system is fully automated once set up.

---

## How to adjust scores

Since there is no login system, you edit the JSON directly and push to `main`. The system then recomputes everything.

### Adjust a sub-score (quality, reflection, prompting)

Edit `scoreboard.json` and change the value for that student/day:

```json
"25mx301": {
  "byDay": {
    "2026-07-11": {
      "submitted": 10,
      "quality": 9,
      "reflection": 8,
      "prompting": 7,
      "documentation": 5
    }
  }
}
```

Push to `main`:
```bash
git add scoreboard.json
git commit -m "chore: grade 2026-07-11 reflections [skip ci]"
git push origin main
```

> **Note:** You must include `[skip ci]` in your commit message to avoid triggering the Action unnecessarily. The Action will still recompute totals the next time it runs from a real PR merge.

### Add a manual adjustment (e.g. network outage)

Edit the `manualAdjustments` field for that student:

```json
"25mx305": {
  "manualAdjustments": {
    "reason": "Laptop failure during Day 3 — verbal submission approved",
    "points": 30,
    "addedBy": "owner",
    "date": "2026-07-16"
  }
}
```

These points are automatically added to the total by `recalculate-scores.mjs`.

### Mark manual attendance

Edit `attendance.json`:

```json
"25mx305": {
  "2026-07-12": "manual-present"
}
```

The site shows this as a yellow heatmap cell (distinct from green = automatic present) so the record stays auditable.

---

## First-time setup

### 1. Create the repo
- Go to github.com → New repository
- Name: `placement-readiness`
- Visibility: **Public**
- Don't add a README (we already have one)

### 2. Push this code
```bash
cd d:\p\placement-readiness
git init
git add .
git commit -m "feat: initial repo setup"
git remote add origin https://github.com/brittytino/placement-readiness.git
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `brittytino/placement-readiness` from GitHub
3. Leave the **Root Directory** empty (default).
4. Vercel will auto-detect Next.js at the root and configure the build automatically.
5. Add environment variables:
   - `NEXT_PUBLIC_GITHUB_OWNER` = `brittytino`
   - `NEXT_PUBLIC_GITHUB_REPO` = `placement-readiness`
6. Deploy
7. Copy the **Deploy Hook URL** from Settings → Git → Deploy Hooks

### 4. Add the Vercel Deploy Hook as a GitHub Secret
1. Go to your repo → Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `VERCEL_DEPLOY_HOOK`
   - Value: the URL you copied in step 7 above

### 5. Test the end-to-end flow
1. Create a test fork under a different GitHub account
2. Add a file to `activities/2026-07-10/25mx301/README.md` in the fork
3. Open a PR back to `brittytino/placement-readiness`
4. Confirm the validate-pr Action runs and shows a green tick
5. Merge the PR
6. Confirm the on-merge Action runs, updates `attendance.json` and `scoreboard.json`, and the site redeployed

---

## Updating the roster

When students join:

1. Add them to `students/roster.json`:
```json
"25mx371": {
  "name": "New Student",
  "github": "githubusername",
  "team": "team1",
  "joinedAt": "2026-07-20"
}
```

2. Add them to the appropriate team in `teams.json`:
```json
"team1": {
  "members": ["25mx301", "25mx302", "25mx371"]
}
```

3. Add an empty attendance record to `attendance.json`:
```json
"25mx371": {}
```

4. Push with `[skip ci]`:
```bash
git add students/roster.json teams.json attendance.json
git commit -m "chore: add 25mx371 to roster [skip ci]"
git push origin main
```

---

## Handing over the role

1. Transfer repo ownership in GitHub Settings → Danger Zone → Transfer (or add the new person as admin)
2. Hand over:
   - GitHub account credentials (or add new person as admin and remove yourself)
   - Vercel project access
   - The `VERCEL_DEPLOY_HOOK` URL
3. Walk them through one full PR merge end-to-end to verify the system still works

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Action re-triggered infinitely | Check that your commits include `[skip ci]` |
| Site not refreshing after merge | Check Actions tab for errors; check that `VERCEL_DEPLOY_HOOK` secret is set correctly |
| Score totals wrong | Run `node scripts/recalculate-scores.mjs` locally and inspect the output |
| README not updating | Check that `<!-- LEADERBOARD:START -->` and `<!-- LEADERBOARD:END -->` markers are intact in README.md |
| Student can't open PR | Their fork's remote URL probably points to the wrong repo |
| validate-pr failing unexpectedly | Check which files the PR is touching (should only be student's own folders) |
