import {
  bicepCourse,
  dailyAdminCourse,
  vsphereCourse,
  pkiCourses,
  tlsCourse,
  splunkCourse,
  dmzCourse,
  mecmCourse,
  wsusCourse,
  landingZoneCourse,
  securityCourse,
  helpdeskCourse,
  maintenanceCourse,
} from '../lib/guided-courses.ts';
import { nessusLessons } from '../lib/nessus-curriculum.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  learningPathways,
  pathwayLessons,
  lessonSequenceFor,
} from '../app/learning-pathways.ts';
import alma from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { lessons } from '../app/course.ts';
import { migrationCurriculum } from '../app/migration-curriculum.ts';

test('pathways retain every existing lesson exactly once with its original reader and ID', () => {
  const entries = learningPathways.flatMap(pathwayLessons);
  const ids = entries.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    new Set(ids),
    new Set(
      [
        ...dailyAdminCourse.lessons,
        ...bicepCourse.lessons,
        ...vsphereCourse.lessons,
        ...pkiCourses.flatMap((course) => course.lessons),
        ...tlsCourse.lessons,
        ...lessons,
        ...migrationCurriculum,
        ...alma.lessons,
        ...nessusLessons,
        ...maintenanceCourse.lessons,
        ...helpdeskCourse.lessons,
        ...securityCourse.lessons,
        ...landingZoneCourse.lessons,
        ...mecmCourse.lessons,
        ...wsusCourse.lessons,
        ...splunkCourse.lessons,
        ...dmzCourse.lessons,
      ].map((lesson) => lesson.id),
    ),
  );
  for (const lesson of entries) {
    assert.equal(
      lesson.href,
      `${['linux-admin', 'vsphere', 'pki', 'tls', 'nessus', 'azure-lab', 'helpdesk', 'security-lab', 'landing-zone', 'enterprise'].includes(lesson.source) ? lesson.href.split('#')[0] : lesson.source === 'alma' ? '/alma' : lesson.source === 'linux' ? '/' : '/migration'}#lesson=${lesson.id}`,
    );
    assert.ok(lesson.title && lesson.description && lesson.steps.length);
  }
});

test('core route builds the domain controllers before SQL, then Azure and migration', () => {
  assert.deepEqual(
    learningPathways.map((pathway) => pathway.id),
    [
      'vsphere',
      'pki-alma-nginx',
      'pki-windows-iis',
      'windows',
      'active-directory',
      'sql',
      'helpdesk',
      'dmz',
      'wsus',
      'mecm',
      'azure',
      'landing-zone',
      'azure-operations',
      'security',
      'migrations',
      'linux',
      'linux-daily-admin',
      'alma',
      'splunk',
      'bicep',
      'nessus-linux',
      'nessus-windows',
      'nessus-scanning',
    ],
  );
  const core = learningPathways
    .flatMap((pathway) =>
      pathway.sections
        .filter((section) => !section.optional)
        .flatMap((section) => section.lessons),
    )
    .map((lesson) => lesson.id);
  for (const [before, after] of [
    ['lab-03', 'lab-04'],
    ['lab-04', 'lab-07'],
    ['lab-07', 'sql-02'],
    ['sql-02', 'sql-03'],
    ['sql-05', 'move-02'],
    ['az-01', 'lab-15'],
    ['lab-16', 'lab-17'],
    ['lab-08', 'lab-09'],
    ['lab-09', 'lab-11'],
    ['lab-11', 'lab-12'],
  ]) {
    assert.ok(
      core.indexOf(before) < core.indexOf(after),
      `${before} must precede ${after}`,
    );
  }
  const optional = learningPathways
    .flatMap((pathway) =>
      pathway.sections
        .filter((section) => section.optional)
        .flatMap((section) => section.lessons),
    )
    .map((lesson) => lesson.id);
  assert.ok(optional.includes('ha-01'));
  assert.ok(
    learningPathways
      .find((p) => p.id === 'mecm')
      .sections.some((s) => s.lessons.some((l) => l.id === 'mecm-01')),
  );
  assert.ok(!core.includes('ha-01'));
  const sequence = lessonSequenceFor('lab-06').map((lesson) => lesson.id);
  assert.equal(sequence[sequence.indexOf('lab-06') + 1], 'helpdesk-plan');
  assert.ok(sequence.indexOf('sql-05') < sequence.indexOf('az-01'));
  assert.deepEqual(
    lessonSequenceFor('ha-01').map((lesson) => lesson.id),
    ['ha-01', 'ha-02', 'ha-03', 'ha-04', 'ha-05'],
  );
});
