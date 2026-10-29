import test from 'node:test';
import assert from 'node:assert/strict';
import {
  careerPathways,
  careerSubjects,
  careerLessons,
} from '../app/career-pathways.ts';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
import { readFileSync } from 'node:fs';

test('career groups include each existing subject and lesson exactly once', () => {
  const subjects = careerPathways.flatMap((path) => path.subjects);
  assert.equal(new Set(subjects).size, subjects.length);
  assert.deepEqual(
    [...subjects].sort(),
    learningPathways.map((path) => path.id).sort(),
  );
  const lessons = careerPathways.flatMap((path) => careerLessons(path.id));
  assert.deepEqual(
    lessons.map((l) => l.id).sort(),
    learningPathways
      .flatMap(pathwayLessons)
      .map((l) => l.id)
      .sort(),
  );
  assert.ok(lessons.every((lesson) => lesson.href.includes('#lesson=')));
  assert.deepEqual(
    careerSubjects('windows-system-administration').map((p) => p.id),
    ['vsphere', 'windows', 'active-directory', 'sql', 'helpdesk', 'dmz', 'wsus', 'mecm'],
  );
  assert.ok(careerSubjects('cyber-analyst').some((p) => p.id === 'splunk'));
  assert.ok(
    careerSubjects('azure-cloud-engineering').some(
      (p) => p.id === 'landing-zone',
    ),
  );
});

test('security practice log evidence supports the taught investigation and input totals', () => {
  const [header, ...lines] = readFileSync(
    new URL('../public/splunk/cloudseam-security.csv', import.meta.url),
    'utf8',
  )
    .trim()
    .split(/\r?\n/);
  // This fixture deliberately has no quoted fields or embedded commas.
  const fields = header.split(',');
  const events = lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [fields[i], value])),
  );
  assert.equal(events.length, 16);
  assert.equal(events.filter((e) => e.event_type === 'web').length, 8);
  const sql = events.filter((e) =>
    /union\s+select|or\s+1=1/i.test(decodeURIComponent(e.request)),
  );
  assert.equal(sql.length, 3);
  assert.ok(sql.every((e) => e.action === 'blocked' && e.status === '403'));
  const script = events.filter((e) =>
    decodeURIComponent(e.request).includes('<script>'),
  );
  assert.equal(script.length, 1);
  assert.equal(script[0].action, 'blocked');
  const auth = events.filter((e) => e.event_type === 'auth');
  assert.equal(auth.filter((e) => e.action === 'failure').length, 5);
  assert.equal(auth.filter((e) => e.action === 'success').length, 3);
  const external = auth.filter((e) => !e.src_ip.startsWith('10.50.0.'));
  assert.deepEqual(
    external.map((e) => e.action),
    ['failure', 'failure', 'failure', 'failure', 'success'],
  );
  assert.ok(
    external.every(
      (e) =>
        e.src_ip === '198.51.100.77' &&
        e.user === 'labadmin' &&
        e.dest_port === '3389',
    ),
  );
  assert.equal(auth.filter((e) => e.src_ip === '10.50.0.30').length, 1);
  assert.ok(
    events.every(
      (e) =>
        Number.isFinite(Date.parse(e.timestamp)) &&
        e.server.endsWith('.lab.example.test'),
    ),
  );
});
