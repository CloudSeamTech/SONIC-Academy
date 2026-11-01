import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import sample from '../content/verification/dc01-demo.json' with { type: 'json' };
import manifest from '../content/teaching/verifier-manifest.json' with { type: 'json' };
import {
  parseLocalLabReport,
  checkDC01,
  validateDC01Expected,
} from '../lib/lab-verification.ts';
const expected = {
  hostname: 'DC01',
  ipv4: '10.50.0.10',
  prefix: 24,
  domain: 'lab.example.test',
  dns: '10.50.0.10',
};
const now = Date.parse('2026-01-01T12:01:00Z');
const report = () => parseLocalLabReport(JSON.stringify(sample));
test('observations produce individual passes, failure and an explicit unsupported check', () => {
  const result = checkDC01(report(), expected, now);
  assert.equal(result.filter((r) => r.status === 'pass').length, 9);
  assert.equal(result.find((r) => r.id === 'dns-client').status, 'fail');
  assert.equal(
    result.find((r) => r.id === 'replication').status,
    'not-checked',
  );
  const fixed = report();
  fixed.facts.adapters.value[0].dns = ['10.50.0.10'];
  assert.equal(
    checkDC01(fixed, expected, now).filter((r) => r.status === 'pass').length,
    10,
  );
});
test('stale or future evidence cannot pass; report-provided pass flags are ignored', () => {
  assert.ok(
    checkDC01(report(), expected, now + 25 * 3600000).every(
      (r) => r.status === 'not-checked',
    ),
  );
  assert.ok(
    checkDC01(report(), expected, now - 3600000).every(
      (r) => r.status === 'not-checked',
    ),
  );
  const forged = report();
  forged.results = [{ id: 'dns-client', status: 'pass' }];
  assert.equal(
    checkDC01(forged, expected, now).find((r) => r.id === 'dns-client').status,
    'fail',
  );
});
test('missing tools remain unknown, absent roles fail, and malformed adapter entries never execute or crash', () => {
  const r = report();
  r.facts.controller = { status: 'unavailable', value: null };
  r.facts.roles.value = [];
  r.facts.adapters.value[0].addresses.unshift(null);
  const result = checkDC01(r, expected, now);
  assert.equal(result.find((r) => r.id === 'identity').status, 'not-checked');
  assert.equal(result.find((r) => r.id === 'roles').status, 'fail');
  assert.equal(result.find((r) => r.id === 'ipv4').status, 'pass');
});
test('report parser rejects wrong packs, missing facts, invalid times and excessive files', () => {
  assert.equal(
    parseLocalLabReport('\uFEFF' + JSON.stringify(sample)).packId,
    'windows-dc01',
  );
  for (const update of [
    { packId: 'other' },
    { schemaVersion: 2 },
    { facts: {} },
    { collectedAt: 'not-a-date' },
  ])
    assert.throws(() =>
      parseLocalLabReport(JSON.stringify({ ...sample, ...update })),
    );
  assert.throws(() => parseLocalLabReport(' '.repeat(131073)));
  assert.match(
    validateDC01Expected({ ...expected, hostname: 'dc01.lab.example.test' }),
    /short Windows/,
  );
  assert.match(
    validateDC01Expected({ ...expected, ipv4: '999.1.1.1' }),
    /IPv4/,
  );
});

test('a missing expected adapter fails the IP check and blocks its dependent DNS check', () => {
  const r = report();
  r.facts.adapters.value = [];
  const checks = checkDC01(r, expected, now);
  assert.equal(checks.find((c) => c.id === 'ipv4').status, 'fail');
  assert.equal(checks.find((c) => c.id === 'dns-client').status, 'not-checked');
});
test('download hash matches collector bytes and collector has no remoting, upload or policy bypass', () => {
  const source = fs.readFileSync(
    new URL('../public/verification/CloudSeam-DC01-Check.ps1', import.meta.url),
  );
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    manifest.sha256,
  );
  assert.doesNotMatch(
    source.toString(),
    /Invoke-(?:Expression|Command|WebRequest|RestMethod)|Enable-PSRemoting|Set-ExecutionPolicy|ExecutionPolicy\s+Bypass|Install-WindowsFeature|New-NetFirewallRule/i,
  );
  assert.match(source.toString(), /unsigned preview/);
});
test(
  'PowerShell collector serializes real script output using explicit test doubles',
  { skip: process.platform !== 'win32' },
  () => {
    const output = fs.mkdtempSync(
      path.join(os.tmpdir(), 'cloudseam-verifier-test-'),
    );
    const collector = fileURLToPath(
      new URL(
        '../public/verification/CloudSeam-DC01-Check.ps1',
        import.meta.url,
      ),
    );
    const driver = fileURLToPath(
      new URL('../tools/test-dc01-collector.ps1', import.meta.url),
    );
    const run = spawnSync(
      'pwsh',
      [
        '-NoProfile',
        '-File',
        driver,
        '-Collector',
        collector,
        '-OutputDirectory',
        output,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(run.status, 0, run.stderr);
    const files = fs.readdirSync(output);
    assert.equal(files.length, 1);
    const r = parseLocalLabReport(
      fs.readFileSync(path.join(output, files[0]), 'utf8'),
    );
    const result = checkDC01(r, expected, Date.parse(r.collectedAt));
    assert.equal(
      result.filter((r) => r.status === 'pass').length,
      10,
      JSON.stringify(result),
    );
    assert.equal(result.at(-1).status, 'not-checked');
  },
);
