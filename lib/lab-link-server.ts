// Server-only adapter. Do not import into client components.
import { createHash, randomBytes, randomInt } from 'node:crypto';
import releaseManifest from '../config/lab-link-release.json' with { type: 'json' };
import {
  checkDC01,
  parseLocalLabReport,
  validateDC01Expected,
  type DC01Expected,
} from './lab-verification.ts';

type Payload = Record<string, unknown>;
type Config = {
  url: string;
  publishableKey: string;
  secretKey: string;
  origin: string;
  release: {
    version: string;
    downloadUrl: string;
    sha256: string;
    publisher: string;
    signerThumbprint: string;
  };
};
export class LabLinkError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
function fail(status: number, message: string): never {
  throw new LabLinkError(status, message);
}
export const hashSecret = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const secret = () => randomBytes(32).toString('base64url');
const uuid = (v: unknown) =>
  typeof v === 'string' &&
  /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
const string = (v: unknown, max = 200) =>
  typeof v === 'string' && v.length <= max ? v : '';
export function labLinkConfig(
  env = process.env,
  release: {
    status: string;
    version: string;
    downloadUrl: string | null;
    sha256: string | null;
    publisher: string | null;
    signerThumbprint: string | null;
  } = releaseManifest,
): Config | null {
  if (
    env.LAB_LINK_ENABLED !== 'true' ||
    env.LAB_LINK_RELEASE_APPROVED !== 'true'
  )
    return null;
  const {
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SECRET_KEY: secretKey,
    LAB_LINK_SITE_ORIGIN: origin,
  } = env;
  if (!url || !publishableKey || !secretKey || !origin) return null;
  try {
    const u = new URL(url),
      o = new URL(origin);
    if (
      u.protocol !== 'https:' ||
      o.protocol !== 'https:' ||
      u.username ||
      u.password ||
      u.search ||
      u.hash ||
      u.pathname !== '/' ||
      o.origin !== origin
    )
      return null;
    if (
      release.status !== 'released' ||
      !release.downloadUrl ||
      !release.publisher?.trim() ||
      !release.sha256 ||
      !/^[a-f0-9]{64}$/i.test(release.sha256) ||
      !release.signerThumbprint ||
      !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(release.signerThumbprint)
    )
      return null;
    const download = new URL(release.downloadUrl);
    if (
      download.origin !== origin ||
      download.search ||
      download.hash ||
      !download.pathname.startsWith('/verification/releases/') ||
      !download.pathname.endsWith('.zip')
    )
      return null;
    return {
      url: u.origin,
      publishableKey,
      secretKey,
      origin,
      release: {
        version: release.version,
        downloadUrl: release.downloadUrl,
        sha256: release.sha256,
        publisher: release.publisher,
        signerThumbprint: release.signerThumbprint,
      },
    };
  } catch {
    return null;
  }
}
export function createLabLinkHandler({
  config = labLinkConfig,
  fetcher = fetch,
}: { config?: () => Config | null; fetcher?: typeof fetch } = {}) {
  return async function handle(
    request: Request,
    path: string[],
  ): Promise<Response> {
    const reply = (data: unknown, status = 200) =>
      Response.json(data, {
        status,
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    try {
      const c = config();
      if (!c)
        return reply(
          {
            available: false,
            error: 'Live checking is not released. Use local-report mode.',
          },
          503,
        );
      const key = path.join('/'),
        method = request.method;
      const deviceRoute =
        ['enroll', 'poll'].includes(key) ||
        /^runs\/[^/]+\/observations$/.test(key);
      if (
        request.headers.get('origin') &&
        request.headers.get('origin') !== c.origin
      )
        fail(403, 'Use your CloudSeam website.');
      if (
        !deviceRoute &&
        method !== 'GET' &&
        request.headers.get('origin') !== c.origin
      )
        fail(403, 'Use your CloudSeam website.');
      const token = request.headers
        .get('authorization')
        ?.match(/^Bearer ([A-Za-z0-9._~-]{20,4096})$/)?.[1];
      let body: Payload = {};
      if (method === 'POST') {
        if (
          !request.headers.get('content-type')?.startsWith('application/json')
        )
          fail(415, 'Use JSON.');
        // Bound the actual stream, not only an optional Content-Length header.
        const reader = request.body?.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        if (reader) {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 140000) {
              await reader.cancel();
              fail(413, 'Request is too large.');
            }
            chunks.push(value);
          }
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.length;
        }
        try {
          const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            fail(400, 'Use a JSON object.');
          body = parsed as Payload;
        } catch {
          fail(400, 'Invalid JSON request.');
        }
      }
      async function upstream(
        url: string,
        init: RequestInit,
        auth = false,
      ): Promise<Payload> {
        const response = await fetcher(url, {
          ...init,
          cache: 'no-store',
          redirect: 'error',
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
          fail(
            auth && [400, 401, 422].includes(response.status)
              ? 401
              : response.status === 429
                ? 429
                : 503,
            auth
              ? 'Sign-in could not be completed. Check the code or try again.'
              : 'Checking service unavailable. Try again.',
          );
        return (await response.json()) as Payload;
      }
      const authHeaders = {
        apikey: c.publishableKey,
        'Content-Type': 'application/json',
      };
      if (key === 'login/start' && method === 'POST') {
        const email = string(body.email, 254).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          fail(400, 'Enter your email address.');
        await upstream(
          `${c.url}/auth/v1/otp`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ email, create_user: true }),
          },
          true,
        );
        return reply({
          message:
            'If email sign-in is available, check your inbox for the code.',
        });
      }
      if (key === 'login/verify' && method === 'POST') {
        const email = string(body.email, 254).trim(),
          code = string(body.code, 8);
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          !/^\d{6,8}$/.test(code)
        )
          fail(400, 'Enter your email and the emailed code.');
        const session = await upstream(
          `${c.url}/auth/v1/verify`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ email, token: code, type: 'email' }),
          },
          true,
        );
        if (typeof session.access_token !== 'string' || !session.access_token)
          fail(503, 'The sign-in provider did not return a session.');
        // Access token only, retained in browser memory. No refresh token is exposed.
        return reply({
          accessToken: session.access_token,
          expiresIn: session.expires_in,
        });
      }
      if (key === 'availability' && method === 'GET')
        return reply({
          available: true,
          packs: ['lab-04'],
          release: c.release,
        });
      const backend = c;
      async function rpc(op: string, arg: Payload) {
        const result = await upstream(
          `${backend.url}/rest/v1/rpc/lab_link_rpc`,
          {
            method: 'POST',
            headers: {
              apikey: backend.secretKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ op, arg }),
          },
        );
        if (result.error)
          fail(
            Number(result.status) || 503,
            typeof result.error === 'string'
              ? result.error
              : 'Checking service unavailable.',
          );
        return result;
      }
      let owner: string | undefined;
      if (!deviceRoute) {
        if (!token) fail(401, 'Sign in to pair your VM.');
        const user = await upstream(
          `${c.url}/auth/v1/user`,
          {
            headers: {
              apikey: c.publishableKey,
              Authorization: `Bearer ${token}`,
            },
          },
          true,
        );
        if (!uuid(user.id)) fail(401, 'Sign in again.');
        owner = String(user.id);
      }
      if (key === 'pairings' && method === 'GET')
        return reply(await rpc('list', { owner }));
      if (key === 'pairings' && method === 'POST') {
        if (body.lessonId !== 'lab-04')
          fail(422, 'No reviewed check pack for this lesson.');
        const e = body.expected as Partial<DC01Expected> | undefined;
        if (
          !e ||
          !['hostname', 'ipv4', 'domain', 'dns'].every(
            (k) => typeof e[k as keyof DC01Expected] === 'string',
          ) ||
          typeof e.prefix !== 'number'
        )
          fail(400, 'Complete your lab plan.');
        const expected = {
          hostname: e.hostname!,
          ipv4: e.ipv4!,
          prefix: e.prefix!,
          domain: e.domain!,
          dns: e.dns!,
        };
        const invalid = validateDC01Expected(expected);
        if (invalid) fail(422, invalid);
        const code = randomBytes(10).toString('hex').toUpperCase();
        return reply({
          ...(await rpc('create', {
            owner,
            lessonId: 'lab-04',
            expected,
            codeHash: hashSecret(code),
          })),
          enrollmentCode: code.match(/.{4}/g)!.join('-'),
        });
      }
      if (key === 'enroll' && method === 'POST') {
        const code = string(body.code, 30).replaceAll('-', '').toUpperCase(),
          hostname = string(body.hostname, 63);
        if (
          !/^[A-F0-9]{20}$/.test(code) ||
          !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(hostname)
        )
          fail(400, 'Check the pairing code and VM name.');
        const deviceToken = secret(),
          confirmation = String(randomInt(100000, 1000000));
        return reply({
          ...(await rpc('enroll', {
            codeHash: hashSecret(code),
            hostname,
            deviceHash: hashSecret(deviceToken),
            confirmationHash: hashSecret(confirmation),
          })),
          deviceToken,
          confirmation,
        });
      }
      if (key === 'poll' && method === 'POST') {
        if (!token) fail(401, 'Pair this checker first.');
        const leaseToken = secret();
        const result = await rpc('poll', {
          deviceHash: hashSecret(token),
          leaseHash: hashSecret(leaseToken),
        });
        if (result.job) (result.job as Payload).leaseToken = leaseToken;
        return reply(result);
      }
      if (/^runs\/[^/]+\/observations$/.test(key) && method === 'POST') {
        if (
          !token ||
          !uuid(path[1]) ||
          !/^[A-Za-z0-9_-]{43}$/.test(string(body.leaseToken))
        )
          fail(400, 'Invalid run credentials.');
        const arg = {
          deviceHash: hashSecret(token),
          runId: path[1],
          leaseHash: hashSecret(String(body.leaseToken)),
        };
        const snapshot = await rpc('prepare-submit', arg);
        let report;
        try {
          report = parseLocalLabReport(JSON.stringify(body.report));
        } catch {
          fail(422, 'Use a valid current DC01 report.');
        }
        if (report!.demo)
          fail(422, 'Demo evidence cannot be submitted as a live run.');
        const results = checkDC01(report!, snapshot.expected as DC01Expected);
        return reply(
          await rpc('submit', {
            ...arg,
            result: {
              checks: results,
              collectedAt: report!.collectedAt,
              provenance: 'paired-checker-observations',
            },
          }),
        );
      }
      if (path[0] === 'pairings' && uuid(path[1])) {
        const arg = { owner, pairingId: path[1] };
        if (path.length === 2 && method === 'GET')
          return reply(await rpc('status', arg));
        if (path.length === 2 && method === 'DELETE')
          return reply(await rpc('revoke', arg));
        if (path.length === 3 && path[2] === 'approve' && method === 'POST') {
          const confirmation = string(body.confirmation, 6);
          if (!/^\d{6}$/.test(confirmation))
            fail(400, 'Enter the six-digit VM confirmation.');
          return reply(
            await rpc('approve', {
              ...arg,
              confirmationHash: hashSecret(confirmation),
            }),
          );
        }
        if (path.length === 3 && path[2] === 'runs' && method === 'POST')
          return reply(await rpc('request', arg));
        if (
          path.length === 4 &&
          path[2] === 'runs' &&
          uuid(path[3]) &&
          method === 'GET'
        )
          return reply(await rpc('results', { ...arg, runId: path[3] }));
      }
      return reply({ error: 'Unknown lab connection operation.' }, 404);
    } catch (error) {
      return reply(
        {
          error:
            error instanceof LabLinkError
              ? error.message
              : 'Checking service unavailable. Try again.',
        },
        error instanceof LabLinkError ? error.status : 503,
      );
    }
  };
}
