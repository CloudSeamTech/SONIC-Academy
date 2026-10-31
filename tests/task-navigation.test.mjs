import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { taskNavigation, taskScreenshots, stepActions, stepResource } from '../lib/task-navigation.ts';
import { learnerActions } from '../lib/learner-directions.ts';
import { actionCopy } from '../lib/action-checklist.ts';

test('unreviewed steps retain their authored instructions instead of invented menu paths', () => {
  const actions = ['Read the host name.'];
  assert.equal(stepActions('unknown:1', actions), actions);
  assert.deepEqual(stepResource('unknown:1', { title: 'Inspect the host' }), { title: 'Inspect the host' });
});

test('each original vendor picture matches exactly one rendered checklist action', () => {
  for (const picture of taskScreenshots) {
    const actions = taskNavigation[picture.stepId].actions.flatMap(learnerActions).map(action => actionCopy(action).instruction);
    assert.equal(actions.filter(action => action.startsWith(picture.actionStartsWith)).length, 1, picture.src);
    const bytes = fs.readFileSync('public' + picture.src);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.match(picture.source, /^https:\/\/knowledge\.broadcom\.com\//);
  }
});

test('the free installer route names its supported baseline and does not promise vCenter access', () => {
  const route = taskNavigation['vsphere-install:1'];
  assert.deepEqual(route.path.slice(1), ['My Downloads', 'Free Software Downloads available HERE', 'VMware vSphere Hypervisor']);
  assert.match(route.needs, /free ESXi cannot join vCenter/);
  assert.ok(route.actions.some(action => action.includes('24677879')));
  assert.ok(route.actions.some(action => action.includes('Stop') && action.includes('checksum')) || route.actions.some(action => action.includes('Stop if they differ')));
  for (const item of Object.values(taskNavigation)) for (const link of item.links ?? []) assert.equal(new URL(link.url).protocol, 'https:');
});
