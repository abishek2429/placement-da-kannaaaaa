#!/usr/bin/env node
/**
 * validate-submission.mjs
 * 
 * Used by validate-pr.yml GitHub Action to check that a PR only touches
 * the submitting student's own folders and that required files are present.
 *
 * Usage:
 *   node scripts/validate-submission.mjs --changed-files="path1,path2" --author-roll="25mx301"
 *
 * Exit code 0 = valid, exit code 1 = invalid (failure message printed to stdout)
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Parse CLI args ──────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [k, ...v] = arg.replace(/^--/, '').split('=');
    return [k, v.join('=')];
  })
);

const changedFilesRaw = args['changed-files'] ?? '';
const authorRoll = (args['author-roll'] ?? '').toLowerCase().trim();

if (!authorRoll) {
  console.error('❌ --author-roll is required');
  process.exit(1);
}

if (!changedFilesRaw) {
  console.log('✅ No changed files — nothing to validate');
  process.exit(0);
}

const changedFiles = changedFilesRaw.split(',').map(f => f.trim()).filter(Boolean);

// ── Load roster ─────────────────────────────────────────────────────────────
let roster = {};
try {
  roster = JSON.parse(readFileSync(resolve(ROOT, 'students/roster.json'), 'utf8'));
} catch {
  console.error('❌ Could not read students/roster.json — is the repo structure intact?');
  process.exit(1);
}

if (!roster[authorRoll]) {
  console.error(`❌ Roll number "${authorRoll}" not found in students/roster.json`);
  process.exit(1);
}

// ── Allowed path patterns ────────────────────────────────────────────────────
const allowedPatterns = [
  new RegExp(`^students/${authorRoll}/`),
  new RegExp(`^activities/day\\d+/${authorRoll}/`),
];

const errors = [];
const MAX_BINARY_BYTES = 2 * 1024 * 1024; // 2 MB

// ── File path validation ─────────────────────────────────────────────────────
for (const file of changedFiles) {
  const normalised = file.replace(/\\/g, '/');
  const allowed = allowedPatterns.some(p => p.test(normalised));
  if (!allowed) {
    errors.push(`🚫 File outside allowed path: "${file}"\n   Allowed paths: students/${authorRoll}/ and activities/dayXX/${authorRoll}/`);
    continue;
  }

  // Binary / size check
  const absPath = resolve(ROOT, normalised);
  if (existsSync(absPath)) {
    const stat = statSync(absPath);
    if (stat.size > MAX_BINARY_BYTES) {
      errors.push(`🚫 File too large (${(stat.size / 1024 / 1024).toFixed(1)} MB > 2 MB limit): "${file}"`);
    }
  }
}

// ── Required-files check for activity submissions ────────────────────────────
// Detect which days are included in this PR
const dayPattern = /^activities\/(day\d+)\/[^/]+\//;
const daysInPR = new Set(
  changedFiles
    .map(f => f.replace(/\\/g, '/').match(dayPattern)?.[1])
    .filter(Boolean)
);

for (const day of daysInPR) {
  const folderBase = `activities/${day}/${authorRoll}`;
  const absBase = resolve(ROOT, folderBase);

  const required = ['README.md'];

  // 2026-07-10 is profile-only — no reflection/prompts required
  if (day !== '2026-07-10') {
    required.push('reflection.md', 'prompts.md');
  }

  for (const req of required) {
    const absReq = resolve(absBase, req);
    if (!existsSync(absReq)) {
      errors.push(`🚫 Missing required file: ${folderBase}/${req}`);
    } else {
      // Non-empty check for reflection.md
      if (req === 'reflection.md') {
        const content = readFileSync(absReq, 'utf8').trim();
        if (content.length < 50) {
          errors.push(`🚫 reflection.md is too short (${content.length} chars). Minimum 50 characters — write a real reflection.`);
        }
        if (content.length > 10000) {
          errors.push(`🚫 reflection.md is too long (${content.length} chars). Maximum 10,000 characters.`);
        }
      }
      // README section header check (Day 1+)
      if (req === 'README.md' && day === '2026-07-10') {
        const content = readFileSync(absReq, 'utf8');
        if (!content.includes('Roll Number') && !content.includes('roll number') && !content.includes('rollnumber')) {
          errors.push(`⚠️  Day 1 README.md should include your roll number. Please fill in the template fields.`);
        }
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.log(`\n❌ Validation FAILED for ${authorRoll} (${roster[authorRoll].name})\n`);
  errors.forEach(e => console.log(e));
  console.log(`\nFix the issues above and push again. Your PR will not be merged until this check passes.`);
  process.exit(1);
}

console.log(`\n✅ Validation PASSED for ${authorRoll} (${roster[authorRoll].name})`);
console.log(`   Files checked: ${changedFiles.length}`);
console.log(`   Days in PR: ${[...daysInPR].join(', ') || 'none (profile submission)'}`);
process.exit(0);
