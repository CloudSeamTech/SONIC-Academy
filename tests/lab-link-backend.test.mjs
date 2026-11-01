import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createLabLinkHandler,
  labLinkConfig,
  hashSecret,
} from '../lib/lab-link-server.ts';
import reportFixture from '../content/verification/dc01-demo.json' with { type: 'json' };

const origin = 'https://academy.example.test';
const cfg = {
  origin,
  url: 'https://project.supabase.co',
  publishableKey: 'sb_publishable_test',
  secretKey: 'sb_secret_test',
};
const owner = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const other = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const token = 'student-session-for-test-only';
const otherToken = 'other-student-session-for-test';
const expected = {
  hostname: 'DC01',
  ipv4: '10.50.0.10',
  prefix: 24,
  domain: 'lab.example.test',
  dns: '10.50.0.10',
};
function request(path, body, auth = token, method = 'POST', extra = {}) {
  return new Request(`${origin}/api/lab-link/${path}`, {
    method,
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...extra,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
test('live API fails closed, rejects cross-origin, malformed and oversized requests without a database call', async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    throw new Error('Must not call');
  };
  assert.equal(labLinkConfig({}), null);
  assert.equal(labLinkConfig({ LAB_LINK_ENABLED: 'true' }), null);
  assert.equal(
    labLinkConfig({
      LAB_LINK_ENABLED: 'true',
      LAB_LINK_RELEASE_APPROVED: 'true',
      SUPABASE_URL: 'http://project',
      SUPABASE_PUBLISHABLE_KEY: 'x',
      SUPABASE_SECRET_KEY: 'y',
      LAB_LINK_SITE_ORIGIN: origin,
    }),
    null,
  );
  const disabled = createLabLinkHandler({ config: () => null, fetcher });
  assert.equal(
    (await disabled(request('pairings', {}), ['pairings'])).status,
    503,
  );
  const handle = createLabLinkHandler({ config: () => cfg, fetcher });
  assert.equal(
    (
      await handle(
        request('pairings', {}, token, 'POST', {
          Origin: 'https://foreign.test',
        }),
        ['pairings'],
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handle(request('pairings', { padding: 'x'.repeat(140001) }), [
        'pairings',
      ])
    ).status,
    413,
  );
  assert.equal(
    (await handle(request('pairings', {}, null), ['pairings'])).status,
    401,
  );
  assert.equal(calls, 0);
});

test('release requires approved configuration and a same-site, versioned checker manifest', () => {
  const env = {
    LAB_LINK_ENABLED: 'true',
    LAB_LINK_RELEASE_APPROVED: 'true',
    SUPABASE_URL: cfg.url,
    SUPABASE_PUBLISHABLE_KEY: cfg.publishableKey,
    SUPABASE_SECRET_KEY: cfg.secretKey,
    LAB_LINK_SITE_ORIGIN: origin,
  };
  assert.equal(
    labLinkConfig(env),
    null,
    'unreleased tracked manifest blocks enablement',
  );
  const release = {
    status: 'released',
    version: '0.1.0',
    downloadUrl: `${origin}/verification/releases/0.1.0.zip`,
    sha256: 'a'.repeat(64),
    publisher: 'Test fixture publisher',
    signerThumbprint: 'b'.repeat(40),
  };
  assert.equal(labLinkConfig(env, release).release.version, '0.1.0');
  assert.equal(
    labLinkConfig(env, {
      ...release,
      downloadUrl: 'https://foreign.test/verification/releases/0.1.0.zip',
    }),
    null,
  );
  assert.equal(
    labLinkConfig({ ...env, LAB_LINK_RELEASE_APPROVED: 'false' }, release),
    null,
  );
});

test('email sign-in delegates OTP verification to Supabase and never returns refresh credentials', async () => {
  const calls = [];
  const handler = createLabLinkHandler({
    config: () => cfg,
    fetcher: async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      assert.equal(init.headers.apikey, cfg.publishableKey);
      if (url.endsWith('/otp')) return Response.json({});
      return Response.json({
        access_token: token,
        refresh_token: 'never-return-to-browser',
        expires_in: 3600,
      });
    },
  });
  assert.equal(
    (
      await handler(
        request('login/start', { email: 'student@example.test' }, null),
        ['login', 'start'],
      )
    ).status,
    200,
  );
  const response = await handler(
    request(
      'login/verify',
      { email: 'student@example.test', code: '123456' },
      null,
    ),
    ['login', 'verify'],
  );
  assert.deepEqual(await response.json(), {
    accessToken: token,
    expiresIn: 3600,
  });
  assert.equal(calls[1].body.type, 'email');
});

let PGlite;
try {
  ({ PGlite } = await import(
    process.env.LAB_LINK_PGLITE_MODULE ??
      new URL(
        '../work/lab-link-tests/node_modules/@electric-sql/pglite/dist/index.js',
        import.meta.url,
      ).href
  ));
} catch {
  /* Optional isolated test engine; CI installs it explicitly. */
}
test(
  'PostgreSQL migration + real API adapter: approval, ownership, lease replay, revocation and RLS',
  {
    skip:
      !PGlite &&
      'Install the isolated PGlite test engine; see docs/lab-link-setup.md.',
  },
  async () => {
    const db = new PGlite();
    try {
      await db.exec(
        `create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values('${owner}'),('${other}');`,
      );
      await db.exec(
        await readFile(
          new URL(
            '../supabase/migrations/202611010001_lab_link.sql',
            import.meta.url,
          ),
          'utf8',
        ),
      );
      const call = async (op, arg) =>
        (
          await db.query('select public.lab_link_rpc($1,$2::jsonb) as result', [
            op,
            JSON.stringify(arg),
          ])
        ).rows[0].result;
      const seen = [];
      const fetcher = async (url, init) => {
        if (url.endsWith('/auth/v1/user')) {
          const auth = init.headers.Authorization;
          if (![`Bearer ${token}`, `Bearer ${otherToken}`].includes(auth))
            return Response.json({}, { status: 401 });
          return Response.json({
            id: auth === `Bearer ${token}` ? owner : other,
          });
        }
        assert.ok(url.endsWith('/rest/v1/rpc/lab_link_rpc'));
        assert.equal(init.headers.apikey, cfg.secretKey);
        assert.equal(
          init.headers.Authorization,
          undefined,
          'new Supabase secret keys must not be bearer JWTs',
        );
        const { op, arg } = JSON.parse(init.body);
        seen.push({ op, arg });
        return Response.json(await call(op, arg));
      };
      const handler = createLabLinkHandler({ config: () => cfg, fetcher });
      const api = async (path, body, auth = token, method = 'POST') => {
        const response = await handler(
          request(path, body, auth, method),
          path.split('/'),
        );
        return { status: response.status, body: await response.json() };
      };
      let response = await api('pairings', {
        lessonId: 'lab-04',
        expected,
        owner: other,
      });
      assert.equal(response.status, 200);
      const { pairingId, enrollmentCode } = response.body;
      assert.equal(
        (await db.query('select owner_id,code_hash from lab_link.pairings'))
          .rows[0].owner_id,
        owner,
        'body owner cannot replace verified identity',
      );
      const enrolled = await api(
        'enroll',
        { code: enrollmentCode, hostname: 'DC01' },
        null,
      );
      assert.equal(enrolled.status, 200);
      const { deviceToken, confirmation } = enrolled.body;
      assert.equal(
        (await api('enroll', { code: enrollmentCode, hostname: 'DC01' }, null))
          .status,
        401,
      );
      assert.equal((await api('poll', {}, deviceToken)).body.job, null);
      assert.equal(
        (
          await api(
            `pairings/${pairingId}/approve`,
            { confirmation },
            otherToken,
          )
        ).status,
        404,
      );
      assert.equal(
        (await api(`pairings/${pairingId}/approve`, { confirmation })).status,
        200,
      );
      assert.equal(
        (await api(`pairings/${pairingId}`, undefined, token, 'GET')).body
          .connected,
        false,
      );
      await api('poll', {}, deviceToken);
      assert.equal(
        (await api(`pairings/${pairingId}`, undefined, token, 'GET')).body
          .connected,
        true,
      );
      assert.equal((await api(`pairings/${pairingId}/runs`, {})).status, 200);
      assert.equal((await api(`pairings/${pairingId}/runs`, {})).status, 409);
      const { job } = (await api('poll', {}, deviceToken)).body;
      assert.deepEqual(
        Object.keys(job).sort(),
        ['checkSet', 'expiresAt', 'leaseToken', 'runId', 'version'].sort(),
      );
      const report = structuredClone(reportFixture);
      report.demo = false;
      report.collectedAt = new Date().toISOString();
      report.pass = true;
      report.expected = { hostname: 'FORGED' };
      const submit = `runs/${job.runId}/observations`;
      assert.equal(
        (
          await api(
            submit,
            { leaseToken: job.leaseToken, report: { ...report, demo: true } },
            deviceToken,
          )
        ).status,
        422,
      );
      assert.equal(
        (await api(submit, { leaseToken: job.leaseToken, report }, deviceToken))
          .status,
        200,
      );
      assert.equal(
        (await api(submit, { leaseToken: job.leaseToken, report }, deviceToken))
          .status,
        409,
      );
      const result = await api(
        `pairings/${pairingId}/runs/${job.runId}`,
        undefined,
        token,
        'GET',
      );
      assert.equal(result.body.state, 'complete');
      assert.ok(result.body.result.checks.some((c) => c.status === 'fail'));
      assert.equal(
        (
          await api(
            `pairings/${pairingId}/runs/${job.runId}`,
            undefined,
            otherToken,
            'GET',
          )
        ).status,
        404,
      );
      await api(`pairings/${pairingId}`, undefined, token, 'DELETE');
      assert.equal((await api('poll', {}, deviceToken)).status, 401);
      assert.ok(
        seen.every(({ arg }) => !JSON.stringify(arg).includes(deviceToken)),
        'only hashes enter the database',
      );
      const privileges = await db.query(
        `select has_function_privilege('anon','public.lab_link_rpc(text,jsonb)','execute') as anon, has_function_privilege('authenticated','public.lab_link_rpc(text,jsonb)','execute') as student, has_function_privilege('service_role','public.lab_link_rpc(text,jsonb)','execute') as server`,
      );
      assert.deepEqual(privileges.rows[0], {
        anon: false,
        student: false,
        server: true,
      });
      await db.exec('set role authenticated');
      try {
        await assert.rejects(
          db.query("select public.lab_link_rpc('list','{}')"),
          /permission denied/,
        );
        await assert.rejects(
          db.query('select * from lab_link.pairings'),
          /permission denied/,
        );
      } finally {
        await db.exec('reset role');
      }
      const rls = await db.query(
        `select relrowsecurity from pg_class join pg_namespace on relnamespace=pg_namespace.oid where nspname='lab_link' and relname in ('pairings','runs','audit')`,
      );
      assert.equal(rls.rows.length, 3);
      assert.ok(rls.rows.every((r) => r.relrowsecurity));
      // Retry counters must survive failed confirmations, rather than rolling back.
      const pending = await api('pairings', { lessonId: 'lab-04', expected });
      const claim = await api(
        'enroll',
        { code: pending.body.enrollmentCode, hostname: 'DC02' },
        null,
      );
      for (let i = 0; i < 5; i++)
        assert.equal(
          (
            await api(`pairings/${pending.body.pairingId}/approve`, {
              confirmation: '000000',
            })
          ).status,
          403,
        );
      assert.equal((await api('poll', {}, claim.body.deviceToken)).status, 401);
      // Expiry uses database time, not a browser-provided timestamp.
      const expired = await api('pairings', { lessonId: 'lab-04', expected });
      await db.query(
        `update lab_link.pairings set enrollment_expires=now()-interval '1 second' where id=$1`,
        [expired.body.pairingId],
      );
      assert.equal(
        (
          await api(
            'enroll',
            { code: expired.body.enrollmentCode, hostname: 'DC01' },
            null,
          )
        ).status,
        401,
      );
      assert.equal(hashSecret(deviceToken).length, 64);
    } finally {
      await db.close();
    }
  },
);
