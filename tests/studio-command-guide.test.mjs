import test from 'node:test';
import assert from 'node:assert/strict';
import {
  commandTeachingUnits,
  explainTeachingCommand,
} from '../lib/studio-command-guide.ts';

test('sequential teaching preserves quoted paths, variables and redirection', () => {
  const lines = [
    'mkdir -p "$HOME/sonic-admin/practice"',
    'cd "$HOME/sonic-admin"',
    'printf "Practice only\\n" > practice/readme.txt',
  ];
  assert.deepEqual(commandTeachingUnits(lines.join('\n')), lines);
});
test('a here-document remains one complete input with its closing delimiter', () => {
  const block =
    "sudo tee /etc/example.conf <<'EOF'\nsetting=yes\nEOF\nsudo systemctl daemon-reload";
  assert.deepEqual(commandTeachingUnits(block), [
    "sudo tee /etc/example.conf <<'EOF'\nsetting=yes\nEOF",
    'sudo systemctl daemon-reload',
  ]);
});
test('continuations, compound control flow and multiline strings are not cut apart', () => {
  for (const block of [
    'printf "%s" \\\nhello\npwd',
    'if test -d /tmp; then\npwd\nfi',
    'printf "first\nsecond"\npwd',
    'printf hello |\ncat',
  ])
    assert.deepEqual(commandTeachingUnits(block), [block]);
});
test('empty input never creates a command to run', () =>
  assert.deepEqual(commandTeachingUnits(' \n'), []));
test('version guidance distinguishes a root directory from a command prompt', () => {
  const note = explainTeachingCommand('cat /etc/redhat-release', {
    breakdown: [],
  });
  assert.match(note.what, /root directory/);
  assert.match(note.look, /version 9/);
});
test('sudo validation explains invisible password input and normal quiet success', () => {
  const note = explainTeachingCommand('sudo -v', { breakdown: [] });
  assert.match(note.what, /without making a system change/);
  assert.match(note.look, /Nothing appears while you type/);
  assert.match(note.look, /without an error/);
});

test('two here-documents keep their own closing markers and following command', () => {
  const first = "sudo tee /etc/first <<'EOF'\nOne\nEOF",
    second = "sudo tee /etc/second <<'EOF'\nTwo\nEOF";
  assert.deepEqual(commandTeachingUnits(first + '\n' + second + '\npwd'), [
    first,
    second,
    'pwd',
  ]);
});
test('every command in the preview course has a specific explanation and unchanged input', async () => {
  const { readFile } = await import('node:fs/promises');
  const course = JSON.parse(
    await readFile(
      new URL('../content/linux-admin/course.json', import.meta.url),
      'utf8',
    ),
  );
  for (const lesson of course.lessons)
    for (const step of lesson.steps) {
      if (!step.command) continue;
      const units = commandTeachingUnits(step.command);
      assert.equal(
        units.join('\n'),
        step.command,
        lesson.id + ': input changed',
      );
      for (const command of units)
        assert.doesNotMatch(
          explainTeachingCommand(command, step).what,
          /^Read this command alongside/,
          lesson.id + ': missing explanation for ' + command,
        );
    }
});
