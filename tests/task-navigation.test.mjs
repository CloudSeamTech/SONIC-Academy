import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  taskNavigation,
  taskScreenshots,
  stepActions,
  stepResource,
  taskLinks,
} from '../lib/task-navigation.ts';
import { learnerActions } from '../lib/learner-directions.ts';
import { actionCopy } from '../lib/action-checklist.ts';

test('Bicep references explain each task and distinguish names from FQDNs', () => {
  const notes = JSON.parse(
    fs.readFileSync(
      new URL('../content/bicep/teacher-notes.json', import.meta.url),
    ),
  );
  assert.equal(Object.keys(notes).length, 20);
  for (const lessonId of Object.keys(notes)) {
    for (let step = 1; step <= 3; step++) {
      const resource = stepResource(`${lessonId}:${step}`, { title: 'Task' });
      assert.ok(resource.teacherNote?.includes(notes[lessonId]));
    }
  }
  const names = stepResource('bicep-server-settings:2', {
    title: 'VM settings',
  }).namingExamples;
  assert.equal(
    names.find((item) => item.field === 'computerName').example,
    'cs-dev-vm-1',
  );
  assert.equal(
    names.find((item) => item.field.startsWith('FQDN')).example,
    'app01.lab.example.test',
  );
  assert.match(
    names.find((item) => item.field === 'computerName').meaning,
    /not its FQDN/,
  );
});

test('unreviewed steps retain their authored instructions instead of invented menu paths', () => {
  const actions = ['Read the host name.'];
  assert.equal(stepActions('unknown:1', actions), actions);
  assert.deepEqual(stepResource('unknown:1', { title: 'Inspect the host' }), {
    title: 'Inspect the host',
  });
});

test('step destinations omit credentials and placeholder lab addresses', () => {
  assert.deepEqual(
    taskLinks(
      'Open https://portal.azure.com. Then https://your-vcenter/ui and https://192.168.1.10/ui and https://example.test/. Never publish https://fake-user:fake-password@example.net/.',
    ),
    [{ title: 'Open portal.azure.com', url: 'https://portal.azure.com/' }],
  );
});

test('each original vendor picture matches exactly one rendered checklist action', () => {
  for (const picture of taskScreenshots) {
    const actions = taskNavigation[picture.stepId].actions
      .flatMap(learnerActions)
      .map((action) => actionCopy(action).instruction);
    assert.equal(
      actions.filter((action) => action.startsWith(picture.actionStartsWith))
        .length,
      1,
      picture.src,
    );
    const bytes = fs.readFileSync('public' + picture.src);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.match(picture.source, /^https:\/\/knowledge\.broadcom\.com\//);
  }
});

test('the free installer route names its supported baseline and does not promise vCenter access', () => {
  const route = taskNavigation['vsphere-install:1'];
  assert.deepEqual(route.path.slice(1), [
    'My Downloads',
    'Free Software Downloads available HERE',
    'VMware vSphere Hypervisor',
  ]);
  assert.match(route.needs, /free ESXi cannot join vCenter/);
  assert.ok(route.actions.some((action) => action.includes('24677879')));
  assert.ok(
    route.actions.some(
      (action) => action.includes('Stop') && action.includes('checksum'),
    ) || route.actions.some((action) => action.includes('Stop if they differ')),
  );
  for (const item of Object.values(taskNavigation))
    for (const link of item.links ?? [])
      assert.equal(new URL(link.url).protocol, 'https:');
});
