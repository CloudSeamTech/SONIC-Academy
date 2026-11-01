import fs from 'node:fs';
import { createHash } from 'node:crypto';
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const coverage = read('content/screenshots/coverage.json');
const sources = read('content/screenshots/interface-references.json');
const captures = read('content/screenshots/captures.json');
const refs = new Map(sources.steps.map((row) => [row.stepId, row]));
const assets = new Map(sources.assets.map((row) => [row.id, row]));
if (refs.size !== sources.steps.length)
  throw Error('Duplicate screenshot association');
for (const asset of sources.assets) {
  if (!asset.source.startsWith('https://') || !asset.credit || !asset.platform)
    throw Error('Incomplete provenance: ' + asset.id);
  if (
    !/^\/(interface-screenshots|lab-screenshots)\//.test(asset.src) ||
    /illustrated-|step-pictures/.test(asset.src)
  )
    throw Error('Diagram counted as screenshot: ' + asset.id);
  const bytes = fs.readFileSync('public' + asset.src);
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
    throw Error('Image changed without review: ' + asset.id);
}
for (const ref of sources.steps) {
  const step = coverage.steps.find((row) => row.stepId === ref.stepId);
  if (
    !step ||
    step.instructionHash !== ref.instructionHash ||
    (ref.assetIds.length > 0 && !ref.reviewed)
  )
    throw Error('Stale screenshot association: ' + ref.stepId);
  for (const id of ref.assetIds)
    if (!assets.has(id)) throw Error('Missing asset: ' + id);
}
const rows = coverage.steps.map((step) => {
  const ref = refs.get(step.stepId);
  const capture = captures.find(
    (c) =>
      c.stepId === step.stepId &&
      c.reviewed &&
      c.instructionHash === step.instructionHash,
  );
  return {
    stepId: step.stepId,
    lessonTitle: step.lessonTitle,
    title: step.title,
    track: step.track,
    where: step.where,
    action: step.actions,
    command: step.command,
    expected: step.expected,
    instructionHash: step.instructionHash,
    status: capture
      ? 'reviewed-target-capture'
      : ref?.assetIds.length
        ? 'partial-vendor-reference'
        : 'missing-interface-screenshot',
    references: ref?.assetIds ?? [],
    captureNeeded: !capture,
  };
});
const summary = {
  lessons: coverage.summary.lessons,
  steps: rows.length,
  reviewedTargetCaptures: rows.filter(
    (x) => x.status === 'reviewed-target-capture',
  ).length,
  stepsWithPartialVendorReferences: rows.filter(
    (x) => x.status === 'partial-vendor-reference',
  ).length,
  stepsWithoutInterfaceScreenshots: rows.filter(
    (x) => x.status === 'missing-interface-screenshot',
  ).length,
};
const byTrack = {};
for (const row of rows) {
  byTrack[row.track] ??= {
    steps: 0,
    partialVendorReference: 0,
    missingInterfaceScreenshot: 0,
  };
  const track = byTrack[row.track];
  track.steps++;
  if (row.status === 'partial-vendor-reference') track.partialVendorReference++;
  if (row.status === 'missing-interface-screenshot')
    track.missingInterfaceScreenshot++;
}
fs.writeFileSync(
  'content/screenshots/interface-audit.json',
  JSON.stringify({ version: 1, summary, byTrack, steps: rows }, null, 2) + '\n',
);
const quote = (x) => '"' + String(x ?? '').replaceAll('"', '""') + '"';
const columns = [
  'stepId',
  'lessonTitle',
  'title',
  'track',
  'where',
  'action',
  'command',
  'expected',
  'status',
];
fs.writeFileSync(
  'docs/screenshots/interface-gaps.csv',
  columns.join(',') +
    '\n' +
    rows
      .filter((x) => x.captureNeeded)
      .map((x) => columns.map((k) => quote(x[k])).join(','))
      .join('\n') +
    '\n',
);
console.log(JSON.stringify({ summary, byTrack }, null, 2));
if (
  process.argv.includes('--require-references') &&
  summary.stepsWithoutInterfaceScreenshots > 0
) {
  console.error('Missing interface screenshot references.');
  process.exitCode = 1;
}
if (
  process.argv.includes('--require-complete') &&
  summary.reviewedTargetCaptures !== summary.steps
) {
  console.error(
    'Incomplete: diagrams and partial vendor references do not satisfy full per-step screenshot coverage.',
  );
  process.exitCode = 1;
}
