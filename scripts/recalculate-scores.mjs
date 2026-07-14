#!/usr/bin/env node
/**
 * recalculate-scores.mjs
 *
 * Recomputes attendance.json, scoreboard.json totals, and teams.json rollups
 * from the current state of the activities/ folder tree.
 *
 * Usage:
 *   node scripts/recalculate-scores.mjs
 *
 * Reads:
 *   - students/roster.json
 *   - scoreboard.json (existing sub-scores and manual adjustments preserved)
 *   - activities/ folder tree
 *
 * Writes:
 *   - attendance.json
 *   - scoreboard.json (totals recomputed; sub-scores preserved or defaulted)
 *   - teams.json (rollups recomputed)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJSON(relPath) {
  const abs = resolve(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, 'utf8'));
}

function writeJSON(relPath, data) {
  writeFileSync(
    resolve(ROOT, relPath),
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  );
  console.log(`  ✍  Wrote ${relPath}`);
}

function listDirs(absPath) {
  if (!existsSync(absPath)) return [];
  return readdirSync(absPath).filter(name => {
    const full = join(absPath, name);
    return statSync(full).isDirectory() && !name.startsWith('_') && !name.startsWith('.');
  });
}

// Check if a file is non-empty and has required section headers (documentation heuristic)
function documentationScore(readmePath) {
  if (!existsSync(readmePath)) return 0;
  const content = readFileSync(readmePath, 'utf8').trim();
  if (content.length < 20) return 0;
  // Check for at least one markdown heading
  const hasHeading = /^#+\s+\S/m.test(content);
  // Check for meaningful content (more than just the template blanks)
  const filledIn = content.replace(/<!--.*?-->/gs, '').trim().length > 80;
  if (hasHeading && filledIn) return 5;
  if (filledIn) return 3;
  return 1;
}

// ── Load data ────────────────────────────────────────────────────────────────

const roster = readJSON('students/roster.json');
if (!roster) { console.error('❌ students/roster.json not found'); process.exit(1); }

const existingScoreboard = readJSON('scoreboard.json') ?? {};
const existingTeams = readJSON('teams.json') ?? {};

// ── Discover which activities/ folders exist ─────────────────────────────────

const activitiesDir = resolve(ROOT, 'activities');
const days = listDirs(activitiesDir).sort(); // e.g. ['2026-07-10', '2026-07-11', ...]

// Map: day → Set of roll numbers who submitted
const submittedByDay = {};
for (const day of days) {
  const dayDir = join(activitiesDir, day);
  const submitters = listDirs(dayDir); // roll-number-named folders
  submittedByDay[day] = new Set(submitters.filter(r => roster[r]));
}

console.log('\n📊 Recalculating scores...\n');
console.log(`  Days found: ${days.join(', ')}`);

// ── Recompute attendance.json ─────────────────────────────────────────────────

const attendance = {};
for (const roll of Object.keys(roster)) {
  attendance[roll] = {};
  for (const day of days) {
    const existing = existingScoreboard[roll]?.byDay?.[day]; // check if manual-present override
    // If previously manual-present, preserve it
    const wasManual = readJSON('attendance.json')?.[roll]?.[day] === 'manual-present';
    if (wasManual) {
      attendance[roll][day] = 'manual-present';
    } else {
      attendance[roll][day] = submittedByDay[day]?.has(roll) ? 'present' : 'absent';
    }
  }
}

writeJSON('attendance.json', attendance);

// ── Recompute scoreboard.json ─────────────────────────────────────────────────

const scoreboard = {};

for (const roll of Object.keys(roster)) {
  const existing = existingScoreboard[roll] ?? {};
  const byDay = {};

  for (const day of days) {
    const prev = existing.byDay?.[day] ?? {};
    const submitted = (submittedByDay[day]?.has(roll) || attendance[roll][day] === 'manual-present') ? 10 : 0;

    // documentation: recompute heuristic, but never lower a manually-set value above heuristic
    const readmePath = join(activitiesDir, day, roll, 'README.md');
    const docHeuristic = submitted > 0 ? documentationScore(readmePath) : 0;
    const documentation = submitted > 0 ? Math.max(prev.documentation ?? 0, docHeuristic) : 0;

    // quality / reflection / prompting: default to 5 if newly submitted and not yet graded
    const quality     = submitted > 0 ? (prev.quality     ?? 5) : 0;
    const reflection  = submitted > 0 ? (prev.reflection  ?? 5) : 0;
    const prompting   = day === '2026-07-10' ? 0 : (submitted > 0 ? (prev.prompting ?? 5) : 0);

    byDay[day] = { submitted, quality, reflection, prompting, documentation };
  }

  // Sum totals
  let total = Object.values(byDay).reduce(
    (sum, d) => sum + d.submitted + d.quality + d.reflection + d.prompting + d.documentation,
    0
  );

  const manualAdjustments = existing.manualAdjustments ?? null;
  if (manualAdjustments?.points) {
    total += manualAdjustments.points;
  }

  scoreboard[roll] = { total, byDay, manualAdjustments };
}

writeJSON('scoreboard.json', scoreboard);

// ── Recompute teams.json rollups ──────────────────────────────────────────────

const teams = {};
for (const [teamId, teamData] of Object.entries(existingTeams)) {
  const members = teamData.members ?? [];
  const validMembers = members.filter(r => scoreboard[r] !== undefined);

  const scores = validMembers.map(r => scoreboard[r].total);
  const averageScore = validMembers.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / validMembers.length * 10) / 10
    : 0;

  // Attendance rate: fraction of (day × member) slots that are present/manual-present
  let presentCount = 0;
  let totalSlots = 0;
  for (const roll of validMembers) {
    for (const day of days) {
      totalSlots++;
      if (attendance[roll]?.[day] === 'present' || attendance[roll]?.[day] === 'manual-present') {
        presentCount++;
      }
    }
  }
  const attendanceRate = totalSlots > 0 ? Math.round(presentCount / totalSlots * 1000) / 10 : 0;

  teams[teamId] = {
    name: teamData.name,
    lab: teamData.lab,
    members: teamData.members,
    averageScore,
    attendanceRate,
    helpingBonus: teamData.helpingBonus ?? 0,
  };
}

writeJSON('teams.json', teams);

// ── Summary ───────────────────────────────────────────────────────────────────
const sorted = Object.entries(scoreboard).sort(([, a], [, b]) => b.total - a.total);
console.log('\n🏆 Top 5 students:');
sorted.slice(0, 5).forEach(([roll, data], i) => {
  console.log(`  ${i + 1}. ${roster[roll]?.name ?? roll} (${roll}) — ${data.total} pts`);
});

const topTeam = Object.entries(teams).sort(([, a], [, b]) => b.averageScore - a.averageScore)[0];
if (topTeam) {
  console.log(`\n🏅 Top team: ${topTeam[1].name} (avg ${topTeam[1].averageScore} pts)`);
}

console.log('\n✅ recalculate-scores.mjs complete.\n');
