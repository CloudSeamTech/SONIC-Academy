import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import catalog from '../content/commands/catalog.json' with { type: 'json' };
test('command references identify the correct shell, context, effects and expected result', () => {
  assert.equal(new Set(catalog.commands.map((c) => c.id)).size, 51);
  for (const c of catalog.commands) {
    for (const field of [
      'name',
      'definition',
      'example',
      'expected',
      'parts',
      'usage',
      'effect',
      'source',
      'directory',
      'prompt',
    ])
      assert.ok(c[field]?.length, `${c.id}: ${field}`);
    assert.ok(c.source.startsWith('https://'));
    assert.equal(c.platform === 'Linux', c.shell === 'Bash');
    if (c.shell === 'PowerShell') assert.ok(c.prompt.startsWith('PS C:'));
    if (c.shell === 'CMD')
      assert.ok(c.prompt.startsWith('C:') && !c.prompt.startsWith('PS'));
    if (c.shell === 'Bash') assert.ok(c.prompt.endsWith('$'));
    assert.doesNotMatch(
      c.example,
      /rm\s+-rf|Set-ExecutionPolicy|Invoke-Expression|curl.*\|\s*(?:bash|sh)/i,
    );
  }
  assert.match(
    catalog.commands.find((c) => c.id === 'linux-chmod').effect,
    /Changes/,
  );
  assert.match(
    catalog.commands.find((c) => c.id === 'linux-journalctl').example,
    /^sudo /,
  );
  assert.match(
    catalog.commands.find((c) => c.id === 'win-get-process').parts,
    /cumulative.*not current/,
  );
});
test('the printable reference includes both platforms, all commands and a functional print action', () => {
  const html = fs.readFileSync(
    new URL('../public/commands/cheat-sheet.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /window\.print\(\)/);
  assert.match(html, /@media print/);
  assert.match(html, /<h2>Windows<\/h2>/);
  assert.match(html, /<h2>Linux<\/h2>/);
  assert.match(html, /not captured terminal output/);
  for (const c of catalog.commands)
    assert.ok(html.includes(`<h3>${c.name} `), c.id);
});
test(
  'PowerShell reference examples parse without executing any commands',
  { skip: process.platform !== 'win32' },
  () => {
    const catalogPath = fileURLToPath(
      new URL('../content/commands/catalog.json', import.meta.url),
    ).replaceAll("'", "''");
    const script = `$items=(Get-Content -LiteralPath '${catalogPath}' -Raw|ConvertFrom-Json).commands; foreach($item in $items){if($item.shell -eq 'PowerShell'){$errors=$null;[System.Management.Automation.Language.Parser]::ParseInput($item.example,[ref]$null,[ref]$errors)>$null;if($errors.Count){Write-Error ($item.id+': '+($errors.Message -join '; '));exit 1}}}`;
    const r = spawnSync('pwsh', ['-NoProfile', '-Command', script], {
      encoding: 'utf8',
    });
    assert.equal(r.status, 0, r.stderr);
  },
);
