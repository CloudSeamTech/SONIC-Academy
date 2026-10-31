import test from 'node:test';
import assert from 'node:assert/strict';
import { teachingInputs } from '../lib/teaching-inputs.ts';
import { terminalLines } from '../lib/terminal-presentation.ts';
import { explainTeachingCommand } from '../lib/studio-command-guide.ts';

test('sequential inputs retain their original line positions and changed directory prompts', () => {
  const command = 'pwd\n\ncd /tmp\npwd';
  const units = teachingInputs(command, 'bash');
  assert.deepEqual(
    units.map((x) => x.startLine),
    [0, 2, 3],
  );
  const lines = terminalLines(command, {
    shell: 'bash',
    directory: '~',
    user: 'learner',
    host: 'lab',
  });
  assert.match(lines[units[2].startLine].prompt, /\/tmp/);
});

test('PowerShell, SQL and unknown inputs remain complete blocks', () => {
  const input = 'Get-Process | `\n  Select-Object Name';
  for (const shell of ['powershell', 'sql', undefined])
    assert.deepEqual(teachingInputs(input, shell), [
      { text: input, startLine: 0, lineCount: 2 },
    ]);
});

test('a multiline control block is never described as writing a tee file', () => {
  const input = 'if true; then\n  pwd\nfi';
  assert.equal(teachingInputs(input, 'bash').length, 1);
  assert.doesNotMatch(
    explainTeachingCommand(input, { breakdown: [] }).what,
    /tee|write the practice file/,
  );
});
