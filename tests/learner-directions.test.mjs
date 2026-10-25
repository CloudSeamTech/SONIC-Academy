import test from 'node:test';
import assert from 'node:assert/strict';
import {
  learnerActions,
  workspaceDirections,
} from '../lib/learner-directions.ts';
test('Directions keep a guest PowerShell session distinct from the host and choose the actual application', () => {
  assert.match(
    workspaceDirections('APP01 · Windows PowerShell as administrator'),
    /double-click APP01/,
  );
  assert.match(
    workspaceDirections('APP01 · Windows PowerShell as administrator'),
    /Inside that VM/,
  );
  assert.match(
    workspaceDirections('FW01 · OPNsense console'),
    /text installer or numbered console/,
  );
  assert.doesNotMatch(
    workspaceDirections('FW01 · OPNsense console'),
    /open a browser/,
  );
  assert.match(workspaceDirections('SQL01 · SSMS query editor'), /New Query/);
  assert.match(
    workspaceDirections('APP02 · Azure Windows PowerShell as administrator'),
    /In Azure portal/,
  );
  assert.doesNotMatch(
    workspaceDirections('APP02 · Azure Windows PowerShell as administrator'),
    /VMware/,
  );
  assert.match(
    workspaceDirections(
      'AlmaLinux 9 GNOME desktop → Activities → Terminal, unless the step names Windows or VMware',
    ),
    /Linux console/,
  );
  assert.match(
    workspaceDirections('PROXY01 · AlmaLinux terminal'),
    /not into Windows PowerShell/,
  );
});
test('Simple click paths become numbered actions without splitting literal paths, URLs or commands', () => {
  assert.deepEqual(learnerActions('Open Server Manager → Tools → DNS.'), [
    'Open Server Manager.',
    'Choose Tools.',
    'Choose DNS.',
  ]);
  assert.deepEqual(
    learnerActions('Open C:\\Lab\\notes.txt. Check 10.50.0.10.'),
    ['Open C:\\Lab\\notes.txt.', 'Check 10.50.0.10.'],
  );
  assert.deepEqual(learnerActions('Run .\\setup.exe /auto upgrade.'), [
    'Run .\\setup.exe /auto upgrade.',
  ]);
  assert.deepEqual(learnerActions('Open https://portal.azure.com.'), [
    'Open https://portal.azure.com.',
  ]);
});

test('Explanations stay with their action instead of becoming extra numbered tasks', () => {
  assert.deepEqual(
    learnerActions('Open Files. This is the visual file manager. Choose Home.'),
    ['Open Files. This is the visual file manager.', 'Choose Home.'],
  );
});
