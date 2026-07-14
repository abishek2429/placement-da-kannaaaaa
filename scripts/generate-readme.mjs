#!/usr/bin/env node
/**
 * generate-readme.mjs
 *
 * Regenerates the leaderboard table inside README.md between:
 *   <!-- LEADERBOARD:START -->
 *   <!-- LEADERBOARD:END -->
 *
 * Everything outside those markers is left untouched.
 *
 * Usage:
 *   node scripts/generate-readme.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readJSON(relPath) {
  const abs = resolve(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, 'utf8'));
}

// ── Load data ────────────────────────────────────────────────────────────────
const roster     = readJSON('students/roster.json');
const scoreboard = readJSON('scoreboard.json');
const attendance = readJSON('attendance.json');
const teams      = readJSON('teams.json');

if (!roster || !scoreboard || !attendance || !teams) {
  console.error('❌ Missing one or more JSON files. Run recalculate-scores.mjs first.');
  process.exit(1);
}

// ── Compute helpers ──────────────────────────────────────────────────────────
const totalRoster = Object.keys(roster).length;

// Today's date (UTC, formatted YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// Submissions today = students where any day's attendance entry has today's date
// Since attendance is stored as 2026-07-10/2026-07-11 etc., we track "most recent day that had submissions"
// Practical approach: count students who have at least one 'present' in attendance
const totalPresent = Object.values(attendance).filter(
  a => Object.values(a).some(v => v === 'present' || v === 'manual-present')
).length;

// Count how many days have been run
const allDays = new Set();
for (const studentAtt of Object.values(attendance)) {
  for (const [day, status] of Object.entries(studentAtt)) {
    if (status === 'present' || status === 'manual-present') allDays.add(day);
  }
}
const daysRun = allDays.size;

// Attendance rate per student (% of days present)
function attendancePct(roll) {
  if (daysRun === 0) return '0/0 (0%)';
  const att = attendance[roll] ?? {};
  const present = Object.values(att).filter(v => v === 'present' || v === 'manual-present').length;
  const pct = Math.round((present / daysRun) * 100);
  return `${present}/${daysRun} (${pct}%)`;
}

// Sort students by total score desc
const sorted = Object.entries(scoreboard)
  .filter(([roll]) => roster[roll])
  .sort(([, a], [, b]) => b.total - a.total);

// ── Build leaderboard table ───────────────────────────────────────────────────
const MEDAL = ['🥇', '🥈', '🥉'];

const rows = sorted.slice(0, 10).map(([roll, data], i) => {
  const name = roster[roll]?.name ?? roll;
  const medal = MEDAL[i] ?? '';
  const rank = medal ? `${medal} ${i + 1}` : `${i + 1}`;
  return `| ${rank} | ${name} | ${roll} | ${data.total} | ${attendancePct(roll)} |`;
});

// Top team
const topTeamEntry = Object.entries(teams)
  .sort(([, a], [, b]) => b.averageScore - a.averageScore)[0];
const topTeamLine = topTeamEntry
  ? `**🏆 Top Team:** ${topTeamEntry[1].name} (avg: ${topTeamEntry[1].averageScore} pts)`
  : '';

// Most recent submission count (last day that had any submissions)
const lastDay = [...allDays].sort().pop() ?? 'none';
const lastDaySubmissions = Object.values(attendance).filter(
  a => a[lastDay] === 'present' || a[lastDay] === 'manual-present'
).length;

const table = [
  `| Rank | Student | Roll No | Score | Attendance |`,
  `|------|---------|---------|-------|-----------|`,
  ...rows,
  ``,
  topTeamLine,
  `**Today's submissions:** ${lastDaySubmissions}/${totalRoster} students submitted on ${lastDay} · **Last updated:** ${today}`,
].join('\n');

// ── Inject into README.md ─────────────────────────────────────────────────────
const readmePath = resolve(ROOT, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

const START = '<!-- LEADERBOARD:START -->';
const END   = '<!-- LEADERBOARD:END -->';

const startIdx = readme.indexOf(START);
const endIdx   = readme.indexOf(END);

if (startIdx === -1 || endIdx === -1) {
  console.error('❌ README.md is missing <!-- LEADERBOARD:START --> and/or <!-- LEADERBOARD:END --> markers.');
  process.exit(1);
}

const before  = readme.slice(0, startIdx + START.length);
const after   = readme.slice(endIdx);
const newReadme = `${before}\n${table}\n${after}`;

writeFileSync(readmePath, newReadme, 'utf8');

console.log(`\n✅ README.md leaderboard updated.`);
console.log(`   Students ranked: ${Math.min(sorted.length, 10)} (of ${totalRoster} in roster)`);
console.log(`   Top student: ${roster[sorted[0]?.[0]]?.name ?? '—'} (${sorted[0]?.[1]?.total ?? 0} pts)`);
console.log(`   Days run: ${daysRun}`);
