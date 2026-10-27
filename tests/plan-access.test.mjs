import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lessonTier,
  freeLessonIds,
  normalizePlanTier,
  planLabel,
} from '../lib/plan-access.ts';
import { tlsCourse } from '../lib/guided-courses.ts';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
const lessons = learningPathways.flatMap(pathwayLessons);
test('two-tier catalog has valid foundation IDs and reserves enterprise troubleshooting for Apex', () => {
  const valid = new Set(lessons.map((l) => l.id));
  assert.equal(new Set(freeLessonIds).size, freeLessonIds.length);
  assert.ok(freeLessonIds.every((id) => valid.has(id)));
  assert.equal(lessons.filter((l) => lessonTier(l.id) === 'free').length, 42);
  assert.equal(
    lessons.filter((l) => lessonTier(l.id) === 'apex').length,
    188 + tlsCourse.lessons.length,
  );
  for (const id of [
    'lab-19',
    'lab-07',
    'sql-03',
    'mecm-01',
    'splunk-injection',
    'splunk-dashboard-inputs',
  ])
    assert.equal(lessonTier(id), 'apex', id);
  for (const id of [
    'lab-00',
    'lab-03',
    'lab-04-vmware',
    'lab-04-windows',
    'lab-04',
    'splunk-install',
    'splunk-upload',
    'splunk-search',
    'rollback-gate-v3',
    'deallocate-v2',
  ])
    assert.equal(lessonTier(id), 'free', id);
});
test('legacy or unrecognized plan values cannot become Apex', () => {
  for (const value of [undefined, null, 'enhanced', 'Apex', 'admin', {}, 1])
    assert.equal(normalizePlanTier(value), 'free');
  assert.equal(normalizePlanTier('apex'), 'apex');
  assert.equal(planLabel('enhanced'), 'Free Tier');
  assert.equal(planLabel('apex'), 'Apex Tier');
});
