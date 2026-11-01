import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { LabLinkModel, ProtocolError } from './support/lab-link-model.mjs';
import demo from '../content/verification/dc01-demo.json' with { type: 'json' };
const plan = {
  hostname: 'DC01',
  ipv4: '10.50.0.10',
  prefix: 24,
  domain: 'lab.example.test',
  dns: '10.50.0.10',
};
const fixture = (now) => ({
  ...structuredClone(demo),
  demo: false,
  collectedAt: new Date(now).toISOString(),
});
const rejectsStatus = (fn, status) =>
  assert.throws(
    fn,
    (error) => error instanceof ProtocolError && error.status === status,
  );
test('pairing requires owner approval and the VM confirmation, not its public IP', () => {
  let now = Date.parse('2026-11-01T12:00:00Z');
  const m = new LabLinkModel(() => now);
  const ticket = m.create('student-a', 'lab-04', plan),
    vm = m.claim(ticket.enrollmentCode, 'DC01');
  assert.equal(m.poll(vm.deviceToken).job, null);
  rejectsStatus(() => m.request('student-a', ticket.pairingId), 409);
  rejectsStatus(
    () => m.approve('student-b', ticket.pairingId, vm.confirmationCode),
    404,
  );
  rejectsStatus(() => m.approve('student-a', ticket.pairingId, 'wrong'), 403);
  m.approve('student-a', ticket.pairingId, vm.confirmationCode);
  assert.equal(m.status('student-a', ticket.pairingId).connected, false);
  m.poll(vm.deviceToken);
  assert.equal(m.status('student-a', ticket.pairingId).connected, true);
  now += 45001;
  assert.equal(m.status('student-a', ticket.pairingId).connected, false);
});
test('codes are one-use, expire, and repeated wrong confirmations revoke pairing', () => {
  let now = 0;
  const m = new LabLinkModel(() => now);
  const t = m.create('a', 'lab-04', plan),
    v = m.claim(t.enrollmentCode, 'DC01');
  rejectsStatus(() => m.claim(t.enrollmentCode, 'other'), 401);
  for (let i = 0; i < 5; i++)
    rejectsStatus(() => m.approve('a', t.pairingId, 'wrong'), 403);
  rejectsStatus(() => m.poll(v.deviceToken), 401);
  const expired = m.create('b', 'lab-04', plan);
  now += 600001;
  rejectsStatus(() => m.claim(expired.enrollmentCode, 'DC01'), 401);
});
test('class scope, leases and revocation prevent arbitrary jobs and result replay', () => {
  let now = Date.parse('2026-11-01T12:00:00Z');
  const m = new LabLinkModel(() => now);
  rejectsStatus(() => m.create('a', 'unsupported', plan), 422);
  rejectsStatus(() => m.create('', 'lab-04', plan), 401);
  const t = m.create('a', 'lab-04', plan),
    v = m.claim(t.enrollmentCode, 'DC01');
  m.approve('a', t.pairingId, v.confirmationCode);
  const run = m.request('a', t.pairingId),
    job = m.poll(v.deviceToken).job;
  assert.deepEqual(
    Object.keys(job).sort(),
    ['checkSet', 'expiresAt', 'leaseToken', 'runId', 'version'].sort(),
  );
  rejectsStatus(
    () => m.submit(v.deviceToken, run.runId, 'wrong', fixture(now)),
    409,
  );
  rejectsStatus(
    () => m.submit(v.deviceToken, run.runId, job.leaseToken, demo),
    422,
  );
  const facts = fixture(now);
  facts.results = [{ id: 'dns-client', status: 'pass' }];
  facts.expected = { ...plan, dns: '10.50.0.99' };
  m.submit(v.deviceToken, run.runId, job.leaseToken, facts);
  assert.equal(
    m
      .results('a', t.pairingId, run.runId)
      .results.find((r) => r.id === 'dns-client').status,
    'fail',
  );
  rejectsStatus(
    () => m.submit(v.deviceToken, run.runId, job.leaseToken, facts),
    409,
  );
  rejectsStatus(() => m.results('b', t.pairingId, run.runId), 404);
  m.revoke('a', t.pairingId);
  rejectsStatus(() => m.poll(v.deviceToken), 401);
});
test('expired job leases cannot submit after a replacement lease is issued', () => {
  let now = Date.parse('2026-11-01T12:00:00Z');
  const m = new LabLinkModel(() => now);
  const t = m.create('a', 'lab-04', plan),
    v = m.claim(t.enrollmentCode, 'DC01');
  m.approve('a', t.pairingId, v.confirmationCode);
  const r = m.request('a', t.pairingId),
    old = m.poll(v.deviceToken).job;
  now += 120001;
  const replacement = m.poll(v.deviceToken).job;
  assert.notEqual(old.leaseToken, replacement.leaseToken);
  rejectsStatus(
    () => m.submit(v.deviceToken, r.runId, old.leaseToken, fixture(now)),
    409,
  );
  m.submit(v.deviceToken, r.runId, replacement.leaseToken, fixture(now));
});
test('local HTTP simulation: the checker initiates each exchange and receives only an allowlisted job', async () => {
  // Loopback HTTP fixture, NOT production TLS, NAT or real Supabase authentication.
  const now = Date.parse('2026-11-01T12:00:00Z'),
    m = new LabLinkModel(() => now);
  const server = http.createServer(async (req, res) => {
    try {
      let text = '';
      for await (const chunk of req) {
        text += chunk;
        if (text.length > 131072) throw new ProtocolError(413, 'Too large');
      }
      const b = text ? JSON.parse(text) : {},
        token = req.headers.authorization?.replace(/^Bearer /, '');
      let result;
      // Fixed test identities only. Production must verify Supabase sessions.
      const owner =
        token === 'TEST-STUDENT-A'
          ? 'a'
          : token === 'TEST-STUDENT-B'
            ? 'b'
            : null;
      switch (req.url) {
        case '/tickets':
          result = m.create(owner, b.lessonId, b.expected);
          break;
        case '/enroll':
          result = m.claim(b.code, b.hostname);
          break;
        case '/approve':
          result = m.approve(owner, b.pairingId, b.confirmationCode);
          break;
        case '/runs':
          result = m.request(owner, b.pairingId);
          break;
        case '/poll':
          result = m.poll(token);
          break;
        case '/results':
          result = m.submit(token, b.runId, b.leaseToken, b.report);
          break;
        default:
          throw new ProtocolError(404, 'Not found');
      }
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(error.status ?? 400, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (route, token, body) => {
    const response = await fetch(base + route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    const t = (
      await request('/tickets', 'TEST-STUDENT-A', {
        lessonId: 'lab-04',
        expected: plan,
      })
    ).body;
    const vm = (
      await request('/enroll', '', { code: t.enrollmentCode, hostname: 'DC01' })
    ).body;
    assert.equal(
      (
        await request('/approve', 'TEST-STUDENT-B', {
          pairingId: t.pairingId,
          confirmationCode: vm.confirmationCode,
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request('/approve', 'TEST-STUDENT-A', {
          pairingId: t.pairingId,
          confirmationCode: vm.confirmationCode,
        })
      ).status,
      200,
    );
    const run = (
      await request('/runs', 'TEST-STUDENT-A', { pairingId: t.pairingId })
    ).body;
    const job = (await request('/poll', vm.deviceToken, {})).body.job;
    assert.equal(job.runId, run.runId);
    assert.equal(job.checkSet, 'windows-dc01');
    assert.equal('script' in job, false);
    assert.equal(
      (
        await request('/results', vm.deviceToken, {
          runId: run.runId,
          leaseToken: job.leaseToken,
          report: fixture(now),
        })
      ).status,
      200,
    );
    assert.equal(m.results('a', t.pairingId, run.runId).state, 'completed');
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
