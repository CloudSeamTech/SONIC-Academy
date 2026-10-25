import fs from 'node:fs';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const base = process.env.REVIEW_URL || 'http://localhost:3011';
const output = process.env.REVIEW_ARTIFACTS || '/tmp/sonic-readability';
const links = learningPathways.flatMap(pathwayLessons);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce',
  });
  const failures = [];
  let checked = 0;
  for (const lesson of links) {
    await p.goto(base + lesson.href, { waitUntil: 'networkidle' });
    await p.waitForFunction(
      () => !document.querySelector('.academy-readiness')?.disabled,
    );
    // lab-19 intentionally opens the shared troubleshooting scenario library.
    if (lesson.id !== 'lab-19')
      await p.locator('.lab-example-plan').first().waitFor();
    // Include optional explanations, not only the initially visible paragraphs.
    await p.locator('.reader-workspace details').evaluateAll((items) =>
      items.forEach((item) => {
        item.open = true;
      }),
    );
    const issues = await p.evaluate(() => {
      const rgba = (s) => {
        const v = s.match(/[\d.]+/g)?.map(Number);
        return v && v.length >= 3 ? v : null;
      };
      const luminance = (rgb) =>
        rgb
          .slice(0, 3)
          .map((x) => {
            x /= 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
      const rows = [];
      for (const element of document.querySelectorAll('.reader-workspace *')) {
        if (
          element.closest('svg,button:disabled,[hidden],dialog:not([open])') ||
          !element.getClientRects().length ||
          getComputedStyle(element).visibility !== 'visible' ||
          ![...element.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim(),
          )
        )
          continue;
        let parent = element,
          background;
        while (parent) {
          const value = rgba(getComputedStyle(parent).backgroundColor);
          if (value && (value[3] ?? 1) > 0.95) {
            background = value;
            break;
          }
          parent = parent.parentElement;
        }
        const style = getComputedStyle(element),
          foreground = rgba(style.color);
        if (!background || !foreground) continue;
        const a = luminance(foreground),
          b = luminance(background),
          ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const large =
          parseFloat(style.fontSize) >= 24 ||
          (parseFloat(style.fontSize) >= 18.66 &&
            Number(style.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5))
          rows.push({
            tag: element.tagName,
            className: element.className,
            text: element.textContent.trim().slice(0, 90),
            ratio: Number(ratio.toFixed(2)),
            foreground,
            background,
          });
      }
      return rows;
    });
    if (issues.length)
      failures.push({ lesson: lesson.id, href: lesson.href, issues });
    checked++;
    if (checked % 25 === 0)
      console.log(`Checked readable text ${checked}/${links.length}`);
  }
  fs.mkdirSync(output, { recursive: true });
  const report = {
    lessons: checked,
    check:
      'Rendered text against nearest opaque CSS background; original image content and disabled buttons excluded',
    failures,
    pass: !failures.length,
  };
  fs.writeFileSync(
    output + '/teaching-readability.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      lessons: checked,
      failingLessons: failures.length,
      pass: report.pass,
    }),
  );
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
