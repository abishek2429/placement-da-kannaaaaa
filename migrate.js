const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// 1. Rename strings in files
const filesToReplace = [
  'next.config.mjs',
  '.env.local.example',
  'parse_data.ps1',
  'OWNER_GUIDE.md',
  'HOW_TO_CONTRIBUTE.md',
  'Week1-Schedule-and-Conducting-Guide.md',
  'AI-Agent-Build-Prompt-Engineering-Readiness-Portal.md',
  'README.md',
  'app/how-to-contribute/page.tsx',
];

for (const file of filesToReplace) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/engineering-readiness/g, 'placement-readiness');
    content = content.replace(/psgmx/g, 'brittytino');
    // Also replace day0X in documentation files if any
    content = content.replace(/day01/g, '2026-07-10');
    content = content.replace(/day02/g, '2026-07-11');
    content = content.replace(/day03/g, '2026-07-12');
    content = content.replace(/day04/g, '2026-07-13');
    content = content.replace(/day05/g, '2026-07-14');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 2. Migrate JSON files
const dateMap = {
  'day01': '2026-07-10',
  'day02': '2026-07-11',
  'day03': '2026-07-12',
  'day04': '2026-07-13',
  'day05': '2026-07-14',
};

const attPath = path.join(ROOT, 'attendance.json');
if (fs.existsSync(attPath)) {
  const content = fs.readFileSync(attPath, 'utf8').replace(/^\uFEFF/, '');
  const att = JSON.parse(content);
  const newAtt = {};
  for (const [roll, days] of Object.entries(att)) {
    newAtt[roll] = {};
    for (const [day, status] of Object.entries(days)) {
      newAtt[roll][dateMap[day] || day] = status;
    }
  }
  fs.writeFileSync(attPath, JSON.stringify(newAtt, null, 2), 'utf8');
}

const scorePath = path.join(ROOT, 'scoreboard.json');
if (fs.existsSync(scorePath)) {
  const content = fs.readFileSync(scorePath, 'utf8').replace(/^\uFEFF/, '');
  const score = JSON.parse(content);
  const newScore = {};
  for (const [roll, data] of Object.entries(score)) {
    newScore[roll] = { ...data, byDay: {} };
    for (const [day, val] of Object.entries(data.byDay || {})) {
      newScore[roll].byDay[dateMap[day] || day] = val;
    }
  }
  fs.writeFileSync(scorePath, JSON.stringify(newScore, null, 2), 'utf8');
}

// 3. Rename activities directories
const activitiesDir = path.join(ROOT, 'activities');
if (fs.existsSync(activitiesDir)) {
  for (const [oldDay, newDate] of Object.entries(dateMap)) {
    const oldPath = path.join(activitiesDir, oldDay);
    const newPath = path.join(activitiesDir, newDate);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }
}

// 4. Rename dynamic route folder
const oldRoute = path.join(ROOT, 'app/activities/[day]');
const newRoute = path.join(ROOT, 'app/activities/[date]');
if (fs.existsSync(oldRoute)) {
  fs.renameSync(oldRoute, newRoute);
}

// Also rename old templates if any exist inside day01, etc.
// Not strictly necessary since we renamed the parent folder, but we can fix scripts.
const scriptsToFix = [
  'scripts/recalculate-scores.mjs',
  'scripts/validate-submission.mjs',
  'scripts/generate-readme.mjs',
];
for (const file of scriptsToFix) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/day01/g, '2026-07-10');
    content = content.replace(/day02/g, '2026-07-11');
    content = content.replace(/day03/g, '2026-07-12');
    content = content.replace(/day04/g, '2026-07-13');
    content = content.replace(/day05/g, '2026-07-14');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Update lib/types.ts
const typesPath = path.join(ROOT, 'lib/types.ts');
if (fs.existsSync(typesPath)) {
  let content = fs.readFileSync(typesPath, 'utf8');
  content = content.replace(/day01/g, '2026-07-10');
  content = content.replace(/day02/g, '2026-07-11');
  fs.writeFileSync(typesPath, content, 'utf8');
}

console.log('Migration complete');
