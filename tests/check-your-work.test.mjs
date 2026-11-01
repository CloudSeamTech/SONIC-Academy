import test from 'node:test';
import assert from 'node:assert/strict';
import { dc01LessonCoverage } from '../lib/verification-course-map.ts';
import { migrationCurriculum } from '../app/migration-curriculum.ts';
import { parseGuidedLab } from '../lib/guided-lab.ts';
import { checkDC01, parseLocalLabReport } from '../lib/lab-verification.ts';
import demo from '../content/verification/dc01-demo.json' with { type: 'json' };
test('DC01 coverage maps to the actual lesson order and only existing check IDs', () => {
  const lesson = migrationCurriculum.find((l) => l.id === 'lab-04');
  const steps = parseGuidedLab(lesson.body).steps;
  assert.deepEqual(
    dc01LessonCoverage.map((t) => t.title),
    steps.map((t) => t.title),
  );
  assert.deepEqual(
    dc01LessonCoverage.map((t) => t.step),
    steps.map((_, i) => i + 1),
  );
  const checks = checkDC01(
    parseLocalLabReport(JSON.stringify(demo)),
    {
      hostname: 'DC01',
      domain: 'lab.example.test',
      ipv4: '10.50.0.10',
      prefix: 24,
      dns: '10.50.0.10',
    },
    Date.parse(demo.collectedAt),
  );
  for (const task of dc01LessonCoverage)
    for (const id of task.checks) assert.ok(checks.some((c) => c.id === id));
  assert.equal(
    dc01LessonCoverage.find((t) => t.step === 6).checks.length,
    0,
    'DSRM credentials cannot be marked correct by this collector.',
  );
  assert.equal(
    dc01LessonCoverage.find((t) => t.step === 8).checks.length,
    0,
    'Uncollected AD paths cannot be marked correct.',
  );
});
