import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  pkiCourses,
  guidedCourseHref,
  guidedLessons,
} from '../lib/guided-courses.ts';
import { careerSubjects } from '../app/career-pathways.ts';
import { lessonSequenceFor } from '../app/learning-pathways.ts';
import {
  normalizeNessusProgress,
  canVerifyNessusLesson,
} from '../lib/nessus-progress.ts';
import refs from '../content/pki/references.json' with { type: 'json' };
test('PKI has two separate classes, independent chapter sequences and stable existing progress', () => {
  assert.deepEqual(
    careerSubjects('pki-certificate-management').map((c) => c.id),
    pkiCourses.map((c) => c.id),
  );
  assert.equal(pkiCourses.length, 2);
  const legacy = guidedLessons.find((lesson) => lesson.id === 'tls-basics');
  for (const course of pkiCourses) {
    assert.ok(guidedCourseHref(course.id).startsWith('/pki/'));
    for (const lesson of course.lessons) {
      assert.deepEqual(
        lessonSequenceFor(lesson.id).map((l) => l.id),
        course.lessons.map((l) => l.id),
      );
      const progress = {
        version: 1,
        checked: [
          ...lesson.steps.map((_, i) => `${lesson.id}:step:${i}`),
          ...legacy.steps.map((_, i) => `${legacy.id}:step:${i}`),
          `${legacy.id}:exercise`,
        ],
        verified: ['tls-basics'],
        answers: {
          [lesson.id]: lesson.quiz.map((q) => q.answer),
          [legacy.id]: legacy.quiz.map((q) => q.answer),
        },
      };
      assert.equal(canVerifyNessusLesson(lesson.id, progress), false);
      progress.checked.push(`${lesson.id}:exercise`);
      assert.equal(canVerifyNessusLesson(lesson.id, progress), true);
      assert.ok(
        normalizeNessusProgress(progress).verified.includes('tls-basics'),
      );
    }
  }
  const ids = guidedLessons.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});
test('PKI teaching steps have machine, actions, explanations, verification, recovery and truthful captures', () => {
  const used = new Set();
  for (const course of pkiCourses)
    for (const lesson of course.lessons) {
      assert.ok(lesson.steps.length >= 2);
      for (const step of lesson.steps) {
        assert.ok(
          step.where &&
            step.actions.length &&
            step.expected &&
            step.breakdown.length,
        );
        for (const key of ['what', 'why', 'verify', 'failure'])
          assert.ok(step.guide[key]);
        for (const item of step.downloads ?? [])
          assert.ok(fs.existsSync('public' + item.href));
        if (step.screenshot.status === 'reference') {
          used.add(step.screenshot.assetId);
          const asset = refs.find((r) => r.id === step.screenshot.assetId);
          assert.ok(asset?.reviewed);
          for (const [src, hash] of [
            [asset.src, asset.sha256],
            [asset.originalSrc, asset.originalSha256],
          ])
            assert.equal(
              createHash('sha256')
                .update(fs.readFileSync('public' + src))
                .digest('hex'),
              hash,
            );
        } else assert.equal(step.screenshot.status, 'capture-needed');
      }
    }
  assert.equal(used.size, 7);
  assert.match(pkiCourses[1].prerequisite, /does not install IIS/);
  assert.match(pkiCourses[0].baseline, /AlmaLinux 10.2/);
  const reader = fs.readFileSync('app/nessus/nessus-academy.tsx', 'utf8');
  assert.ok(
    reader.indexOf('<CourseScreenshot') < reader.indexOf('Next step →'),
  );
});
