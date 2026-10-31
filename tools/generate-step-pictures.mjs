import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { smallActions } from '../lib/beginner-directions.ts';
const report = JSON.parse(
  fs.readFileSync('content/screenshots/coverage.json', 'utf8'),
);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c],
  );
function wrap(s, max = 75) {
  const words = String(s).split(/\s+/);
  const out = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > max && line) {
      out.push(line);
      line = word;
    } else line += (line ? ' ' : '') + word;
  }
  if (line) out.push(line);
  return out;
}
const text = (
  lines,
  x,
  y,
  { size = 22, color = '#18334e', mono = false } = {},
) =>
  lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * (size + 10)}" font-family="${mono ? 'monospace' : 'Arial, sans-serif'}" font-size="${size}" fill="${color}">${esc(line)}</text>`,
    )
    .join('');
const registry = [];
for (const step of report.steps) {
  const vendor = `${step.where ?? ''} ${step.title}`;
  const accent = /splunk/i.test(vendor)
    ? '#65a637'
    : /powershell|windows|azure|iis|sql/i.test(vendor)
      ? '#0078d4'
      : /linux|rhel|alma/i.test(vendor)
        ? '#ee0000'
        : '#52677e';
  const sentences = smallActions(step.actions);
  const titleLines = wrap(step.title, 68);
  const where = wrap(
    step.where || 'Use the computer and app named in the written step.',
    85,
  );
  let y = 95 + titleLines.length * 34;
  let body = `<rect x="28" y="${y}" width="1144" height="${75 + where.length * 24}" rx="10" fill="#ffffff" stroke="#18334e"/><path d="M54 ${y + 24}h42v29H54zm21 29v12m-15 0h30" fill="none" stroke="#18334e" stroke-width="3"/>${text(['START HERE'], 114, y + 30, { size: 17, color: '#18334e' })}${text(where, 114, y + 60, { size: 18 })}`;
  y += 100 + where.length * 24;
  if (step.command) {
    // Commands only, never fabricated successful terminal output. Full unwrapped text remains in the page.
    const preview = step.command
      .split('\n')
      .filter((x) => x.trim())
      .slice(0, 8)
      .flatMap((x) => wrap(x, 88));
    const height = 85 + preview.length * 27;
    body += `<rect x="28" y="${y}" width="1144" height="${height}" rx="10" fill="#f7f9fc" stroke="#cbd6e3"/><rect x="28" y="${y}" width="1144" height="40" rx="10" fill="#ffffff"/>${text(['TERMINAL · COMMAND EXAMPLE · NOT OUTPUT'], 52, y + 27, { size: 17, color: '#18334e' })}${text(preview, 54, y + 75, { size: 18, color: '#18334e', mono: true })}`;
    y += height + 24;
    body += text(
      [
        'Type the complete input in the written step below, then check your result.',
      ],
      44,
      y,
      { size: 19, color: '#53677e' },
    );
    y += 32;
  }
  // A numbered visual route, not invented product controls. Long source instructions remain selectable in the reader.
  const actions = sentences.slice(0, 3);
  for (let i = 0; i < actions.length; i++) {
    const lines = wrap(actions[i], 91);
    const h = 38 + lines.length * 29;
    if (i)
      body += `<path d="M60 ${y - 16}v15m-6-6 6 6 6-6" fill="none" stroke="#53677e" stroke-width="2"/>`;
    body += `<rect x="28" y="${y}" width="1144" height="${h}" rx="10" fill="#ffffff" stroke="#cbd6e3"/><circle cx="60" cy="${y + 30}" r="18" fill="#18334e"/>${text([String(i + 1)], 54, y + 37, { size: 20, color: '#fff' })}${text(lines, 96, y + 34, { size: 20 })}`;
    y += h + 22;
  }
  if (sentences.length > 3) {
    body += text(
      ['Continue with the remaining small actions in the written step.'],
      44,
      y,
      { size: 18, color: '#53677e' },
    );
    y += 38;
  }
  const expected = wrap(step.expected, 95);
  const checkH = 60 + expected.length * 28;
  body += `<rect x="28" y="${y}" width="1144" height="${checkH}" rx="10" fill="#ffffff" stroke="#18334e"/>${text(['LOOK FOR THIS IN YOUR OWN LAB'], 52, y + 30, { size: 17, color: '#18334e' })}${text(expected, 52, y + 62, { size: 19 })}`;
  y += checkH + 34;
  const height = y + 58;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(step.title)} — illustrated step map</title><desc id="desc">Step-specific diagram showing where to work, numbered actions, and what to check. It is not a software screenshot or actual output.</desc><rect width="1200" height="${height}" fill="#e7edf4"/><rect width="1200" height="7" fill="${accent}"/>${text([`STEP ${step.step} · PICTURE GUIDE`], 30, 43, { size: 17, color: '#18334e' })}${text(titleLines, 30, 86, { size: 26 })}${body}${text(['ILLUSTRATED STEP MAP · NOT A LIVE SCREENSHOT OR RESULT'], 30, height - 23, { size: 17, color: '#18334e' })}</svg>`;
  const fileHash = createHash('sha256').update(svg).digest('hex');
  const name = step.stepId.replaceAll(':', '--') + '--' + fileHash.slice(0, 10) + '.svg';
  fs.writeFileSync('public/step-pictures/' + name, svg);
  registry.push({
    stepId: step.stepId,
    instructionHash: step.instructionHash,
    src: '/step-pictures/' + name,
    title: step.title,
    kind: step.command ? 'command-map' : 'action-map',
    fileHash,
  });
}
fs.writeFileSync(
  'content/screenshots/step-pictures.json',
  JSON.stringify(
    {
      version: 1,
      kind: 'illustrated-step-maps',
      summary: { lessons: report.summary.lessons, steps: registry.length },
      pictures: registry,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Generated ${registry.length} individual step pictures across ${report.summary.lessons} classes.`,
);
