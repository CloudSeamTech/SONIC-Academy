import fs from 'node:fs';
const path = 'content/screenshots/interface-references.json';
const references = JSON.parse(fs.readFileSync(path, 'utf8'));
const coverage = JSON.parse(
  fs.readFileSync('content/screenshots/coverage.json', 'utf8'),
);
let invalidated = 0;
for (const row of references.steps) {
  const step = coverage.steps.find((s) => s.stepId === row.stepId);
  if (!step || step.instructionHash === row.instructionHash) continue;
  row.excludedAssetIds = [
    ...new Set([...(row.excludedAssetIds ?? []), ...row.assetIds]),
  ];
  row.assetIds = [];
  row.instructionHash = step.instructionHash;
  row.reviewed = false;
  row.coverage = 'missing-interface-screenshot';
  row.selectionReason =
    'Instruction changed. Previous reference removed; a matching application screenshot must be reviewed before reattachment.';
  invalidated++;
}
fs.writeFileSync(path, JSON.stringify(references, null, 2) + '\n');
console.log(
  `Invalidated ${invalidated} changed associations. No screenshot was approved.`,
);
