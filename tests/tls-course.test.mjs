import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import course from '../content/tls/course.json' with { type: 'json' };
import references from '../content/tls/references.json' with { type: 'json' };
import scenes from '../content/tls/screen-scenes.json' with { type: 'json' };
import {
  guidedCourses,
  guidedLessons,
  guidedCourseHref,
} from '../lib/guided-courses.ts';
import {
  learningPathways,
  pathwayLessons,
  lessonSequenceFor,
} from '../app/learning-pathways.ts';
import { careerSubjects } from '../app/career-pathways.ts';
import {
  canVerifyNessusLesson,
  normalizeNessusProgress,
} from '../lib/nessus-progress.ts';
import {
  checkTlsCommand,
  checkTlsScenario,
  tlsScenarios,
} from '../lib/tls-lab.ts';
import { workspaceDirections } from '../lib/learner-directions.ts';
const allSteps = course.lessons.flatMap((l) => l.steps);
test('The complete independent TLS course is inside the existing Linux pathway with stable routes', () => {
  assert.equal(course.lessons.length, 13);
  assert.equal(new Set(course.lessons.map((l) => l.module)).size, 11); // setup + ten modules
  assert.ok(guidedCourses.some((c) => c.id === course.id));
  assert.equal(guidedCourseHref(course.id), '/tls');
  const linux = learningPathways.find((p) => p.id === 'linux');
  assert.ok(careerSubjects('linux-system-administration').includes(linux));
  for (const l of course.lessons) {
    assert.ok(guidedLessons.some((g) => g.id === l.id));
    assert.equal(pathwayLessons(linux).filter((x) => x.id === l.id).length, 1);
    assert.equal(
      pathwayLessons(linux).find((x) => x.id === l.id).href,
      `/tls#lesson=${l.id}`,
    );
    assert.deepEqual(
      lessonSequenceFor(l.id).map((x) => x.id),
      course.lessons.map((x) => x.id),
    );
    assert.ok(l.quiz.length >= 2);
    assert.ok(
      l.quiz.every((q) => q.answer >= 0 && q.answer < q.options.length),
    );
  }
  assert.equal(course.lessons.at(-1).quiz.length, 7);
});
test('Every meaningful step has all seven teaching fields and an exact, truthfully labeled visual', () => {
  assert.equal(allSteps.length, 100);
  assert.equal(references.length, allSteps.length);
  for (const lesson of course.lessons)
    for (const [i, s] of lesson.steps.entries()) {
      for (const key of ['what', 'why', 'verify', 'failure'])
        assert.ok(
          typeof s.guide[key] === 'string' && s.guide[key].trim().length > 0,
          s.title + ':' + key,
        );
      assert.ok(
        s.where && s.actions.length && s.expected && s.breakdown.length,
      );
      assert.equal(s.screenshot.status, 'illustration');
      const r = references.find((x) => x.id === s.screenshot.assetId);
      assert.ok(r, s.title);
      assert.match(r.note, /not a genuine/i);
      const svg = fs.readFileSync('public' + r.src, 'utf8');
      assert.match(svg, /INSTRUCTIONAL MOCKUP/);
      assert.match(svg, /NOT A LIVE CAPTURE/);
      assert.doesNotMatch(svg, /<script|<foreignObject|onload=/);
      assert.equal(createHash('sha256').update(svg).digest('hex'), r.sha256);
      const scene = scenes.find((x) => x.id === r.id);
      assert.equal(scene.lessonId, lesson.id);
      assert.equal(scene.step, i + 1);
      assert.equal(scene.command, s.command);
      assert.deepEqual(scene.actions, s.actions);
      assert.equal(scene.expected, s.expected);
      assert.ok(s.sources.every((x) => x.startsWith('https://')));
      for (const f of s.downloads ?? [])
        assert.ok(fs.existsSync('public' + f.href));
    }
});
test('Existing progress contract gates TLS completion on steps, exercise and correct answers', () => {
  const l = course.lessons[0];
  const p = { version: 1, checked: [], verified: [], answers: {} };
  assert.equal(canVerifyNessusLesson(l.id, p), false);
  p.checked = l.steps.map((_, i) => `${l.id}:step:${i}`);
  p.checked.push(`${l.id}:exercise`);
  p.answers[l.id] = l.quiz.map((q) => q.answer);
  assert.equal(canVerifyNessusLesson(l.id, p), true);
  p.verified = [l.id];
  assert.ok(normalizeNessusProgress(p).verified.includes(l.id));
  p.answers[l.id][0] = (l.quiz[0].answer + 1) % l.quiz[0].options.length;
  assert.equal(canVerifyNessusLesson(l.id, p), false);
  assert.deepEqual(normalizeNessusProgress(p).verified, []);
});
test('Browser rehearsals enforce case and contain all twelve guided failures', () => {
  assert.equal(checkTlsCommand('test', 'sudo nginx -t'), true);
  assert.equal(checkTlsCommand('test', 'sudo nginx -T'), false);
  assert.equal(checkTlsCommand('test', 'sudo NGINX -t'), false);
  assert.equal(checkTlsCommand('test', 'sudo nginx -t; rm -rf /'), false);
  assert.equal(tlsScenarios.length, 12);
  for (const s of tlsScenarios) {
    assert.equal(checkTlsScenario(s.id, s.answer), true);
    assert.equal(
      checkTlsScenario(s.id, (s.answer + 1) % s.choices.length),
      false,
    );
  }
  assert.match(
    workspaceDirections('Practice CA server (TLS-CA01) · RHEL 9 Bash terminal'),
    /10\.90\.0\.20/,
  );
  assert.match(
    workspaceDirections(
      'Application server (TLS-APP01) · RHEL 9 Bash terminal',
    ),
    /10\.90\.0\.10/,
  );
});
test('Certificate procedures preserve secrets, verification and safe rollout boundaries', () => {
  const commands = allSteps.map((s) => s.command ?? '').join('\n');
  assert.doesNotMatch(
    commands,
    /curl(?:\.exe)?[^\n]*\s(?:-k|--insecure)\b|setenforce\s+0|chmod\s+777/,
  );
  assert.doesNotMatch(
    commands,
    /(?:scp|cat)[^\n]*\b(?:root|intermediate)\.key/,
  );
  assert.ok(commands.includes('sudo nginx -t && sudo systemctl reload nginx'));
  assert.ok(commands.includes('-newkey rsa:3072'));
  assert.ok(commands.includes('-key /etc/pki/tls/private/app-v1.key'));
  assert.ok(
    commands.includes('-verify_return_error -verify_hostname app.example.mil'),
  );
  assert.ok(
    commands.includes('cat ~/tls-work/app-v1.crt ~/tls-work/intermediate.crt'),
  );
  assert.match(
    JSON.stringify(course),
    /not a DoD CA|not a genuine DoD|not connected to DoD/,
  );
  for (const s of allSteps)
    assert.ok(
      ![...(s.command ?? '')].some(
        (c) => c.charCodeAt(0) < 32 && !['\n', '\t'].includes(c),
      ),
      s.title,
    );
  const helper = fs.readFileSync('public/tls-lab/make-expired-fixture.sh');
  assert.ok(
    commands.includes(
      createHash('sha256').update(helper).digest('hex').toUpperCase(),
    ),
  );
  const config = fs.readFileSync('public/tls-lab/app-tls.conf', 'utf8');
  assert.match(config, /ssl_protocols TLSv1\.2 TLSv1\.3;/);
  assert.match(config, /server_name app\.example\.mil;/);
});
test('The real offline OpenSSL workflow validates issuance, renewal and deliberate failure cases', () => {
  const output = execFileSync('python3', ['tools/verify-tls-crypto.py'], {
    encoding: 'utf8',
    timeout: 120000,
  });
  assert.match(output, /PASS: encrypted root\/intermediate/);
  assert.match(output, /genuine expired fixture/);
});
