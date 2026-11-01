// Executable protocol specification for tests ONLY. No production API imports this
// in-memory model. It does not authenticate real students or connect real VMs.
import { randomBytes, randomInt, randomUUID, createHash } from 'node:crypto';
import {
  parseLocalLabReport,
  checkDC01,
  validateDC01Expected,
} from '../../lib/lab-verification.ts';
const digest = (value) =>
  createHash('sha256').update(String(value)).digest('hex');
const secret = () => randomBytes(32).toString('base64url');
export class ProtocolError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new ProtocolError(status, message);
};
export class LabLinkModel {
  #tickets = new Map();
  #runs = new Map();
  constructor(now = () => Date.now()) {
    this.now = now;
  }
  #owned(owner, id) {
    if (!owner) fail(401, 'Sign in');
    const t = this.#tickets.get(id);
    if (!t || t.owner !== owner) fail(404, 'Pairing not found');
    return t;
  }
  #device(token) {
    const t = [...this.#tickets.values()].find(
      (t) => t.deviceHash && t.deviceHash === digest(token),
    );
    if (!t || t.state === 'revoked' || this.now() >= t.deviceExpires)
      fail(401, 'Device session unavailable');
    return t;
  }
  create(owner, lessonId, expected) {
    if (!owner) fail(401, 'Sign in');
    if (lessonId !== 'lab-04') fail(422, 'Unsupported class');
    const invalid = validateDC01Expected(expected);
    if (invalid) fail(422, invalid);
    if (
      [...this.#tickets.values()].filter(
        (t) =>
          t.owner === owner &&
          t.state !== 'revoked' &&
          t.created + 3600000 > this.now(),
      ).length >= 5
    )
      fail(429, 'Too many sessions');
    const code = randomBytes(10).toString('hex').toUpperCase();
    const t = {
      id: randomUUID(),
      owner,
      lessonId,
      expected: structuredClone(expected),
      created: this.now(),
      codeHash: digest(code),
      enrollmentExpires: this.now() + 600000,
      state: 'waiting-for-checker',
      deviceHash: null,
      lastSeen: null,
    };
    this.#tickets.set(t.id, t);
    return {
      pairingId: t.id,
      enrollmentCode: code.match(/.{4}/g).join('-'),
      expiresAt: t.enrollmentExpires,
    };
  }
  claim(code, hostname) {
    const normalized = String(code).replaceAll('-', '').toUpperCase();
    if (!/^[A-F0-9]{20}$/.test(normalized))
      fail(400, 'Invalid enrollment code');
    if (typeof hostname !== 'string' || !/^[A-Za-z0-9-]{1,63}$/.test(hostname))
      fail(400, 'Invalid device label');
    const t = [...this.#tickets.values()].find(
      (t) => t.codeHash === digest(normalized),
    );
    if (
      !t ||
      t.state !== 'waiting-for-checker' ||
      this.now() >= t.enrollmentExpires
    )
      fail(401, 'Enrollment unavailable');
    const token = secret(),
      confirmation = String(randomInt(100000, 1000000));
    t.codeHash = null;
    t.state = 'awaiting-approval';
    t.hostname = hostname;
    t.deviceHash = digest(token);
    t.confirmHash = digest(confirmation);
    t.confirmAttempts = 0;
    t.deviceExpires = this.now() + 3600000;
    return {
      pairingId: t.id,
      deviceToken: token,
      confirmationCode: confirmation,
      state: t.state,
    };
  }
  approve(owner, id, confirmation) {
    const t = this.#owned(owner, id);
    if (t.state !== 'awaiting-approval' || this.now() >= t.enrollmentExpires)
      fail(409, 'Approval unavailable');
    if (digest(confirmation) !== t.confirmHash) {
      t.confirmAttempts++;
      if (t.confirmAttempts >= 5) {
        t.state = 'revoked';
        t.deviceHash = null;
      }
      fail(403, 'Confirmation does not match');
    }
    t.confirmHash = null;
    t.state = 'paired';
    return this.status(owner, id);
  }
  status(owner, id) {
    const t = this.#owned(owner, id);
    return {
      pairingId: t.id,
      hostname: t.hostname ?? null,
      state:
        t.state === 'paired' && this.now() >= t.deviceExpires
          ? 'expired'
          : t.state,
      lastSeenAt: t.lastSeen,
      connected:
        t.state === 'paired' &&
        this.now() < t.deviceExpires &&
        t.lastSeen !== null &&
        this.now() - t.lastSeen < 45000,
    };
  }
  request(owner, id) {
    const t = this.#owned(owner, id);
    if (t.state !== 'paired' || this.now() >= t.deviceExpires)
      fail(409, 'Pair first');
    if (
      [...this.#runs.values()].some(
        (r) => r.pairingId === id && ['queued', 'leased'].includes(r.state),
      )
    )
      fail(409, 'A check is already pending');
    const run = {
      id: randomUUID(),
      pairingId: id,
      state: 'queued',
      expected: structuredClone(t.expected),
    };
    this.#runs.set(run.id, run);
    return { runId: run.id, state: run.state };
  }
  poll(token) {
    const t = this.#device(token);
    if (t.state !== 'paired') return { state: 'awaiting-approval', job: null };
    t.lastSeen = this.now();
    const run = [...this.#runs.values()].find(
      (r) =>
        r.pairingId === t.id &&
        (r.state === 'queued' ||
          (r.state === 'leased' && this.now() >= r.leaseExpires)),
    );
    if (!run) return { state: 'paired', job: null };
    const lease = secret();
    run.state = 'leased';
    run.leaseHash = digest(lease);
    run.leaseExpires = this.now() + 120000;
    return {
      state: 'paired',
      job: {
        runId: run.id,
        checkSet: 'windows-dc01',
        version: '1.0.0',
        leaseToken: lease,
        expiresAt: run.leaseExpires,
      },
    };
  }
  submit(token, runId, leaseToken, body) {
    const t = this.#device(token),
      run = this.#runs.get(runId);
    if (t.state !== 'paired' || !run || run.pairingId !== t.id)
      fail(404, 'Run not found');
    if (
      run.state !== 'leased' ||
      this.now() >= run.leaseExpires ||
      digest(leaseToken) !== run.leaseHash
    )
      fail(409, 'Lease unavailable');
    const report = parseLocalLabReport(JSON.stringify(body));
    if (report.demo) fail(422, 'Demo report is not live evidence');
    // Evaluate observed facts, never a submitted pass flag or submitted expectations.
    run.results = checkDC01(report, run.expected, this.now());
    run.state = 'completed';
    run.leaseHash = null;
    return { runId, state: run.state };
  }
  results(owner, id, runId) {
    this.#owned(owner, id);
    const r = this.#runs.get(runId);
    if (!r || r.pairingId !== id) fail(404, 'Run not found');
    return { state: r.state, results: r.results ?? [] };
  }
  revoke(owner, id) {
    const t = this.#owned(owner, id);
    t.state = 'revoked';
    t.codeHash = null;
    t.deviceHash = null;
    t.confirmHash = null;
    for (const r of this.#runs.values())
      if (r.pairingId === id && r.state !== 'completed') {
        r.state = 'cancelled';
        r.leaseHash = null;
      }
    return { state: 'revoked' };
  }
}
