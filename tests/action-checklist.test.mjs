import test from 'node:test';
import assert from 'node:assert/strict';
import { actionCopy, readActionChecks } from '../lib/action-checklist.ts';
test('explanations can collapse without dropping commands or safety conditions', () => {
  assert.deepEqual(actionCopy('Open Files. This is the visual file manager.'), {
    instruction: 'Open Files.',
    explanation: 'This is the visual file manager.',
  });
  for (const action of [
    'Open Files. This is the file manager. Click Home.',
    'Open Files. This shows the disks. Do not format a disk.',
    'If the disk is unknown, stop.',
    'Run .\\setup.exe /auto upgrade.',
  ])
    assert.equal(actionCopy(action).instruction, action);
});
test('only unchanged authored actions retain checks after an edit', () => {
  assert.deepEqual(
    readActionChecks('["Click Save.","Click Old.","Click Save.",true]', [
      'Click Save.',
      'Click New.',
    ]),
    ['Click Save.'],
  );
});
test('invalid and unavailable action notes never award checks', () => {
  for (const raw of [null, '{broken', '{}', 'true'])
    assert.deepEqual(readActionChecks(raw, ['Click Save.']), []);
});
