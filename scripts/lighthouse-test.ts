import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const result = await lighthouse('http://localhost:3000', {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
  });

  if (!result?.lhr) { await chrome.kill(); return; }

  const scores = {
    performance:     Math.round((result.lhr.categories.performance.score ?? 0) * 100),
    accessibility:   Math.round((result.lhr.categories.accessibility.score ?? 0) * 100),
    seo:             Math.round((result.lhr.categories.seo.score ?? 0) * 100),
    bestPractices:   Math.round((result.lhr.categories['best-practices'].score ?? 0) * 100),
  };

  console.log('\n=== LIGHTHOUSE SCORES ===');
  for (const [cat, score] of Object.entries(scores)) {
    const status = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
    console.log(`${status} ${cat}: ${score}/100`);
  }

  const audits = result.lhr.audits;
  const failures = Object.entries(audits)
    .filter(([, a]) => a.score !== null && a.score < 0.9 && a.details)
    .map(([id, a]) => `  ❌ ${id}: ${a.title} — ${a.displayValue ?? ''}`)
    .slice(0, 20);

  if (failures.length) {
    console.log('\n=== TOP ISSUES TO FIX ===');
    failures.forEach(f => console.log(f));
  }

  fs.writeFileSync('lighthouse-report.json', JSON.stringify(result.lhr, null, 2));
  console.log('\nFull report saved to lighthouse-report.json');
  await chrome.kill();
}

runLighthouse();