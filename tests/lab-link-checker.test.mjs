import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const script = new URL(
  '../checker/windows/CloudSeam-LabLink.ps1',
  import.meta.url,
);
test('checker source pins its origin/publisher, refuses unreleased execution and accepts only bundled pack identifiers', () => {
  const source = readFileSync(script, 'utf8');
  assert.match(source, /RELEASE_CERTIFICATE_THUMBPRINT_NOT_CONFIGURED/);
  assert.match(source, /Get-AuthenticodeSignature/);
  assert.match(source, /\$ServiceOrigin = 'https:\/\/cloudseam.tech'/);
  assert.match(source, /-MaximumRedirection 0/);
  assert.match(source, /\$job.checkSet -ne 'windows-dc01'/);
  assert.doesNotMatch(
    source,
    /Invoke-Expression|Invoke-Command|Set-ExecutionPolicy|ExecutionPolicy\s+Bypass|Start-Process|New-NetFirewallRule|Enable-PSRemoting|Remove-Item[^\r\n]*-Recurse/i,
  );
  assert.ok(
    source.indexOf("throw 'This is unreleased source") <
      source.indexOf('Invoke-RestMethod'),
  );
});
test(
  'PowerShell parses the actual client and confirms the release gate stops it before a network request',
  { skip: process.platform !== 'win32' },
  () => {
    const result = spawnSync(
      'pwsh',
      [
        '-NoProfile',
        '-File',
        fileURLToPath(
          new URL('../tools/test-lab-link-source.ps1', import.meta.url),
        ),
        '-Source',
        fileURLToPath(script),
      ],
      { encoding: 'utf8', timeout: 10000 },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /refused execution before networking/);
  },
);
