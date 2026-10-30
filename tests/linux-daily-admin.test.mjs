import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import course from '../content/linux-admin/course.json' with { type: 'json' };
import refs from '../content/linux-admin/references.json' with { type: 'json' };
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
import { canVerifyNessusLesson } from '../lib/nessus-progress.ts';
test('Daily administration has its own class without changing the original Linux lesson list', () => {
  assert.equal(course.lessons.length, 20);
  assert.equal(course.lessons.flatMap((l) => l.steps).length, 76);
  assert.equal(guidedCourseHref(course.id), '/linux-admin');
  assert.ok(guidedCourses.some((c) => c.id === course.id));
  const linux = learningPathways.find((p) => p.id === 'linux-daily-admin');
  assert.ok(
    pathwayLessons(learningPathways.find((p) => p.id === 'linux')).every(
      (l) => !l.id.startsWith('daily-'),
    ),
  );
  for (const lesson of course.lessons) {
    assert.ok(guidedLessons.some((l) => l.id === lesson.id));
    assert.equal(
      pathwayLessons(linux).filter((l) => l.id === lesson.id).length,
      1,
    );
    assert.equal(
      pathwayLessons(linux).find((l) => l.id === lesson.id).href,
      `/linux-admin#lesson=${lesson.id}`,
    );
    assert.deepEqual(
      lessonSequenceFor(lesson.id).map((l) => l.id),
      course.lessons.map((l) => l.id),
    );
    assert.ok(lesson.quiz.length >= 2 && lesson.exercise && lesson.pass);
    for (const q of lesson.quiz)
      assert.ok(q.answer >= 0 && q.answer < q.options.length && q.explanation);
  }
});
test('Every step has complete guidance and a truthful, unbroken exact-step terminal visual', () => {
  const all = course.lessons.flatMap((l) => l.steps);
  assert.equal(refs.length, all.length);
  assert.equal(new Set(refs.map((r) => r.id)).size, refs.length);
  for (const s of all) {
    for (const key of ['what', 'why', 'verify', 'failure'])
      assert.ok(s.guide[key].length > 15);
    assert.ok(s.where && s.actions.length && s.breakdown.length && s.expected);
    assert.equal(s.screenshot.status, 'illustration');
    const ref = refs.find((r) => r.id === s.screenshot.assetId);
    const file = fs.readFileSync('public' + ref.src);
    assert.equal(createHash('sha256').update(file).digest('hex'), ref.sha256);
    assert.match(file.toString(), /INSTRUCTIONAL MOCKUP — NOT A LIVE CAPTURE/);
    assert.ok(!/[\x00-\x08\x0b-\x1f]/.test(JSON.stringify(s)));
    execFileSync('bash', ['-n'], {
      input: s.command,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }
});
test('High-impact operations remain bounded and recovery guidance is present', () => {
  const lvm = course.lessons.find((l) => l.id === 'daily-lvm');
  const words = JSON.stringify(lvm);
  assert.match(words, /wipefs -n/);
  assert.match(words, /never assume|Never assume/);
  assert.match(words, /XFS cannot shrink/);
  assert.match(words, /OS disk/);
  assert.match(
    JSON.stringify(course.lessons.find((l) => l.id === 'daily-updates')),
    /pilot|Pilot/,
  );
  assert.match(
    JSON.stringify(course.lessons.find((l) => l.id === 'daily-backup')),
    /separate|independent/,
  );
  assert.match(
    JSON.stringify(course.lessons.find((l) => l.id === 'daily-ssh')),
    /fingerprint/,
  );
  for (const s of course.lessons.flatMap((l) => l.steps)) {
    assert.doesNotMatch(
      s.command,
      /chmod\s+777|setenforce\s+0|rm\s+-rf|curl\s+-k|mkfs.*\/dev\/sda/,
    );
  }
});
test('Progress requires every actual step, practical check and correct quiz answer', () => {
  const lesson = course.lessons.at(-1);
  const progress = { version: 1, checked: [], answers: {}, verified: [] };
  assert.equal(canVerifyNessusLesson(lesson.id, progress), false);
  progress.checked = lesson.steps.map((_, i) => `${lesson.id}:step:${i}`);
  progress.checked.push(`${lesson.id}:exercise`);
  assert.equal(canVerifyNessusLesson(lesson.id, progress), false);
  progress.answers[lesson.id] = lesson.quiz.map((q) => q.answer);
  assert.equal(canVerifyNessusLesson(lesson.id, progress), true);
  progress.checked.pop();
  assert.equal(canVerifyNessusLesson(lesson.id, progress), false);
});
test('Practice file and backup operations really restore data in an isolated temporary directory', () => {
  const dir = fs.mkdtempSync('/tmp/sonic-daily-check-');
  try {
    execFileSync(
      'bash',
      [
        '-eu',
        '-c',
        `
      TASK_ROOT="$1"
      mkdir -p "$TASK_ROOT/practice/space" "$TASK_ROOT/evidence" "$TASK_ROOT/restore-test"
      printf 'Practice only\\n' > "$TASK_ROOT/practice/readme.txt"
      cp -a "$TASK_ROOT/practice/readme.txt" "$TASK_ROOT/practice/readme.txt.before"
      printf 'Second line\\n' >> "$TASK_ROOT/practice/readme.txt"
      if diff -u "$TASK_ROOT/practice/readme.txt.before" "$TASK_ROOT/practice/readme.txt"; then exit 3; fi
      dd if=/dev/zero of="$TASK_ROOT/practice/space/sample.bin" bs=1M count=8 status=none
      test "$(stat -c %s "$TASK_ROOT/practice/space/sample.bin")" = 8388608
      tar -czf "$TASK_ROOT/evidence/practice-backup.tar.gz" -C "$TASK_ROOT" practice
      sha256sum "$TASK_ROOT/evidence/practice-backup.tar.gz" > "$TASK_ROOT/evidence/practice-backup.sha256"
      sha256sum -c "$TASK_ROOT/evidence/practice-backup.sha256"
      tar -xzf "$TASK_ROOT/evidence/practice-backup.tar.gz" -C "$TASK_ROOT/restore-test"
      diff -r "$TASK_ROOT/practice" "$TASK_ROOT/restore-test/practice"
    `,
        'daily-file-check',
        dir,
      ],
      { stdio: 'pipe' },
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
