import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import course from '../content/dmz/course.json' with { type: 'json' };
import references from '../content/dmz/references.json' with { type: 'json' };
import scenes from '../content/dmz/screen-scenes.json' with { type: 'json' };
import markers from '../content/screenshots/markers.json' with { type: 'json' };
import {
  learningPathways,
  pathwayLessons,
  lessonSequenceFor,
} from '../app/learning-pathways.ts';
import { careerSubjects } from '../app/career-pathways.ts';
import { guidedLessons } from '../lib/guided-courses.ts';
import { lessonTier } from '../lib/plan-access.ts';
test('DMZ belongs to Windows and preserves a complete independent lesson sequence', () => {
  assert.equal(course.lessons.length, 9);
  assert.equal(course.lessons.flatMap((l) => l.steps).length, 35);
  assert.ok(
    careerSubjects('windows-system-administration').some((s) => s.id === 'dmz'),
  );
  const path = learningPathways.find((p) => p.id === 'dmz');
  assert.deepEqual(
    pathwayLessons(path).map((l) => l.id),
    course.lessons.map((l) => l.id),
  );
  for (const lesson of course.lessons) {
    assert.ok(guidedLessons.some((l) => l.id === lesson.id));
    assert.equal(lessonTier(lesson.id), 'apex');
    assert.deepEqual(
      lessonSequenceFor(lesson.id).map((l) => l.id),
      course.lessons.map((l) => l.id),
    );
    assert.ok(
      lesson.quiz.length &&
        lesson.quiz.every((q) => q.answer >= 0 && q.answer < q.options.length),
    );
  }
});
test('Every DMZ step has a matching local visual and explicit reviewed marker coordinates', () => {
  for (const lesson of course.lessons)
    for (const step of lesson.steps) {
      assert.ok(
        step.actions.length >= 3 && step.expected && step.breakdown.length,
      );
      assert.notEqual(step.screenshot.status, 'capture-needed');
      const ref = references.find((r) => r.id === step.screenshot.assetId);
      assert.ok(
        ref && existsSync(new URL('../public' + ref.src, import.meta.url)),
        step.title,
      );
      assert.ok(markers[ref.src]?.length >= 2, step.title);
      for (const m of markers[ref.src])
        assert.ok(m.x > 0 && m.x < 100 && m.y > 0 && m.y < 100);
      if (step.screenshot.status === 'illustration')
        assert.match(ref.note, /not a live/i);
    }
});
test('Published proxy configuration keeps both TLS hops verified and does not trust spoofed client headers', () => {
  const conf = readFileSync(
    new URL('../public/dmz/nginx-dmz.conf', import.meta.url),
    'utf8',
  );
  for (const value of [
    'listen 10.60.0.10:443 ssl',
    'proxy_pass https://10.80.0.40:443',
    'proxy_ssl_verify on',
    'proxy_ssl_server_name on',
    'proxy_ssl_name iis-backend.lab.example.test',
    'proxy_set_header X-Forwarded-For $remote_addr',
  ])
    assert.ok(conf.includes(value), value);
  assert.ok(!conf.includes('proxy_ssl_verify off'));
  const commands = course.lessons
    .flatMap((l) => l.steps)
    .map((s) => s.command ?? '')
    .join('\n');
  assert.ok(!/curl\s+-k\b/.test(commands));
  const script = readFileSync(
    new URL('../public/dmz/new-iis-backend.ps1', import.meta.url),
    'utf8',
  );
  assert.ok(script.includes("$env:COMPUTERNAME -ne 'IIS-DMZ01'"));
  assert.ok(script.includes('-RemoteAddress 10.60.0.10'));
  assert.ok(script.includes('Cert:\\LocalMachine\\My'));
  assert.ok(!script.includes('Export-PfxCertificate'));
});

test('Private application and AD remain distinct and visual scenes match teaching commands', () => {
  const text = JSON.stringify(course);
  assert.ok(text.includes('VMnet5'));
  assert.ok(text.includes('10.80.0.40'));
  assert.ok(text.includes('10.50.0.10'));
  assert.ok(text.includes('APP_DENY_OTHER'));
  assert.ok(!text.includes('10.50.0.40'));
  for (const lesson of course.lessons)
    for (const [index, step] of lesson.steps.entries()) {
      const scene = scenes.find(
        (s) => s.id === `${lesson.id}-screen-${index + 1}`,
      );
      assert.equal(scene.title, step.title);
      assert.equal(scene.expected, step.expected);
      assert.equal(scene.command ?? undefined, step.command);
    }
});
