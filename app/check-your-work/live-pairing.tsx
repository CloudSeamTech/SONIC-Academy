'use client';
import { useEffect, useState } from 'react';
type Plan = {
  hostname: string;
  ipv4: string;
  prefix: number;
  domain: string;
  dns: string;
};
type Machine = {
  pairingId: string;
  hostname: string | null;
  state: string;
  expected: Plan;
};
type Status = {
  hostname?: string;
  state: string;
  connected: boolean;
  lastSeen?: string;
};
type Result = {
  id: string;
  title: string;
  status: string;
  expected: string;
  observed: string;
  repair: string;
};
const initial: Plan = {
  hostname: '',
  ipv4: '',
  prefix: 24,
  domain: '',
  dns: '',
};
export function LivePairing({
  lessonId,
  onHelp,
}: {
  lessonId: string;
  onHelp: () => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [release, setRelease] = useState<{
    version: string;
    downloadUrl: string;
    sha256: string;
    publisher: string;
  } | null>(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [sent, setSent] = useState(false);
  const [plan, setPlan] = useState<Plan>(initial);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [pairing, setPairing] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [run, setRun] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function api<T = Record<string, never>>(
    path: string,
    method = 'GET',
    body?: unknown,
    access = token,
  ) {
    const response = await fetch(`/api/lab-link/${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) {
      if (response.status === 401) setToken('');
      throw new Error(data.error || 'Connection request failed. Try again.');
    }
    return data;
  }
  async function action(work: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      await work();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/lab-link/availability', {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (r) => {
        const data = (await r.json()) as {
          available?: boolean;
          release?: {
            version: string;
            downloadUrl: string;
            sha256: string;
            publisher: string;
          };
        };
        if (!controller.signal.aborted) {
          setAvailable(r.ok && data.available === true);
          setRelease(data.release ?? null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailable(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!token || !pairing) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function poll() {
      try {
        const response = await fetch(`/api/lab-link/pairings/${pairing}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(12000),
          ]),
        });
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? 'Sign in again.'
              : 'Status unavailable. Reconnect to retry.',
          );
        const next = (await response.json()) as Status;
        if (stopped) return;
        setStatus(next);
        if (run) {
          const r = await fetch(
            `/api/lab-link/pairings/${pairing}/runs/${run}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
              signal: AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(12000),
              ]),
            },
          );
          if (!r.ok) throw new Error('Could not refresh check results.');
          const data = (await r.json()) as {
            state: string;
            result: { checks: Result[] };
          };
          if (stopped) return;
          if (data.state === 'complete') {
            setResults(data.result.checks);
            setRun('');
            setMessage('Checks finished. Review every result below.');
          }
          if (data.state === 'cancelled') {
            setRun('');
            setMessage('This run was cancelled.');
          }
        }
      } catch (error) {
        if (!stopped) {
          setStatus({ state: 'status-unavailable', connected: false });
          setMessage(
            error instanceof Error ? error.message : 'Status unavailable.',
          );
        }
      }
      if (!stopped) timer = setTimeout(poll, 10000);
    }
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [token, pairing, run]);
  return (
    <section
      className="check-work-connection"
      aria-labelledby="live-connection-heading"
    >
      <h2 id="live-connection-heading">Secure live connection</h2>
      {available === null ? (
        <output>Checking service availability…</output>
      ) : !available ? (
        <>
          <p>
            <strong>Not connected · setup and release testing required.</strong>{' '}
            Pairing is disabled until the account service, database and signed
            checker are ready. Local-report checking is available below.
          </p>
          <button type="button" disabled>
            Pair a machine · unavailable
          </button>
          <button type="button" onClick={onHelp}>
            See the connection process
          </button>
        </>
      ) : lessonId !== 'lab-04' ? (
        <p>
          This class does not have a released automated check pack yet. No
          connection will be created.
        </p>
      ) : (
        <>
          <p>
            Runs inside your DC01 VM. No public IP, router changes or RDP/SSH
            password required. Your VM needs outbound HTTPS.
          </p>
          {release && (
            <details>
              <summary>Download and open the Windows checker</summary>
              <p>
                Inside DC01,{' '}
                <a href={release.downloadUrl}>
                  download checker {release.version}
                </a>
                . Verify its SHA-256: <code>{release.sha256}</code>. Extract the
                ZIP and check that both PowerShell files have a valid publisher
                signature from {release.publisher}.
              </p>
              <p>
                Open PowerShell in the extracted folder and type{' '}
                <code>.\CloudSeam-LabLink.ps1</code>. If your execution policy
                blocks it or the signature differs, stop and contact your lab
                administrator. Keep it open while checking; Ctrl+C stops it.
              </p>
            </details>
          )}
          {!token ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action(async () => {
                  if (!sent) {
                    await api('login/start', 'POST', { email });
                    setSent(true);
                    setMessage('Check your email for the sign-in code.');
                  } else {
                    const session = await api<{ accessToken: string }>(
                      'login/verify',
                      'POST',
                      {
                        email,
                        code: emailCode,
                      },
                    );
                    setToken(session.accessToken);
                    setEmailCode('');
                    const list = await api<{ pairings: Machine[] }>(
                      'pairings',
                      'GET',
                      undefined,
                      session.accessToken,
                    );
                    setMachines(list.pairings ?? []);
                    setMessage('Signed in for lab checks.');
                  }
                });
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sent}
                />
              </label>
              {sent && (
                <label>
                  Email sign-in code
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6,8}"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                  />
                </label>
              )}
              <button disabled={busy} type="submit">
                {sent ? 'Sign in' : 'Email me a code'}
              </button>
              {sent && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setSent(false);
                    setEmailCode('');
                  }}
                >
                  Use another email / resend
                </button>
              )}
            </form>
          ) : (
            <>
              <p>
                Signed in for lab checks. This session stays in this tab; the
                existing learning profile and progress are unchanged.
              </p>
              {machines.length > 0 && (
                <label>
                  Previously paired machines
                  <select
                    value={pairing}
                    onChange={(e) => {
                      setPairing(e.target.value);
                      setEnrollment('');
                      setStatus(null);
                      setRun('');
                      setResults([]);
                    }}
                  >
                    <option value="">
                      Choose a machine, or pair a new one below
                    </option>
                    {machines.map((m) => (
                      <option key={m.pairingId} value={m.pairingId}>
                        {m.hostname ?? 'Waiting for checker'} · {m.state}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {!pairing && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void action(async () => {
                      const created = await api<{
                        pairingId: string;
                        enrollmentCode: string;
                      }>('pairings', 'POST', {
                        lessonId,
                        expected: plan,
                      });
                      setPairing(created.pairingId);
                      setEnrollment(created.enrollmentCode);
                      setStatus(null);
                      setResults([]);
                    });
                  }}
                >
                  <h3>Your DC01 lab plan</h3>
                  <p>
                    Use the values you configured in the lesson. Short name DC01
                    + domain lab.example.test = FQDN DC01.lab.example.test.
                  </p>
                  {(
                    [
                      {
                        key: 'hostname',
                        label: 'Short computer name',
                        example: 'DC01',
                      },
                      {
                        key: 'ipv4',
                        label: 'Server IPv4 address',
                        example: '10.50.0.10',
                      },
                      { key: 'prefix', label: 'Network prefix', example: '24' },
                      {
                        key: 'domain',
                        label: 'DNS domain',
                        example: 'lab.example.test',
                      },
                      {
                        key: 'dns',
                        label: 'DNS server IPv4 address',
                        example: '10.50.0.10',
                      },
                    ] as const
                  ).map((f) => (
                    <label key={f.key}>
                      {f.label}
                      <input
                        required
                        type={f.key === 'prefix' ? 'number' : 'text'}
                        min={f.key === 'prefix' ? 1 : undefined}
                        max={f.key === 'prefix' ? 32 : undefined}
                        placeholder={f.example}
                        value={plan[f.key]}
                        onChange={(e) =>
                          setPlan((p) => ({
                            ...p,
                            [f.key]:
                              f.key === 'prefix'
                                ? Number(e.target.value)
                                : e.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                  <button disabled={busy} type="submit">
                    Pair a machine
                  </button>
                </form>
              )}
              {pairing && (
                <>
                  <output>
                    <strong>
                      {status?.connected
                        ? 'Connected'
                        : (status?.state ?? 'Waiting for checker')}
                    </strong>
                    {status?.hostname ? ` · ${status.hostname}` : ''}. Connected
                    means recent contact, not that the class passed.
                  </output>
                  {enrollment && (
                    <p>
                      Open the released checker inside DC01 and type this
                      pairing code within 10 minutes:{' '}
                      <strong>
                        <code>{enrollment}</code>
                      </strong>
                      . It will display a different, six-digit confirmation
                      number.
                    </p>
                  )}
                  {status?.state === 'awaiting-approval' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void action(async () => {
                          await api(`pairings/${pairing}/approve`, 'POST', {
                            confirmation,
                          });
                          setConfirmation('');
                          setEnrollment('');
                          setMessage(
                            'Approved. Waiting for the checker to contact the service.',
                          );
                        });
                      }}
                    >
                      <label>
                        Confirmation number shown inside this VM
                        <input
                          required
                          pattern="[0-9]{6}"
                          inputMode="numeric"
                          value={confirmation}
                          onChange={(e) => setConfirmation(e.target.value)}
                        />
                      </label>
                      <button disabled={busy} type="submit">
                        Approve this VM
                      </button>
                    </form>
                  )}
                  <button
                    disabled={busy || !status?.connected || Boolean(run)}
                    type="button"
                    onClick={() =>
                      void action(async () => {
                        const r = await api<{ runId: string }>(
                          `pairings/${pairing}/runs`,
                          'POST',
                          {},
                        );
                        setRun(r.runId);
                        setResults([]);
                        setMessage(
                          'Queued. The checker will collect the approved observations.',
                        );
                      })
                    }
                  >
                    {run ? 'Checks queued / running…' : 'Run class checks'}
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() =>
                      void action(async () => {
                        await api(`pairings/${pairing}`, 'DELETE');
                        setStatus({ state: 'revoked', connected: false });
                        setEnrollment('');
                        setRun('');
                        setMessage(
                          'Device access revoked. Stop the checker inside the VM.',
                        );
                      })
                    }
                  >
                    Revoke device access
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() => {
                      setPairing('');
                      setEnrollment('');
                      setStatus(null);
                      setRun('');
                      setResults([]);
                    }}
                  >
                    Choose another machine
                  </button>
                </>
              )}
              {results.length > 0 && (
                <ul className="lab-link-results">
                  {results.map((r) => (
                    <li key={r.id}>
                      <strong>
                        {r.status === 'pass'
                          ? '✓ Pass'
                          : r.status === 'fail'
                            ? '✕ Needs attention'
                            : '— Not checked'}{' '}
                        · {r.title}
                      </strong>
                      <p>
                        Expected: {r.expected}
                        <br />
                        Observed: {r.observed}
                      </p>
                      {r.status !== 'pass' && <p>Next: {r.repair}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => {
                  setToken('');
                  setPairing('');
                  setStatus(null);
                  setEnrollment('');
                  setRun('');
                  setResults([]);
                  setSent(false);
                  setMessage(
                    'Signed out of this tab. Device access expires separately; use Revoke to end it immediately.',
                  );
                }}
              >
                Sign out of lab checks
              </button>
            </>
          )}
        </>
      )}
      {message && <output>{message}</output>}
    </section>
  );
}
