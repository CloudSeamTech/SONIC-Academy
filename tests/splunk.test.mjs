import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import course from '../content/splunk/course.json' with { type: 'json' };
import refs from '../content/splunk/references.json' with { type: 'json' };
import { lessonSequenceFor } from '../app/learning-pathways.ts';

test('Splunk practice evidence matches the downloadable synthetic dataset', () => {
  const [header, ...lines] = readFileSync(
    new URL('../public/splunk/cloudseam-web.csv', import.meta.url),
    'utf8',
  )
    .trim()
    .split(/\r?\n/);
  const columns = header.split(',');
  const rows = lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [columns[i], value])),
  );
  assert.equal(rows.length, 12);
  assert.deepEqual(
    Object.fromEntries(
      ['200', '401', '503'].map((status) => [
        status,
        rows.filter((r) => r.status === status).length,
      ]),
    ),
    { 200: 6, 401: 4, 503: 2 },
  );
  assert.equal(new Set(rows.map((r) => r.user)).size, 5);
  assert.equal(rows.filter((r) => r.path === '/login').length, 6);
  assert.equal(
    rows.filter((r) => r.user === 'bob' && r.status === '401').length,
    4,
  );
  assert.ok(
    rows.every(
      (r) =>
        Number.isFinite(Date.parse(r.timestamp)) &&
        r.server.endsWith('.lab.example.test'),
    ),
  );
  const lookup = readFileSync(
    new URL('../public/splunk/cloudseam-status.csv', import.meta.url),
    'utf8',
  );
  assert.match(lookup, /503,Service Unavailable/);
});

test('every Splunk step has an intact attributed local reference and stays in its own pathway', () => {
  assert.equal(course.lessons.length, 22);
  const steps = course.lessons.flatMap((lesson) => lesson.steps);
  assert.equal(steps.length, 68);
  for (const step of steps) {
    assert.ok(['reference', 'illustration'].includes(step.screenshot.status));
    const ref = refs.find((item) => item.id === step.screenshot.assetId);
    assert.ok(ref, step.title);
    const file = new URL('../public' + ref.src, import.meta.url);
    assert.ok(existsSync(file));
    assert.equal(
      createHash('sha256').update(readFileSync(file)).digest('hex'),
      ref.sha256,
    );
    assert.ok(/^https:\/\/(help|docs)\.splunk\.com\//.test(ref.source));
    assert.ok(!ref.original.includes('jwt='));
  }
  assert.deepEqual(
    lessonSequenceFor('splunk-start').map((l) => l.id),
    course.lessons.map((l) => l.id),
  );
  assert.ok(
    lessonSequenceFor('lab-04').every((l) => !l.id.startsWith('splunk-')),
  );
  const schedule = course.lessons.find((l) => l.id === 'splunk-schedule');
  assert.ok(
    schedule.steps.some((s) => s.actions.some((a) => a.includes('Disable'))),
  );
});
