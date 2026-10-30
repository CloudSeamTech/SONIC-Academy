import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldResumeReader } from '../lib/reader-resume.ts';
const progress = 'sonic-academy-nessus-v1';
test('Unrelated tab activity and other lessons do not eject the learner from an active step', () => {
  for (const key of [
    'sonic-academy-recent-v1',
    'sonic-bicep-draft-v1:guest:bicep-first-words',
    'sonic-academy-bookmarks-v1',
  ])
    assert.equal(shouldResumeReader(key, progress, '000', '000'), false, key);
  assert.equal(
    shouldResumeReader(progress, progress, '000', '000'),
    false,
    'Other lessons may change the shared progress record without changing this lesson.',
  );
  assert.equal(
    shouldResumeReader('sonic-academy-recent-v1', progress, '000', '100'),
    false,
    'An unrelated event must not drive step navigation.',
  );
});
test('Initial load, profile replacement and changed current-lesson checks still resume progress', () => {
  assert.equal(shouldResumeReader(undefined, progress, '', '100'), true);
  assert.equal(shouldResumeReader(null, progress, '100', '000'), true);
  assert.equal(shouldResumeReader(progress, progress, '000', '100'), true);
});
