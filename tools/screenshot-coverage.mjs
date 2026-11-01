import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import alma from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { lessons } from '../app/course.ts';
import { parseGuidedLab } from '../lib/guided-lab.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(
  await readFile(
    resolve(root, 'content/migration/migration-lessons.generated.json'),
    'utf8',
  ),
);
const references = JSON.parse(
  await readFile(
    resolve(root, 'content/migration/lab-screenshots.json'),
    'utf8',
  ),
);
const approved = JSON.parse(
  await readFile(resolve(root, 'content/screenshots/captures.json'), 'utf8'),
);
const approvedById = new Map(
  approved.map((capture) => [capture.stepId, capture]),
);
if (approvedById.size !== approved.length)
  throw new Error('Duplicate capture step ID');
const rows = [];
function add(lesson, steps, track, variant = 'guided') {
  steps.forEach((step, index) => {
    const actions = step.action ?? step.actions?.join('\n') ?? '';
    const command = step.command ?? '';
    const expected = step.expect ?? step.expected ?? '';
    const instructionHash = createHash('sha256')
      .update(JSON.stringify([step.title, actions, command, expected]))
      .digest('hex');
    const stepId = `${lesson.id}:${variant}:${index + 1}`;
    const expectedFilename = `${lesson.id}--${variant}-${String(index + 1).padStart(3, '0')}--${instructionHash.slice(0, 10)}.png`;
    const capture = approvedById.get(stepId);
    const referenceIds = step.screenshots ?? [];
    for (const id of referenceIds)
      if (!references.some((image) => image.id === id))
        throw new Error(`Unknown reference ${id} in ${stepId}`);
    const status = capture
      ? capture.instructionHash === instructionHash && capture.reviewed === true
        ? 'reviewed-capture'
        : 'needs-review'
      : referenceIds.length
        ? 'reference-only'
        : 'missing';
    rows.push({
      stepId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      track,
      variant,
      step: index + 1,
      title: step.title,
      where: step.where ?? lesson.where ?? '',
      actions,
      command,
      expected,
      instructionHash,
      expectedFilename,
      referenceIds,
      status,
    });
  });
}
for (const lesson of catalog.lessons) {
  const guide = parseGuidedLab(lesson.body);
  if (!guide) throw new Error(`Missing authored guide ${lesson.id}`);
  add(
    { ...lesson, where: guide.where },
    guide.steps,
    'Windows / AD / SQL / Azure / migrations',
  );
}
for (const lesson of lessons) {
  if (!lesson.walkthrough?.length)
    throw new Error(`Missing Linux walkthrough ${lesson.id}`);
  add(lesson, lesson.walkthrough, 'Linux / RHEL / Wazuh');
  for (const [index, help] of (lesson.helpSections ?? []).entries())
    add(lesson, help.steps, 'Linux / RHEL / Wazuh', `help-${index + 1}`);
  if (lesson.workplaceWalkthrough?.length)
    add(
      lesson,
      lesson.workplaceWalkthrough,
      'Linux / RHEL / Wazuh',
      'workplace',
    );
}
for (const lesson of alma.lessons)
  add(
    { ...lesson, where: lesson.guide.where },
    lesson.guide.steps,
    'AlmaLinux desktop',
  );
for (const capture of approved) {
  if (!rows.some((row) => row.stepId === capture.stepId))
    throw new Error(`Orphan capture ${capture.stepId}`);
  if (!/^\/lab-screenshots\/captures\/[a-z0-9-]+\.png$/.test(capture.src))
    throw new Error(`Invalid capture path ${capture.stepId}`);
  const bytes = await readFile(resolve(root, 'public', capture.src.slice(1)));
  if (
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error(`Capture is not PNG: ${capture.stepId}`);
  if (createHash('sha256').update(bytes).digest('hex') !== capture.fileHash)
    throw new Error(`Capture hash mismatch ${capture.stepId}`);
  if (!capture.provenance || !capture.reviewedAt || !capture.platform)
    throw new Error(`Capture provenance incomplete ${capture.stepId}`);
}
const summary = {
  lessons: new Set(rows.map((row) => row.lessonId)).size,
  steps: rows.length,
  reviewedCaptures: rows.filter((row) => row.status === 'reviewed-capture')
    .length,
  referenceOnly: rows.filter((row) => row.status === 'reference-only').length,
  missing: rows.filter((row) => row.status === 'missing').length,
  needsReview: rows.filter((row) => row.status === 'needs-review').length,
};
await mkdir(resolve(root, 'docs/screenshots'), { recursive: true });
await writeFile(
  resolve(root, 'content/screenshots/coverage.json'),
  JSON.stringify({ schemaVersion: 1, summary, steps: rows }, null, 2) + '\n',
);
const escape = (value) => '"' + String(value).replaceAll('"', '""') + '"';
await writeFile(
  resolve(root, 'content/screenshots/instruction-hashes.json'),
  JSON.stringify(
    Object.fromEntries(rows.map((row) => [row.stepId, row.instructionHash])),
    null,
    2,
  ) + '\n',
);
const columns = [
  'stepId',
  'lessonTitle',
  'track',
  'title',
  'where',
  'actions',
  'expected',
  'status',
  'expectedFilename',
];
await writeFile(
  resolve(root, 'docs/screenshots/capture-checklist.csv'),
  columns.join(',') +
    '\n' +
    rows
      .map((row) => columns.map((key) => escape(row[key])).join(','))
      .join('\n') +
    '\n',
);
console.log(JSON.stringify(summary, null, 2));
if (
  process.argv.includes('--require-complete') &&
  summary.reviewedCaptures !== summary.steps
) {
  console.error(
    'Screenshot coverage is incomplete. Reference images do not count as reviewed lab captures.',
  );
  process.exitCode = 1;
}
